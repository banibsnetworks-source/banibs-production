"""
Notification API Routes
Phase 6.2.1 - Notifications System
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List
from models.notification import (
    NotificationPublic,
    NotificationCreate,
    NotificationUnreadCount
)
from db.notifications import (
    create_notification,
    get_user_notifications,
    get_unread_count,
    mark_notification_as_read,
    mark_all_as_read,
    delete_notification,
    get_notification_by_id
)
from middleware.auth_guard import get_current_user, require_role

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=List[NotificationPublic])
async def get_notifications(
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    unread_only: bool = Query(False),
    current_user: dict = Depends(get_current_user)
):
    """
    Get current user's notifications
    
    Query params:
    - limit: Max notifications to return (1-100, default 20)
    - skip: Number to skip for pagination (default 0)
    - unread_only: If true, return only unread notifications
    
    Returns:
        List of notifications sorted by created_at descending
    """
    user_id = current_user["sub"]
    notifications = await get_user_notifications(
        user_id=user_id,
        limit=limit,
        skip=skip,
        unread_only=unread_only
    )
    
    return [NotificationPublic(**notif) for notif in notifications]


@router.get("/unread-count", response_model=NotificationUnreadCount)
async def get_unread_notifications_count(
    current_user: dict = Depends(get_current_user)
):
    """
    Get count of unread notifications for current user
    
    Used by frontend to show badge count in top nav
    
    Returns:
        { "unread_count": 5 }
    """
    user_id = current_user["sub"]
    count = await get_unread_count(user_id)
    
    return NotificationUnreadCount(unread_count=count)


@router.get("/{notification_id}", response_model=NotificationPublic)
async def get_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a single notification by ID
    
    Returns:
        Notification details
    """
    user_id = current_user["sub"]
    notification = await get_notification_by_id(notification_id, user_id)
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return NotificationPublic(**notification)


@router.patch("/{notification_id}/read", response_model=NotificationPublic)
async def mark_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Mark a notification as read
    
    Returns:
        Updated notification
    """
    user_id = current_user["sub"]
    
    # Mark as read
    success = await mark_notification_as_read(notification_id, user_id)
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Notification not found or already read"
        )
    
    # Return updated notification
    notification = await get_notification_by_id(notification_id, user_id)
    return NotificationPublic(**notification)


@router.patch("/read-all")
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_user)
):
    """
    Mark all notifications as read for current user
    
    Returns:
        { "marked_read": 5 }
    """
    user_id = current_user["sub"]
    count = await mark_all_as_read(user_id)
    
    return {"marked_read": count}


@router.delete("/{notification_id}")
async def delete_notification_endpoint(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a notification
    
    Returns:
        { "deleted": true }
    """
    user_id = current_user["sub"]
    success = await delete_notification(notification_id, user_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"deleted": True}


@router.post("", response_model=NotificationPublic)
async def create_notification_endpoint(
    notification: NotificationCreate,
    current_user: dict = Depends(require_role(["super_admin", "moderator"]))
):
    """
    Create a notification (admin/moderator only)
    
    Body:
    {
      "user_id": "user-uuid",
      "type": "system" | "business" | "opportunity" | "event",
      "title": "Notification title",
      "message": "Notification message",
      "link": "/some-route" (optional),
      "expires_at": "2025-12-31T23:59:59Z" (optional)
    }
    
    Returns:
        Created notification
    """
    created = await create_notification(
        user_id=notification.user_id,
        notification_type=notification.type,
        title=notification.title,
        message=notification.message,
        link=notification.link,
        expires_at=notification.expires_at
    )
    
    return NotificationPublic(**created)
