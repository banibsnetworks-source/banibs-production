"""
CCRAM Template Bank
CCR-anchored response templates and topic packs
"""
from typing import Dict, List, Any

# =============================================================================
# TRAP TYPE DEFINITIONS (for classifier prompt)
# =============================================================================
TRAP_DEFINITIONS = {
    "identity": {
        "name": "Identity Trap",
        "description": "Questions that bait you into claiming a specific identity, title, or role",
        "examples": [
            "Are you Elijah?",
            "Who do you think you are?",
            "Do you consider yourself a prophet?",
            "Are you claiming to be the Messiah?"
        ],
        "ccr_principle": "Convert identity claims to mechanism framing"
    },
    "motive": {
        "name": "Motive Trap",
        "description": "Accusations about hidden motives (money, power, ego)",
        "examples": [
            "You just want money",
            "This is all about power for you",
            "You're doing this for attention",
            "What's really in it for you?"
        ],
        "ccr_principle": "Redirect to observable mechanisms and patterns"
    },
    "urgency": {
        "name": "Urgency Trap",
        "description": "Pressure to answer immediately, yes/no demands",
        "examples": [
            "Just answer yes or no",
            "Give me a straight answer right now",
            "Stop dodging and commit",
            "I need an answer in 10 seconds"
        ],
        "ccr_principle": "Preserve exits, refuse false urgency"
    },
    "gotcha": {
        "name": "Gotcha Trap",
        "description": "Attempts to catch you in contradictions or inconsistencies",
        "examples": [
            "But you said X last year",
            "That contradicts what you wrote",
            "How do you explain this inconsistency?",
            "Isn't that hypocritical?"
        ],
        "ccr_principle": "Acknowledge evolution of understanding, return to mechanism"
    },
    "smear": {
        "name": "Smear Frame",
        "description": "Labeling with loaded terms (cult, extremist, grifter, etc.)",
        "examples": [
            "So you're running a cult?",
            "This sounds like extremism",
            "You're basically a grifter",
            "Critics call you a fraud"
        ],
        "ccr_principle": "Convert hostile framing to example/pattern framing"
    },
    "scope_creep": {
        "name": "Scope Creep",
        "description": "Demands to explain everything at once, overwhelming scope",
        "examples": [
            "Explain your entire philosophy right now",
            "How does all of this connect?",
            "Give me the complete picture",
            "What about X, Y, Z, and also W?"
        ],
        "ccr_principle": "Narrow to one mechanism, offer to continue later"
    },
    "misquote": {
        "name": "Misquote Trap",
        "description": "Attributing statements you didn't make or distorting your words",
        "examples": [
            "Didn't you say X?",
            "You claimed that...",
            "Your exact words were...",
            "So you believe..."
        ],
        "ccr_principle": "Clarify what was actually said, return to mechanism"
    },
    "evidence": {
        "name": "Evidence Trap",
        "description": "Impossible proof demands, scientific proof in seconds",
        "examples": [
            "Prove it scientifically",
            "Where's your peer-reviewed data?",
            "Can you demonstrate that right now?",
            "What's your empirical evidence?"
        ],
        "ccr_principle": "Distinguish mechanism observation from laboratory proof"
    },
    "false_binary": {
        "name": "False Binary",
        "description": "Either/or framing that eliminates nuance",
        "examples": [
            "Either you admit X or you're lying",
            "So it's either this or that?",
            "Are you with us or against us?",
            "Yes or no, which is it?"
        ],
        "ccr_principle": "Refuse false dilemmas, preserve exits"
    },
    "neutral": {
        "name": "Neutral/Genuine",
        "description": "Genuine inquiry without hostile framing",
        "examples": [
            "Can you explain how this works?",
            "What do you mean by that?",
            "Help me understand...",
            "Tell me more about..."
        ],
        "ccr_principle": "Respond openly while maintaining mechanism focus"
    }
}

