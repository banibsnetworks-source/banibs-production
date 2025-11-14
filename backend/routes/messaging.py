# BANIBS Connect - Phase 3.1 Messaging API Routes
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

from ..models.messaging import (
    ConversationType,
    ConversationCreate,
    ConversationResponse,
    MessageCreate,
    MessageResponse,
    MarkReadRequest,
)
from ..services.messaging_service import MessagingService
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/api/messaging", tags=["messaging"])


def get_messaging_service(db=Depends(get_db)) -> MessagingService:
    """Dependency to get messaging service instance."""
    return MessagingService(db)


# --- Conversation Endpoints ---

@router.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(
    type: Optional[ConversationType] = Query(None, description="Filter by conversation type"),
    current_user=Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
):
    """
    Get all conversations for the current user.
    
    - **type**: Optional filter by conversation type (dm, group, business)
    """
    user_id = current_user["id"]
    conversations = await service.get_user_conversations(user_id, type)
    return conversations


@router.post("/conversations", response_model=ConversationResponse, status_code=201)
async def create_conversation(
    conversation: ConversationCreate,
    current_user=Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
):
    """
    Create a new conversation.
    
    - **type**: Conversation type (dm, group, business)
    - **participant_ids**: List of user IDs to include
    - **title**: Optional title (required for group/business)
    - **business_id**: Optional business ID (for business conversations)
    """
    user_id = current_user["id"]
    
    # Validation: Title required for group and business
    if conversation.type in [ConversationType.GROUP, ConversationType.BUSINESS]:
        if not conversation.title:
            raise HTTPException(
                status_code=400,
                detail=f"Title is required for {conversation.type} conversations"
            )
    
    # Validation: Business ID required for business conversations
    if conversation.type == ConversationType.BUSINESS and not conversation.business_id:
        raise HTTPException(
            status_code=400,
            detail="business_id is required for business conversations"
        )
    
    created_conversation = await service.create_conversation(conversation, user_id)
    return created_conversation


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    current_user=Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
):
    """
    Get a single conversation by ID.
    
    Returns 404 if conversation doesn't exist or user is not a participant.
    """
    user_id = current_user["id"]
    conversation = await service.get_conversation(conversation_id, user_id)
    
    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found or access denied"
        )
    
    return conversation


# --- Message Endpoints ---

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def list_messages(
    conversation_id: str,
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(50, ge=1, le=100, description="Messages per page"),
    current_user=Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
):
    """
    Get messages for a conversation (paginated).
    
    - **page**: Page number (default: 1)
    - **limit**: Messages per page (default: 50, max: 100)
    
    Messages are returned in chronological order (oldest first).
    """
    user_id = current_user["id"]
    messages = await service.get_messages(conversation_id, user_id, page, limit)
    return messages


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, status_code=201)
async def send_message(
    conversation_id: str,
    message: MessageCreate,
    current_user=Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
):
    """
    Send a message to a conversation.
    
    - **type**: Message type (text, media, system)
    - **text**: Text content (supports BANIBS emoji placeholders like [emoji:id])
    - **media_url**: Optional media URL
    - **metadata**: Optional metadata dict
    """
    user_id = current_user["id"]
    
    # Validation: Text or media_url required
    if not message.text and not message.media_url:
        raise HTTPException(
            status_code=400,
            detail="Either text or media_url is required"
        )
    
    sent_message = await service.send_message(conversation_id, user_id, message)
    
    if not sent_message:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found or access denied"
        )
    
    return sent_message


@router.post("/conversations/{conversation_id}/read", status_code=204)
async def mark_messages_read(
    conversation_id: str,
    request: MarkReadRequest = MarkReadRequest(),
    current_user=Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
):
    """
    Mark messages as read in a conversation.
    
    - **message_ids**: Optional list of specific message IDs to mark as read.
                       If omitted, marks all unread messages in the conversation as read.
    """
    user_id = current_user["id"]
    count = await service.mark_messages_read(
        conversation_id,
        user_id,
        request.message_ids
    )
    
    # Return 204 No Content on success
    return None
