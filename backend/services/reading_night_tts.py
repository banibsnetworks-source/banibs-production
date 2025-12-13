"""
Reading Night - TTS Audio Service v1.0
Generates spoken audio from Book Vault content using OpenAI TTS

Features:
- Warm, calm, steady voice (using 'onyx' or 'echo' voice)
- Pace control targeting 155-165 WPM
- Paragraph pauses (0.5-1 sec) and section pauses (2 sec)
- Audio caching to reduce regeneration
"""

import os
import logging
import re
import asyncio
from typing import Optional, List, Tuple
from datetime import datetime, timezone
from uuid import uuid4
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# TTS Configuration
TTS_MODEL = "tts-1-hd"  # High quality for audiobook-style content
TTS_VOICE = "onyx"       # Deep, authoritative, calm - good for reflective content
TTS_SPEED = 0.9          # Slightly slower for comprehension (approx 155-165 WPM)
TTS_FORMAT = "mp3"

# Pause markers (will be converted to silence in post-processing or SSML)
PARAGRAPH_PAUSE = "[PAUSE:0.7]"  # 0.7 second pause
SECTION_PAUSE = "[PAUSE:2.0]"   # 2 second pause

# Character limit per TTS request
MAX_CHARS_PER_REQUEST = 4000


class ReadingNightTTSService:
    """Service for generating Reading Night audio"""
    
    def __init__(self):
        self.api_key = os.getenv("EMERGENT_LLM_KEY")
        if not self.api_key:
            logger.warning("EMERGENT_LLM_KEY not found - TTS will not work")
        self._tts_client = None
    
    async def _get_tts_client(self):
        """Lazy initialization of TTS client"""
        if self._tts_client is None:
            try:
                from emergentintegrations.llm.openai import OpenAITextToSpeech
                self._tts_client = OpenAITextToSpeech(api_key=self.api_key)
                logger.info("TTS client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize TTS client: {e}")
                raise
        return self._tts_client
    
    def prepare_text_for_reading(self, content: str, include_pauses: bool = True) -> str:
        """
        Prepare text for TTS reading with appropriate pacing markers.
        
        - Adds pause markers after paragraphs
        - Adds longer pauses at section breaks
        - Cleans up formatting
        """
        if not content:
            return ""
        
        # Clean up the text
        text = content.strip()
        
        # Remove markdown bold/italic markers but keep the text
        text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)  # **bold**
        text = re.sub(r'\*([^*]+)\*', r'\1', text)       # *italic*
        text = re.sub(r'__([^_]+)__', r'\1', text)       # __bold__
        text = re.sub(r'_([^_]+)_', r'\1', text)         # _italic_
        
        # Remove markdown headers but keep text
        text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
        
        # Remove markdown links but keep link text
        text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
        
        # Remove horizontal rules
        text = re.sub(r'^-{3,}$', '', text, flags=re.MULTILINE)
        text = re.sub(r'^\*{3,}$', '', text, flags=re.MULTILINE)
        
        if include_pauses:
            # Add section pauses at double line breaks (section breaks)
            text = re.sub(r'\n\n\n+', f'\n\n{SECTION_PAUSE}\n\n', text)
            
            # Add paragraph pauses at single paragraph breaks
            # But not if there's already a section pause
            lines = text.split('\n\n')
            processed_lines = []
            for i, line in enumerate(lines):
                processed_lines.append(line.strip())
                # Add paragraph pause if not at end and not a section pause
                if i < len(lines) - 1 and SECTION_PAUSE not in line:
                    if SECTION_PAUSE not in lines[i + 1]:
                        processed_lines.append(PARAGRAPH_PAUSE)
            
            text = '\n\n'.join(processed_lines)
        
        # Clean up extra whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' +', ' ', text)
        
        return text.strip()
    
    def estimate_duration_seconds(self, text: str, wpm: int = 160) -> int:
        """
        Estimate audio duration based on word count and target WPM.
        
        Args:
            text: The text to be read
            wpm: Target words per minute (default 160 for standard circle)
        
        Returns:
            Estimated duration in seconds
        """
        # Remove pause markers for word count
        clean_text = re.sub(r'\[PAUSE:[0-9.]+\]', '', text)
        words = len(clean_text.split())
        
        # Base reading time
        reading_seconds = (words / wpm) * 60
        
        # Add pause time
        paragraph_pauses = text.count(PARAGRAPH_PAUSE) * 0.7
        section_pauses = text.count(SECTION_PAUSE) * 2.0
        
        total_seconds = reading_seconds + paragraph_pauses + section_pauses
        
        return int(total_seconds)
    
    def count_words(self, text: str) -> int:
        """Count words in text (excluding pause markers)"""
        clean_text = re.sub(r'\[PAUSE:[0-9.]+\]', '', text)
        return len(clean_text.split())
    
    def split_text_for_tts(self, text: str) -> List[str]:
        """
        Split text into chunks that fit within TTS character limit.
        Tries to split at natural boundaries (paragraphs, sentences).
        """
        if len(text) <= MAX_CHARS_PER_REQUEST:
            return [text]
        
        chunks = []
        current_chunk = ""
        
        # Split by paragraphs first
        paragraphs = text.split('\n\n')
        
        for para in paragraphs:
            # If adding this paragraph would exceed limit
            if len(current_chunk) + len(para) + 2 > MAX_CHARS_PER_REQUEST:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk = ""
                
                # If single paragraph is too long, split by sentences
                if len(para) > MAX_CHARS_PER_REQUEST:
                    sentences = re.split(r'(?<=[.!?])\s+', para)
                    for sentence in sentences:
                        if len(current_chunk) + len(sentence) + 1 > MAX_CHARS_PER_REQUEST:
                            if current_chunk:
                                chunks.append(current_chunk.strip())
                            current_chunk = sentence
                        else:
                            current_chunk += " " + sentence if current_chunk else sentence
                else:
                    current_chunk = para
            else:
                current_chunk += "\n\n" + para if current_chunk else para
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    
    async def generate_audio_chunk(self, text: str) -> bytes:
        """
        Generate audio for a single text chunk.
        
        Note: Pause markers are handled by adding silence in post-processing,
        or by the natural speech patterns of the TTS.
        """
        tts = await self._get_tts_client()
        
        # Remove pause markers - TTS doesn't understand them
        # We'll handle pauses in post-processing or rely on natural speech
        clean_text = text.replace(PARAGRAPH_PAUSE, '... ').replace(SECTION_PAUSE, '...... ')
        
        try:
            audio_bytes = await tts.generate_speech(
                text=clean_text,
                model=TTS_MODEL,
                voice=TTS_VOICE,
                speed=TTS_SPEED,
                response_format=TTS_FORMAT
            )
            return audio_bytes
        except Exception as e:
            logger.error(f"TTS generation failed: {e}")
            raise
    
    async def generate_full_audio(self, content: str, intro_text: Optional[str] = None, 
                                   outro_text: Optional[str] = None) -> Tuple[bytes, dict]:
        """
        Generate full audio for a reading session.
        
        Args:
            content: Main reading content
            intro_text: Optional intro narration
            outro_text: Optional outro narration
        
        Returns:
            Tuple of (audio_bytes, metadata_dict)
        """
        # Prepare all text
        full_text = ""
        
        if intro_text:
            full_text += self.prepare_text_for_reading(intro_text) + f"\n\n{SECTION_PAUSE}\n\n"
        
        full_text += self.prepare_text_for_reading(content)
        
        if outro_text:
            full_text += f"\n\n{SECTION_PAUSE}\n\n" + self.prepare_text_for_reading(outro_text)
        
        # Calculate metadata
        word_count = self.count_words(full_text)
        estimated_duration = self.estimate_duration_seconds(full_text)
        
        # Split into chunks
        chunks = self.split_text_for_tts(full_text)
        
        logger.info(f"Generating audio: {word_count} words, {len(chunks)} chunks, ~{estimated_duration}s")
        
        # Generate audio for each chunk
        audio_parts = []
        for i, chunk in enumerate(chunks):
            logger.info(f"Generating chunk {i+1}/{len(chunks)} ({len(chunk)} chars)")
            try:
                audio = await self.generate_audio_chunk(chunk)
                audio_parts.append(audio)
            except Exception as e:
                logger.error(f"Failed to generate chunk {i+1}: {e}")
                raise
        
        # Combine audio parts (simple concatenation for MP3)
        combined_audio = b''.join(audio_parts)
        
        metadata = {
            "word_count": word_count,
            "estimated_duration_seconds": estimated_duration,
            "chunks_generated": len(chunks),
            "model": TTS_MODEL,
            "voice": TTS_VOICE,
            "speed": TTS_SPEED,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
        return combined_audio, metadata


# Singleton instance
_tts_service = None

def get_tts_service() -> ReadingNightTTSService:
    """Get singleton TTS service instance"""
    global _tts_service
    if _tts_service is None:
        _tts_service = ReadingNightTTSService()
    return _tts_service