# =============================================================================
# RESPONSE TEMPLATES (Skeleton structures)
# =============================================================================
RESPONSE_TEMPLATES = {
    "opener_anchors": [
        "I'm not here to argue identities — I'm here to describe a mechanism.",
        "Let me set aside the framing and describe what I actually observe.",
        "That's a framing question. Let me respond with a pattern instead.",
        "I understand the question, but let me offer something more useful: a mechanism.",
        "Rather than defend a label, let me describe what's actually happening."
    ],
    "mechanism_templates": [
        "The mechanism is: {cause} leads to {effect}.",
        "What I observe is a pattern: when {condition}, then {outcome}.",
        "The underlying dynamic is: {process} produces {result}.",
        "Here's the mechanism at work: {description}."
    ],
    "example_templates": [
        "You can see this when {observable_example}.",
        "A simple example: {concrete_instance}.",
        "This shows up as {real_world_case}.",
        "Notice how {everyday_observation}."
    ],
    "boundary_statements": [
        "If that doesn't help clarify, we can pause here — no pressure.",
        "Take what's useful; leave what isn't. I'm not here to convince.",
        "You're free to disagree. I'm describing, not prescribing.",
        "If this isn't landing, we can move on. No coercion here.",
        "I offer this as observation, not demand. You decide what to do with it."
    ],
    "redirect_questions": [
        "What mechanism do you think is operating in that situation?",
        "What pattern do you observe in your own experience?",
        "Where else have you seen this dynamic play out?",
        "What would you need to see to recognize this mechanism?",
        "How does this connect to what you already know?"
    ]
}

# =============================================================================
# TOPIC PACKS (Context-specific content)
# =============================================================================
TOPIC_PACKS = {
    "banibs": {
        "name": "BANIBS",
        "core_concepts": [
            "sovereignty",
            "circulation",
            "agency",
            "non-extractive economics",
            "community infrastructure"
        ],
        "mechanism_examples": [
            "When resources circulate within a community rather than being extracted, wealth accumulates locally.",
            "Sovereignty means having infrastructure you control — not renting access to someone else's.",
            "BANIBS creates circulation loops: value stays in, rather than flowing out.",
            "Agency comes from owning your own platforms, not being a user on someone else's."
        ],
        "key_phrases": [
            "circulation over extraction",
            "sovereignty through infrastructure",
            "agency by design",
            "community-owned systems"
        ]
    },
    "hdos": {
        "name": "HDOS (Hostile Decision-Space)",
        "core_concepts": [
            "decision-space collapse",
            "exit preservation",
            "pressure resistance",
            "false urgency",
            "coercion patterns"
        ],
        "mechanism_examples": [
            "Under pressure, decision space collapses — options disappear, exits close.",
            "The trap works by eliminating alternatives until only their preferred choice remains.",
            "Preserving exits means refusing to let urgency close doors prematurely.",
            "Hostile framing tries to collapse your options to 'comply or be labeled.'"
        ],
        "key_phrases": [
            "decision-space intact",
            "exits preserved",
            "refuse false urgency",
            "no coercion accepted"
        ]
    },
    "dismissive": {
        "name": "The Dismissive Argument",
        "core_concepts": [
            "fault scanning",
            "probing for weakness",
            "dismissal before understanding",
            "inquiry collapse at cause"
        ],
        "mechanism_examples": [
            "The dismissive argument scans for any fault to justify rejection before understanding.",
            "Inquiry collapses at cause: once a 'reason to dismiss' is found, listening stops.",
            "The mechanism: probe → find flaw → dismiss entirety → never engage substance.",
            "Fault-scanning replaces understanding with rejection-seeking."
        ],
        "key_phrases": [
            "fault scanning",
            "inquiry collapse",
            "dismissal before engagement",
            "the devil's favorite argument"
        ]
    },
    "restorative": {
        "name": "Restorative Circles / SCT",
        "core_concepts": [
            "circulation",
            "regeneration",
            "non-extractive routing",
            "reciprocal flow"
        ],
        "mechanism_examples": [
            "Restorative processes circulate accountability rather than extracting punishment.",
            "The circle ensures everyone affected has voice — no extraction, only circulation.",
            "Healing flows when harm is addressed through connection, not isolation.",
            "Regeneration happens when broken relationships are routed back toward wholeness."
        ],
        "key_phrases": [
            "circulation of accountability",
            "regenerative justice",
            "non-extractive process",
            "wholeness through connection"
        ]
    },
    "tree_of_life": {
        "name": "Tree of Life",
        "core_concepts": [
            "Word-as-life",
            "nourishment",
            "receiving",
            "embodying",
            "transmitting"
        ],
        "mechanism_examples": [
            "The Word nourishes like fruit from the tree — you receive, embody, then transmit.",
            "Life flows through receiving what gives life, not manufacturing it yourself.",
            "The tree gives freely; receiving is not taking, it's participating in the flow.",
            "Transmission happens naturally when you're genuinely nourished."
        ],
        "key_phrases": [
            "receive, embody, transmit",
            "Word as nourishment",
            "life-giving flow",
            "fruit freely given"
        ]
    },
    "general": {
        "name": "General",
        "core_concepts": [
            "mechanism focus",
            "pattern observation",
            "cause and effect",
            "observable dynamics"
        ],
        "mechanism_examples": [
            "The mechanism operates regardless of who's involved — it's about the pattern.",
            "Observable dynamics don't require belief — just attention.",
            "Cause and effect can be traced without needing to prove intent.",
            "Patterns repeat; that's how we recognize mechanisms."
        ],
        "key_phrases": [
            "focus on mechanism",
            "observe the pattern",
            "trace the dynamic",
            "what actually happens"
        ]
    }
}

