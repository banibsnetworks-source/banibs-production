"""
CCRAM Service
Core logic for CCR Router (classifier) and Response Generator
Includes NQR (No Quick Response) Timing Logic
"""
import os
import re
import json
import uuid
import math
from typing import List, Optional, Tuple
from datetime import datetime
from dotenv import load_dotenv

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENTINTEGRATIONS_AVAILABLE = True
except Exception:
    EMERGENTINTEGRATIONS_AVAILABLE = False

class CCRAMEmergentDisabled(Exception):
    pass

from models.ccram import (
    TrapType, TopicPack, ResponseLength, InputMode,
    CCRAMRequest, TrapClassification, CCRResponse, CCRAMOutput
)
from services.ccram_templates import (
    TRAP_DEFINITIONS, RESPONSE_TEMPLATES, TOPIC_PACKS,
    RED_FLAG_PATTERNS, RED_FLAG_RESPONSE,
    TIMING_BOUNDARY_LINES, ENGAGEMENT_RULE_NOTICES, PUBLIC_ENGAGEMENT_RULES,
    TIMING_EARPIECE_CUES, TIMING_GLASSES_CARDS
)

load_dotenv()


class CCRAMService:
    """CCR Anchor Module Service"""
    
    def __init__(self):
        self.api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment")
    
    def _check_red_flags(self, question: str) -> Tuple[bool, Optional[str]]:
        """Check if question triggers red flag patterns"""
        question_lower = question.lower()
        for pattern in RED_FLAG_PATTERNS:
            if pattern in question_lower:
                return True, f"Red flag triggered: '{pattern}' detected"
        return False, None
    
    def _count_words(self, text: str) -> int:
        """Count words in text"""
        return len(text.split())
    
    def _estimate_question_duration(
        self,
        question: str,
        input_mode: InputMode,
        words_per_minute: int,
        caller_duration: Optional[float]
    ) -> float:
        """
        Estimate how long it took to ask the question.
        
        Rules:
        - If caller provides duration (e.g., from audio timestamps), use it
        - Otherwise, estimate from word count and WPM
        """
        # If caller provided duration, use it
        if caller_duration is not None and caller_duration > 0:
            return caller_duration
        
        # Estimate from text
        words = self._count_words(question)
        
        # Convert to duration: words / wpm * 60 = seconds
        minutes = words / words_per_minute
        estimated_seconds = math.ceil(minutes * 60)
        
        # Minimum 2 seconds even for very short questions
        return max(estimated_seconds, 2.0)
    
    def _compute_required_pause(
        self,
        question_duration: float,
        default_wait: int,
        buffer: int
    ) -> float:
        """
        Compute required pause before responding.
        
        Rule: REQUIRED_PAUSE = max(question_duration, default_wait) + buffer
        """
        return max(question_duration, default_wait) + buffer
    
    def _generate_timing_outputs(
        self,
        question_duration: float,
        required_pause: float,
        enforce_nqr: bool
    ) -> Tuple[str, str, List[str]]:
        """
        Generate timing-related output strings.
        
        Returns: (engagement_notice, timing_boundary_line, public_rules)
        """
        if not enforce_nqr:
            return "", "", []
        
        # Select engagement notice based on pause length
        if required_pause >= 30:
            notice = ENGAGEMENT_RULE_NOTICES["hostile"]
        elif required_pause >= 15:
            notice = ENGAGEMENT_RULE_NOTICES["standard"]
        else:
            notice = ENGAGEMENT_RULE_NOTICES["short"]
        
        # Select timing boundary line
        boundary_line = TIMING_BOUNDARY_LINES[0]  # Default
        
        return notice, boundary_line, PUBLIC_ENGAGEMENT_RULES
    
    def _add_timing_to_responses(
        self,
        responses: List[CCRResponse],
        timing_boundary_line: str,
        enforce_nqr: bool
    ) -> List[CCRResponse]:
        """Add timing boundary line to responses when NQR is enabled"""
        if not enforce_nqr or not timing_boundary_line:
            return responses
        
        updated = []
        for resp in responses:
            timing_prefixed = f"{timing_boundary_line} {resp.full_response}"
            updated.append(CCRResponse(
                length=resp.length,
                mechanism_anchor=resp.mechanism_anchor,
                example=resp.example,
                boundary_statement=resp.boundary_statement,
                redirect_question=resp.redirect_question,
                full_response=resp.full_response,
                timing_prefixed_response=timing_prefixed
            ))
        return updated
    
    async def classify_trap(self, question: str) -> TrapClassification:
        """Classify the question into trap types using LLM"""
        
        # Build trap definitions for prompt
        trap_list = "\n".join([
            f"- {key.upper()}: {info['description']}. Examples: {', '.join(info['examples'][:2])}"
            for key, info in TRAP_DEFINITIONS.items()
        ])
        
        system_prompt = f"""You are a CCR (Conversation Containment Rule) classifier.
Your job is to identify pressure tactics and trap types in questions/statements.

Trap Types:
{trap_list}

Analyze the input and return a JSON object with:
- primary_trap: the main trap type (lowercase)
- secondary_traps: list of other applicable traps (can be empty)
- confidence: 0.0-1.0 confidence score
- reasoning: brief explanation of classification

Respond ONLY with valid JSON, no other text."""
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"ccram-classify-{uuid.uuid4()}",
            system_message=system_prompt
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=f"Classify this question/statement:\n\n\"{question}\"")
        
        try:
            response = await chat.send_message(user_message)
            
            # Parse JSON response
            json_match = re.search(r'\{[^{}]*\}', response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                return TrapClassification(
                    primary_trap=TrapType(data.get("primary_trap", "neutral")),
                    secondary_traps=[TrapType(t) for t in data.get("secondary_traps", []) if t in [e.value for e in TrapType]],
                    confidence=float(data.get("confidence", 0.7)),
                    reasoning=data.get("reasoning", "Classification completed")
                )
        except Exception as e:
            print(f"Classification error: {e}")
        
        # Fallback
        return TrapClassification(
            primary_trap=TrapType.NEUTRAL,
            secondary_traps=[],
            confidence=0.5,
            reasoning="Fallback classification"
        )
    
    async def generate_responses(
        self,
        question: str,
        classification: TrapClassification,
        topic_pack: TopicPack
    ) -> List[CCRResponse]:
        """Generate CCR-anchored responses in 3 lengths"""
        
        pack = TOPIC_PACKS.get(topic_pack.value, TOPIC_PACKS["general"])
        trap_info = TRAP_DEFINITIONS.get(classification.primary_trap.value, TRAP_DEFINITIONS["neutral"])
        
        system_prompt = f"""You are a CCR (Conversation Containment Rule) response generator.
You help create mechanism-anchored responses that:
1. Never answer identity-bait, prophecy-bait, or motive-bait directly
2. Convert identity claims to mechanism framing
3. Convert hostile framing to example/pattern framing
4. Preserve exits: refuse false dilemmas and urgency traps
5. Never name private individuals; no defamation; no calls to violence

Topic Context: {pack['name']}
Core Concepts: {', '.join(pack['core_concepts'])}
Key Phrases: {', '.join(pack['key_phrases'])}

Detected Trap Type: {trap_info['name']}
CCR Principle: {trap_info['ccr_principle']}

Generate THREE response versions:
1. SHORT (10 seconds, ~30 words): Tight, essential only
2. BALANCED (30 seconds, ~80 words): Include example
3. EXPANDED (60 seconds, ~150 words): Full mechanism + example + context

Each response MUST include:
- mechanism_anchor: Core mechanism statement
- example: Illustrative example (can be brief for short version)
- boundary_statement: Exit-preserving statement
- redirect_question: Return-to-mechanism question

Respond with valid JSON array of 3 objects with keys: length, mechanism_anchor, example, boundary_statement, redirect_question, full_response"""
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"ccram-respond-{uuid.uuid4()}",
            system_message=system_prompt
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(
            text=f"""Generate CCR responses for this hostile question:

"{question}"

Use mechanism examples from this context:
{json.dumps(pack['mechanism_examples'], indent=2)}

Respond ONLY with a JSON array of 3 response objects."""
        )
        
        try:
            response = await chat.send_message(user_message)
            
            # Parse JSON array
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                responses = []
                lengths = [ResponseLength.SHORT, ResponseLength.BALANCED, ResponseLength.EXPANDED]
                
                for i, item in enumerate(data[:3]):
                    responses.append(CCRResponse(
                        length=lengths[i] if i < len(lengths) else ResponseLength.BALANCED,
                        mechanism_anchor=item.get("mechanism_anchor", ""),
                        example=item.get("example"),
                        boundary_statement=item.get("boundary_statement", ""),
                        redirect_question=item.get("redirect_question", ""),
                        full_response=item.get("full_response", "")
                    ))
                
                return responses
        except Exception as e:
            print(f"Response generation error: {e}")
        
        # Fallback responses
        return self._generate_fallback_responses(classification, pack)
    
    def _generate_fallback_responses(self, classification: TrapClassification, pack: dict) -> List[CCRResponse]:
        """Generate fallback responses using templates"""
        import random
        
        opener = random.choice(RESPONSE_TEMPLATES["opener_anchors"])
        mechanism = pack["mechanism_examples"][0] if pack["mechanism_examples"] else "The mechanism operates through observable patterns."
        boundary = random.choice(RESPONSE_TEMPLATES["boundary_statements"])
        redirect = random.choice(RESPONSE_TEMPLATES["redirect_questions"])
        
        return [
            CCRResponse(
                length=ResponseLength.SHORT,
                mechanism_anchor=opener,
                example=None,
                boundary_statement=boundary,
                redirect_question=redirect,
                full_response=f"{opener} {boundary} {redirect}"
            ),
            CCRResponse(
                length=ResponseLength.BALANCED,
                mechanism_anchor=opener,
                example=mechanism,
                boundary_statement=boundary,
                redirect_question=redirect,
                full_response=f"{opener} {mechanism} {boundary} {redirect}"
            ),
            CCRResponse(
                length=ResponseLength.EXPANDED,
                mechanism_anchor=opener,
                example=mechanism,
                boundary_statement=boundary,
                redirect_question=redirect,
                full_response=f"{opener} {mechanism} {boundary} {redirect}"
            )
        ]
    
    def generate_wearable_outputs(
        self,
        responses: List[CCRResponse],
        enforce_nqr: bool = True
    ) -> Tuple[List[str], List[str]]:
        """Generate glasses cards and earpiece cues"""
        
        # Glasses cards: Big text, 1-2 lines each
        glasses_cards = []
        
        # Add timing cards first if NQR enabled
        if enforce_nqr:
            glasses_cards.extend(TIMING_GLASSES_CARDS[:2])  # PAUSE, EQUAL TIME RULE
        
        for resp in responses:
            if resp.mechanism_anchor:
                glasses_cards.append(resp.mechanism_anchor[:80])
            if resp.example:
                glasses_cards.append(resp.example[:80])
        glasses_cards.append("BOUNDARY: No pressure.")
        glasses_cards.append("REDIRECT: What mechanism?")
        
        # Earpiece cues: 3-8 words
        earpiece_cues = []
        
        # Add timing cues first if NQR enabled
        if enforce_nqr:
            earpiece_cues.extend(TIMING_EARPIECE_CUES[:2])  # Pause. Then answer. / Wait. Accuracy first.
        
        earpiece_cues.extend([
            "Mechanism. Not identity.",
            "Describe the pattern.",
            "Example. Then redirect.",
            "Preserve the exit.",
            "What mechanism operates?"
        ])
        
        return glasses_cards, earpiece_cues
    
    async def process_question(self, request: CCRAMRequest) -> CCRAMOutput:
        """Main processing pipeline with NQR timing logic"""
        
        # Step 0: Compute timing
        question_duration = self._estimate_question_duration(
            question=request.question,
            input_mode=request.input_mode,
            words_per_minute=request.estimated_words_per_minute,
            caller_duration=request.question_duration_seconds
        )
        
        required_pause = self._compute_required_pause(
            question_duration=question_duration,
            default_wait=request.default_wait_seconds,
            buffer=request.buffer_seconds
        )
        
        engagement_notice, timing_boundary, public_rules = self._generate_timing_outputs(
            question_duration=question_duration,
            required_pause=required_pause,
            enforce_nqr=request.enforce_nqr
        )
        
        # Step 1: Check red flags
        red_flag, reason = self._check_red_flags(request.question)
        if red_flag:
            return CCRAMOutput(
                original_question=request.question,
                classification=TrapClassification(
                    primary_trap=TrapType.NEUTRAL,
                    secondary_traps=[],
                    confidence=1.0,
                    reasoning="Red flag detected - refusing to engage"
                ),
                topic_pack_used=request.topic_pack,
                responses=[
                    CCRResponse(
                        length=ResponseLength.SHORT,
                        mechanism_anchor=RED_FLAG_RESPONSE["mechanism_anchor"],
                        example=None,
                        boundary_statement=RED_FLAG_RESPONSE["boundary_statement"],
                        redirect_question=RED_FLAG_RESPONSE["redirect_question"],
                        full_response=RED_FLAG_RESPONSE["full_response"],
                        timing_prefixed_response=f"{timing_boundary} {RED_FLAG_RESPONSE['full_response']}" if request.enforce_nqr else None
                    )
                ],
                glasses_cards=["RED FLAG", "No names. No targeting.", "Redirect to mechanism."],
                earpiece_cues=["Red flag. Boundary. Redirect."],
                red_flag_triggered=True,
                red_flag_reason=reason,
                # Timing outputs
                computed_question_duration_seconds=question_duration,
                required_pause_seconds=required_pause,
                engagement_rule_notice=engagement_notice,
                timing_boundary_line=timing_boundary,
                public_engagement_rules=public_rules if request.enforce_nqr else None
            )
        
        # Step 2: Classify trap type
        classification = await self.classify_trap(request.question)
        
        # Step 3: Generate responses
        responses = await self.generate_responses(
            request.question,
            classification,
            request.topic_pack
        )
        
        # Step 4: Add timing to responses
        responses = self._add_timing_to_responses(
            responses=responses,
            timing_boundary_line=timing_boundary,
            enforce_nqr=request.enforce_nqr
        )
        
        # Step 5: Generate wearable outputs
        glasses_cards, earpiece_cues = self.generate_wearable_outputs(
            responses=responses,
            enforce_nqr=request.enforce_nqr
        )
        
        return CCRAMOutput(
            original_question=request.question,
            classification=classification,
            topic_pack_used=request.topic_pack,
            responses=responses,
            glasses_cards=glasses_cards,
            earpiece_cues=earpiece_cues,
            red_flag_triggered=False,
            red_flag_reason=None,
            # Timing outputs
            computed_question_duration_seconds=question_duration,
            required_pause_seconds=required_pause,
            engagement_rule_notice=engagement_notice,
            timing_boundary_line=timing_boundary,
            public_engagement_rules=public_rules if request.enforce_nqr else None
        )


# Singleton instance
ccram_service = CCRAMService()
