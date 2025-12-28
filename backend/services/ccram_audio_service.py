"""
CCRAM Audio Service - Phase 2
Speech-to-Text (Whisper) and Text-to-Speech for real-time embodied anchoring
"""
import os
import io
import base64
import uuid
from typing import Optional, Tuple
from datetime import datetime
from dotenv import load_dotenv

from emergentintegrations.llm.openai import OpenAISpeechToText, OpenAITextToSpeech

load_dotenv()


class CCRAMAudioService:
    """Audio processing for CCRAM - Push-to-Listen and Earpiece TTS"""
    
    def __init__(self):
        self.api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment")
        
        self.stt = OpenAISpeechToText(api_key=self.api_key)
        self.tts = OpenAITextToSpeech(api_key=self.api_key)
        
        # Privacy-first: No audio storage
        self._active_sessions = {}  # session_id -> muted status
    
    def is_session_muted(self, session_id: str) -> bool:
        """Check if session is in panic mute state"""
        return self._active_sessions.get(session_id, {}).get("muted", False)
    
    def set_panic_mute(self, session_id: str, muted: bool = True):
        """Set panic mute status for session"""
        if session_id not in self._active_sessions:
            self._active_sessions[session_id] = {}
        self._active_sessions[session_id]["muted"] = muted
    
    async def transcribe_audio(
        self,
        audio_bytes: bytes,
        session_id: str,
        language: str = "en"
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        Transcribe audio to text using Whisper.
        Returns (transcript, error_message)
        
        Privacy: Audio bytes are NOT stored - processed in memory only.
        """
        # Check panic mute
        if self.is_session_muted(session_id):
            return None, "Session is muted - no audio processing"
        
        try:
            # Create file-like object from bytes (no disk storage)
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = "audio.webm"  # Whisper needs a filename hint
            
            # Transcribe with Whisper
            response = await self.stt.transcribe(
                file=audio_file,
                model="whisper-1",
                response_format="json",
                language=language,
                prompt="This is a question or statement in an interview context. Transcribe accurately.",
                temperature=0.0  # Most deterministic
            )
            
            transcript = response.text.strip() if response and response.text else None
            
            # Privacy: Clear audio from memory
            audio_file.close()
            del audio_bytes
            
            return transcript, None
            
        except Exception as e:
            return None, f"Transcription failed: {str(e)}"
    
    async def generate_earpiece_cue(
        self,
        cue_text: str,
        session_id: str,
        voice: str = "nova",
        speed: float = 1.2
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        Generate short TTS audio for earpiece cues.
        Returns (base64_audio, error_message)
        
        Optimized for short cues (3-8 words).
        Uses faster speed for quick delivery.
        """
        # Check panic mute
        if self.is_session_muted(session_id):
            return None, "Session is muted - no audio output"
        
        # Validate cue length (3-8 words ideal)
        word_count = len(cue_text.split())
        if word_count > 15:
            cue_text = " ".join(cue_text.split()[:15])  # Truncate for safety
        
        try:
            # Generate TTS audio as base64 (no disk storage)
            audio_base64 = await self.tts.generate_speech_base64(
                text=cue_text,
                model="tts-1",  # Fast model for real-time cues
                voice=voice,
                speed=speed,
                response_format="mp3"
            )
            
            return audio_base64, None
            
        except Exception as e:
            return None, f"TTS generation failed: {str(e)}"
    
    async def generate_anchor_cues(
        self,
        cues: list,
        session_id: str,
        voice: str = "nova"
    ) -> list:
        """
        Generate multiple earpiece cues as a batch.
        Returns list of {cue, audio_base64, error}
        """
        results = []
        
        for cue in cues:
            audio, error = await self.generate_earpiece_cue(
                cue_text=cue,
                session_id=session_id,
                voice=voice
            )
            results.append({
                "cue": cue,
                "audio_base64": audio,
                "error": error
            })
        
        return results


# Singleton instance
ccram_audio_service = CCRAMAudioService()
