"""
CIL Responses: Color Dissociation & Identity Erasure Detection

Placeholder response category definitions.
No actual response content yet - stubs only.

Status: Phase 0 - Structural Placeholder
"""


class ResponseCategory:
    """Base class for CIL response categories (placeholder)"""
    
    def __init__(self, name: str, description: str, priority: int = 0):
        self.name = name
        self.description = description
        self.priority = priority
        self.active = False
    
    def generate(self, context: dict = None) -> str:
        """Placeholder response generation - NOT IMPLEMENTED"""
        return NotImplemented
    
    def get_template(self) -> str:
        """Placeholder template retrieval - NOT IMPLEMENTED"""
        return NotImplemented


# =============================================================================
# RESPONSE CATEGORY DEFINITIONS (Placeholders Only)
# =============================================================================

educational_prompt = ResponseCategory(
    name="educational_prompt",
    description="Educational content to inform and enlighten about identity and heritage",
    priority=1
)

identity_affirmation = ResponseCategory(
    name="identity_affirmation",
    description="Affirming responses that reinforce positive cultural identity",
    priority=2
)

healing_redirect = ResponseCategory(
    name="healing_redirect",
    description="Gentle redirects toward healing resources and community support",
    priority=3
)

truth_context_notice = ResponseCategory(
    name="truth_context_notice",
    description="Contextual notices providing truth and historical perspective",
    priority=4
)


# =============================================================================
# RESPONSE CATEGORIES REGISTRY
# =============================================================================

RESPONSE_CATEGORIES = {
    "educational_prompt": educational_prompt,
    "identity_affirmation": identity_affirmation,
    "healing_redirect": healing_redirect,
    "truth_context_notice": truth_context_notice,
}


def get_response_category(category_name: str) -> ResponseCategory:
    """Retrieve a response category by name (placeholder)"""
    return RESPONSE_CATEGORIES.get(category_name)


def list_response_categories() -> list:
    """List all registered response category names"""
    return list(RESPONSE_CATEGORIES.keys())
