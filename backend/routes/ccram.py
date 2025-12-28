"""
CCRAM API Routes
CCR Anchor Module endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import List

from models.ccram import (
    CCRAMRequest, CCRAMOutput, PanicMuteRequest, TestQuestion, TrapType, TopicPack
)
from services.ccram_service import ccram_service
from services.ccram_templates import TRAP_DEFINITIONS, TOPIC_PACKS

router = APIRouter(prefix="/api/ccram", tags=["CCRAM"])


@router.post("/analyze", response_model=CCRAMOutput)
async def analyze_question(request: CCRAMRequest):
    """
    Analyze a question and generate CCR-anchored responses.
    
    - Classifies trap type
    - Generates 3 response lengths (10s/30s/60s)
    - Provides glasses cards and earpiece cues
    """
    try:
        result = await ccram_service.process_question(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/panic-mute")
async def panic_mute(request: PanicMuteRequest):
    """
    Panic Mute: Instantly stop listening and clear buffer.
    
    Privacy feature - immediately halts processing.
    """
    # Import here to avoid circular imports
    from services.ccram_audio_service import ccram_audio_service
    
    # Set panic mute in audio service
    ccram_audio_service.set_panic_mute(request.session_id, True)
    
    return {
        "status": "muted",
        "session_id": request.session_id,
        "buffer_cleared": request.clear_buffer,
        "message": "All listening stopped. Buffer cleared."
    }


@router.get("/trap-types")
async def get_trap_types():
    """
    Get all CCR trap type definitions.
    
    Useful for understanding classification categories.
    """
    return {
        "trap_types": [
            {
                "key": key,
                "name": info["name"],
                "description": info["description"],
                "examples": info["examples"],
                "ccr_principle": info["ccr_principle"]
            }
            for key, info in TRAP_DEFINITIONS.items()
        ]
    }


@router.get("/topic-packs")
async def get_topic_packs():
    """
    Get all available topic packs.
    
    Topic packs provide context-specific mechanism examples.
    """
    return {
        "topic_packs": [
            {
                "key": key,
                "name": info["name"],
                "core_concepts": info["core_concepts"],
                "key_phrases": info["key_phrases"]
            }
            for key, info in TOPIC_PACKS.items()
        ]
    }


@router.get("/test-suite")
async def get_test_suite():
    """
    Get the hostile interview test suite.
    
    30 test questions for validation.
    """
    test_questions = [
        # Identity Traps
        TestQuestion(id="id-1", question="Are you claiming to be Elijah?", expected_trap_types=[TrapType.IDENTITY]),
        TestQuestion(id="id-2", question="Who do you think you are?", expected_trap_types=[TrapType.IDENTITY]),
        TestQuestion(id="id-3", question="Do you consider yourself a prophet?", expected_trap_types=[TrapType.IDENTITY]),
        
        # Motive Traps
        TestQuestion(id="mot-1", question="This is just about money for you, isn't it?", expected_trap_types=[TrapType.MOTIVE]),
        TestQuestion(id="mot-2", question="You're doing this for power and attention", expected_trap_types=[TrapType.MOTIVE]),
        TestQuestion(id="mot-3", question="What's really in it for you?", expected_trap_types=[TrapType.MOTIVE]),
        
        # Urgency Traps
        TestQuestion(id="urg-1", question="Just answer yes or no right now", expected_trap_types=[TrapType.URGENCY]),
        TestQuestion(id="urg-2", question="Stop dodging and give me a straight answer", expected_trap_types=[TrapType.URGENCY]),
        TestQuestion(id="urg-3", question="I need a definitive answer in the next 10 seconds", expected_trap_types=[TrapType.URGENCY]),
        
        # Gotcha Traps
        TestQuestion(id="got-1", question="But you said the opposite last year", expected_trap_types=[TrapType.GOTCHA]),
        TestQuestion(id="got-2", question="That directly contradicts what you wrote in your book", expected_trap_types=[TrapType.GOTCHA]),
        TestQuestion(id="got-3", question="Isn't that hypocritical given your past statements?", expected_trap_types=[TrapType.GOTCHA]),
        
        # Smear Frames
        TestQuestion(id="smr-1", question="So you're basically running a cult?", expected_trap_types=[TrapType.SMEAR]),
        TestQuestion(id="smr-2", question="Critics say you're a fraud and a grifter", expected_trap_types=[TrapType.SMEAR]),
        TestQuestion(id="smr-3", question="This sounds like extremist ideology", expected_trap_types=[TrapType.SMEAR]),
        
        # Scope Creep
        TestQuestion(id="scp-1", question="Explain your entire philosophy in the next minute", expected_trap_types=[TrapType.SCOPE_CREEP]),
        TestQuestion(id="scp-2", question="How does all of this connect to everything else you believe?", expected_trap_types=[TrapType.SCOPE_CREEP]),
        TestQuestion(id="scp-3", question="Give me the complete picture of your worldview right now", expected_trap_types=[TrapType.SCOPE_CREEP]),
        
        # Misquote Traps
        TestQuestion(id="mis-1", question="Didn't you say that all institutions should be destroyed?", expected_trap_types=[TrapType.MISQUOTE]),
        TestQuestion(id="mis-2", question="You claimed that only your way is right", expected_trap_types=[TrapType.MISQUOTE]),
        TestQuestion(id="mis-3", question="Your exact words were that everyone else is wrong", expected_trap_types=[TrapType.MISQUOTE]),
        
        # Evidence Traps
        TestQuestion(id="evi-1", question="Prove it scientifically right now", expected_trap_types=[TrapType.EVIDENCE]),
        TestQuestion(id="evi-2", question="Where's your peer-reviewed research?", expected_trap_types=[TrapType.EVIDENCE]),
        TestQuestion(id="evi-3", question="Can you demonstrate that empirically in the next 30 seconds?", expected_trap_types=[TrapType.EVIDENCE]),
        
        # False Binary
        TestQuestion(id="bin-1", question="Either you admit you're wrong or you're a liar", expected_trap_types=[TrapType.FALSE_BINARY]),
        TestQuestion(id="bin-2", question="Are you with us or against us?", expected_trap_types=[TrapType.FALSE_BINARY]),
        TestQuestion(id="bin-3", question="It's either this or that, which is it?", expected_trap_types=[TrapType.FALSE_BINARY]),
        
        # Combined/Complex
        TestQuestion(id="cplx-1", question="You're just a cult leader doing this for money - admit it yes or no", expected_trap_types=[TrapType.SMEAR, TrapType.MOTIVE, TrapType.FALSE_BINARY]),
        TestQuestion(id="cplx-2", question="If you're not a fraud, prove your claims scientifically right now", expected_trap_types=[TrapType.SMEAR, TrapType.EVIDENCE, TrapType.URGENCY]),
        TestQuestion(id="cplx-3", question="Who are you to say this? Name your credentials or stop talking", expected_trap_types=[TrapType.IDENTITY, TrapType.URGENCY]),
    ]
    
    return {
        "test_suite": [q.dict() for q in test_questions],
        "total_questions": len(test_questions),
        "trap_coverage": list(set([t.value for q in test_questions for t in q.expected_trap_types]))
    }


@router.post("/test-run")
async def run_test_question(question: TestQuestion):
    """
    Run a single test question through CCRAM.
    
    Returns analysis with pass/fail evaluation.
    """
    request = CCRAMRequest(
        question=question.question,
        topic_pack=question.topic_context or TopicPack.GENERAL
    )
    
    result = await ccram_service.process_question(request)
    
    # Evaluate if classification matches expected
    detected_traps = [result.classification.primary_trap] + result.classification.secondary_traps
    expected_traps = question.expected_trap_types
    
    matches = [t for t in expected_traps if t in detected_traps]
    pass_rate = len(matches) / len(expected_traps) if expected_traps else 1.0
    
    return {
        "question_id": question.id,
        "question": question.question,
        "expected_traps": [t.value for t in expected_traps],
        "detected_traps": [t.value for t in detected_traps],
        "matches": [t.value for t in matches],
        "pass_rate": pass_rate,
        "passed": pass_rate >= 0.5,
        "full_result": result.dict()
    }