# =============================================================================
# RED FLAG PATTERNS (Triggers refusal + CCR redirect only)
# =============================================================================
RED_FLAG_PATTERNS = [
    "name private individuals",
    "identify specific people",
    "who specifically did",
    "give me names",
    "name your enemies",
    "who is against you",
    "call out specific person",
    "attack",
    "violence",
    "harm",
    "destroy",
    "kill"
]

RED_FLAG_RESPONSE = {
    "mechanism_anchor": "I don't name private individuals or engage in personal targeting.",
    "boundary_statement": "That's a boundary I maintain regardless of the question.",
    "redirect_question": "What mechanism or pattern would you like to discuss instead?",
    "full_response": "I don't name private individuals or engage in personal targeting. That's a boundary I maintain regardless of the question. What mechanism or pattern would you like to discuss instead?"
}

# =============================================================================
# NQR (NO QUICK RESPONSE) TIMING TEMPLATES
# =============================================================================
TIMING_BOUNDARY_LINES = [
    "I'm going to pause for a moment so I can answer accurately.",
    "Let me take a moment to respond thoughtfully.",
    "I'll answer after a brief pause to ensure accuracy.",
    "A moment of consideration before I respond.",
    "I take time to answer with precision, not speed."
]

ENGAGEMENT_RULE_NOTICES = {
    "short": "I'll answer after a short pause so I can respond accurately. Please allow the same amount of time it took to ask the question.",
    "standard": "I will answer after a short pause so I can respond accurately. Please allow the same amount of time it took to ask the question. One question at a time, then a brief pause, then an answer.",
    "hostile": "No rapid-fire format. One question at a time, then a brief pause, then an answer. I prioritize accurate responses over performative speed.",
    "formal": "I follow a deliberate engagement protocol: I receive the question, pause to consider it fully, then respond with care. This ensures accuracy and respects the weight of what's being asked."
}

PUBLIC_ENGAGEMENT_RULES = [
    "One question at a time.",
    "Equal-time pause minimum — the pause will be at least as long as it took to ask the question.",
    "No rapid-fire format.",
    "Accurate responses over performative speed.",
    "Mechanism-focused framing, not identity or motive traps.",
    "Right to request rephrase if the question is distorted or contains false premises."
]

TIMING_EARPIECE_CUES = [
    "Pause. Then answer.",
    "Wait. Accuracy first.",
    "Breathe. No rush.",
    "Hold. Equal time.",
    "Deliberate. Not reactive."
]

TIMING_GLASSES_CARDS = [
    "PAUSE",
    "EQUAL TIME RULE",
    "ACCURACY > SPEED",
    "ONE QUESTION AT A TIME",
    "BREATHE"
]

