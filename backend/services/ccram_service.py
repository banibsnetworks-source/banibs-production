"""
CCRAM Service
Core logic for CCR Router (classifier) and Response Generator
"""
import os
import re
import json
import uuid
from typing import List, Optional, Tuple
from datetime import datetime
from dotenv import load_dotenv

from emergentintegrations.llm.chat import LlmChat, UserMessage

from models.ccram import (
    TrapType, TopicPack, ResponseLength,
    CCRAMRequest, TrapClassification, CCRResponse, CCRAMOutput
)
from services.ccram_templates import (
    TRAP_DEFINITIONS, RESPONSE_TEMPLATES, TOPIC_PACKS,
    RED_FLAG_PATTERNS, RED_FLAG_RESPONSE
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
    
    def generate_wearable_outputs(self, responses: List[CCRResponse]) -> Tuple[List[str], List[str]]:
        """Generate glasses cards and earpiece cues"""
        
        # Glasses cards: Big text, 1-2 lines each
        glasses_cards = []
        for resp in responses:
            if resp.mechanism_anchor:
                glasses_cards.append(resp.mechanism_anchor[:80])
            if resp.example:
                glasses_cards.append(resp.example[:80])
        glasses_cards.append("BOUNDARY: No pressure.")
        glasses_cards.append("REDIRECT: What mechanism?")
        
        # Earpiece cues: 3-8 words
        earpiece_cues = [
            "Mechanism. Not identity.",
            "Describe the pattern.",
            "Example. Then redirect.",
            "Preserve the exit.",
            "What mechanism operates?"
        ]
        
        return glasses_cards, earpiece_cues
    
    async def process_question(self, request: CCRAMRequest) -> CCRAMOutput:
        """Main processing pipeline"""
        
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
                        full_response=RED_FLAG_RESPONSE["full_response"]
                    )
                ],
                glasses_cards=["RED FLAG", "No names. No targeting.", "Redirect to mechanism."],
                earpiece_cues=["Red flag. Boundary. Redirect."],
                red_flag_triggered=True,
                red_flag_reason=reason
            )
        
        # Step 2: Classify trap type
        classification = await self.classify_trap(request.question)
        
        # Step 3: Generate responses
        responses = await self.generate_responses(
            request.question,
            classification,
            request.topic_pack
        )
        
        # Step 4: Generate wearable outputs
        glasses_cards, earpiece_cues = self.generate_wearable_outputs(responses)
        
        return CCRAMOutput(
            original_question=request.question,
            classification=classification,
            topic_pack_used=request.topic_pack,
            responses=responses,
            glasses_cards=glasses_cards,
            earpiece_cues=earpiece_cues,
            red_flag_triggered=False,
            red_flag_reason=None
        )


# Singleton instance
ccram_service = CCRAMService()
