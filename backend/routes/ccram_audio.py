"""
CCRAM Audio API Routes - Phase 2
Speech-to-Text and Text-to-Speech endpoints
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import List, Optional
import base64

from services.ccram_audio_service import ccram_audio_service
from services.ccram_service import ccram_service
from models.ccram import CCRAMRequest, CCRAMOutput, TopicPack

router = APIRouter(prefix="/api/ccram/audio", tags=["CCRAM Audio"])


class TranscribeRequest(BaseModel):
    """Request with base64 encoded audio"""
    audio_base64: str = Field(..., description="Base64 encoded audio data")
    session_id: str = Field(default="default", description="Session ID for mute state")
    language: str = Field(default="en", description="Audio language (ISO-639-1)")


class TranscribeResponse(BaseModel):
    """Transcription result"""
    transcript: Optional[str]
    error: Optional[str]
    muted: bool = False


class EarpieceCueRequest(BaseModel):
    """Request for earpiece TTS cue"""
    cue_text: str = Field(..., description="Short text to speak (3-8 words ideal)")
    session_id: str = Field(default="default")
    voice: str = Field(default="nova", description="TTS voice: alloy, nova, shimmer, onyx, echo")
    speed: float = Field(default=1.2, ge=0.25, le=4.0, description="Speech speed")


class EarpieceCueResponse(BaseModel):
    """TTS audio response"""
    cue: str
    audio_base64: Optional[str]
    audio_url: Optional[str] = None  # Data URL for direct playback
    error: Optional[str]
    muted: bool = False


class FullPipelineRequest(BaseModel):
    """Full audio pipeline: Transcribe -> Analyze -> Generate TTS cues"""
    audio_base64: str = Field(..., description="Base64 encoded audio")
    session_id: str = Field(default="default")
    topic_pack: TopicPack = Field(default=TopicPack.GENERAL)
    language: str = Field(default="en")
    generate_tts: bool = Field(default=True, description="Generate earpiece TTS cues")
    tts_voice: str = Field(default="nova")


class FullPipelineResponse(BaseModel):
    """Full pipeline response"""
    transcript: Optional[str]
    analysis: Optional[CCRAMOutput]
    earpiece_audio: Optional[List[dict]]  # List of {cue, audio_base64}
    latency_ms: float
    error: Optional[str]
    muted: bool = False


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(request: TranscribeRequest):
    """
    Transcribe audio to text using Whisper.
    
    Privacy: Audio is processed in memory only - NOT stored.
    Push-to-listen model - call only when user is actively speaking.
    """
    # Check if session is muted
    if ccram_audio_service.is_session_muted(request.session_id):
        return TranscribeResponse(
            transcript=None,
            error=None,
            muted=True
        )
    
    try:
        # Decode base64 audio
        audio_bytes = base64.b64decode(request.audio_base64)
        
        # Transcribe
        transcript, error = await ccram_audio_service.transcribe_audio(
            audio_bytes=audio_bytes,
            session_id=request.session_id,
            language=request.language
        )
        
        return TranscribeResponse(
            transcript=transcript,
            error=error,
            muted=False
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.post("/transcribe-file")
async def transcribe_audio_file(
    file: UploadFile = File(...),
    session_id: str = Form(default="default"),
    language: str = Form(default="en")
):
    """
    Transcribe uploaded audio file.
    
    Supports: mp3, mp4, mpeg, mpga, m4a, wav, webm
    Max size: 25MB
    """
    if ccram_audio_service.is_session_muted(session_id):
        return {"transcript": None, "error": None, "muted": True}
    
    try:
        audio_bytes = await file.read()
        
        # Size check (25MB limit)
        if len(audio_bytes) > 25 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 25MB)")
        
        transcript, error = await ccram_audio_service.transcribe_audio(
            audio_bytes=audio_bytes,
            session_id=session_id,
            language=language
        )
        
        return {
            "transcript": transcript,
            "error": error,
            "muted": False,
            "filename": file.filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/earpiece-cue", response_model=EarpieceCueResponse)
async def generate_earpiece_cue(request: EarpieceCueRequest):
    """
    Generate TTS audio for earpiece anchor cue.
    
    Optimized for short cues (3-8 words).
    Returns base64 audio + data URL for direct playback.
    """
    if ccram_audio_service.is_session_muted(request.session_id):
        return EarpieceCueResponse(
            cue=request.cue_text,
            audio_base64=None,
            error=None,
            muted=True
        )
    
    try:
        audio_base64, error = await ccram_audio_service.generate_earpiece_cue(
            cue_text=request.cue_text,
            session_id=request.session_id,
            voice=request.voice,
            speed=request.speed
        )
        
        audio_url = f"data:audio/mp3;base64,{audio_base64}" if audio_base64 else None
        
        return EarpieceCueResponse(
            cue=request.cue_text,
            audio_base64=audio_base64,
            audio_url=audio_url,
            error=error,
            muted=False
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/full-pipeline", response_model=FullPipelineResponse)
async def full_audio_pipeline(request: FullPipelineRequest):
    """
    Full real-time pipeline: Audio -> Transcript -> CCR Analysis -> TTS Cues
    
    Single endpoint for embodied anchoring workflow:
    1. Transcribe incoming audio (Whisper)
    2. Analyze transcript for trap types (CCR Router)
    3. Generate CCR responses (10s/30s/60s)
    4. Generate earpiece TTS cues (optional)
    
    Latency tracking included for performance monitoring.
    """
    import time
    start_time = time.time()
    
    # Check mute state
    if ccram_audio_service.is_session_muted(request.session_id):
        return FullPipelineResponse(
            transcript=None,
            analysis=None,
            earpiece_audio=None,
            latency_ms=0,
            error=None,
            muted=True
        )
    
    try:
        # Step 1: Transcribe
        audio_bytes = base64.b64decode(request.audio_base64)
        transcript, trans_error = await ccram_audio_service.transcribe_audio(
            audio_bytes=audio_bytes,
            session_id=request.session_id,
            language=request.language
        )
        
        if trans_error or not transcript:
            return FullPipelineResponse(
                transcript=None,
                analysis=None,
                earpiece_audio=None,
                latency_ms=(time.time() - start_time) * 1000,
                error=trans_error or "Empty transcript",
                muted=False
            )
        
        # Step 2: Analyze with CCR Router
        ccram_request = CCRAMRequest(
            question=transcript,
            topic_pack=request.topic_pack,
            session_id=request.session_id
        )
        analysis = await ccram_service.process_question(ccram_request)
        
        # Step 3: Generate TTS cues (if requested)
        earpiece_audio = None
        if request.generate_tts and analysis.earpiece_cues:
            earpiece_audio = await ccram_audio_service.generate_anchor_cues(
                cues=analysis.earpiece_cues,
                session_id=request.session_id,
                voice=request.tts_voice
            )
        
        latency_ms = (time.time() - start_time) * 1000
        
        return FullPipelineResponse(
            transcript=transcript,
            analysis=analysis,
            earpiece_audio=earpiece_audio,
            latency_ms=latency_ms,
            error=None,
            muted=False
        )
        
    except Exception as e:
        return FullPipelineResponse(
            transcript=None,
            analysis=None,
            earpiece_audio=None,
            latency_ms=(time.time() - start_time) * 1000,
            error=str(e),
            muted=False
        )


@router.get("/voices")
async def get_available_voices():
    """
    Get available TTS voices for earpiece cues.
    """
    return {
        "voices": [
            {"id": "alloy", "name": "Alloy", "description": "Neutral, balanced"},
            {"id": "nova", "name": "Nova", "description": "Energetic, upbeat (recommended)"},
            {"id": "shimmer", "name": "Shimmer", "description": "Bright, cheerful"},
            {"id": "onyx", "name": "Onyx", "description": "Deep, authoritative"},
            {"id": "echo", "name": "Echo", "description": "Smooth, calm"},
            {"id": "fable", "name": "Fable", "description": "Expressive, storytelling"},
            {"id": "sage", "name": "Sage", "description": "Wise, measured"},
            {"id": "ash", "name": "Ash", "description": "Clear, articulate"},
            {"id": "coral", "name": "Coral", "description": "Warm, friendly"}
        ],
        "default": "nova",
        "recommended_for_cues": ["nova", "sage", "onyx"]
    }
