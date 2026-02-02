#!/usr/bin/env python3
"""
P0 Fix Test: Sidebar conversation list real-time updates
Tests the critical bug fix where the left sidebar conversation list was NOT updating 
after sending a new message.
"""

import requests
import json
import sys
import time
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://newsfix-dev.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

def log(message: str, level: str = "INFO"):
    """Log test messages with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")

def make_request(method: str, endpoint: str, data=None, headers=None, params=None):
    """Make HTTP request with error handling"""
    url = f"{API_BASE}{endpoint}"
    
    request_headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    if headers:
        request_headers.update(headers)
        
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=request_headers, params=params)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=request_headers)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        log(f"{method} {endpoint} -> {response.status_code}")
        return response
        
    except requests.exceptions.RequestException as e:
        log(f"Request failed: {e}", "ERROR")
        raise

def test_sidebar_conversation_list_realtime_updates():
    """
    P0 FIX TEST: Sidebar conversation list real-time updates
    
    Tests the critical bug fix where the left sidebar conversation list was NOT updating 
    after sending a new message. The fix was to add `await refetchConversations()` 
    after `sendMessage()` in the `handleSendMessage` function.
    
    This test verifies that the backend correctly updates the parent Conversation document
    with last_message_preview, last_message_at, and updated_at when a message is sent.
    """
    log("🎯 TESTING P0 FIX: Sidebar conversation list real-time updates")
    
    # Step 1: Login with test credentials
    test_email = "social_test_user@example.com"
    test_password = "TestPass123!"
    
    response = make_request("POST", "/auth/login", {
        "email": test_email,
        "password": test_password
    })
    
    if response.status_code != 200:
        log(f"❌ Login failed: {response.status_code} - {response.text}", "ERROR")
        return False
    
    data = response.json()
    if "access_token" not in data:
        log("❌ Login response missing access_token", "ERROR")
        return False
    
    access_token = data["access_token"]
    user_id = data.get("user", {}).get("id")
    log(f"✅ Login successful - User ID: {user_id}")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Step 2: Get existing conversations list
    log("📋 Step 2: Getting initial conversations list...")
    response = make_request("GET", "/messaging/conversations", headers=headers)
    
    if response.status_code != 200:
        log(f"❌ Failed to get conversations: {response.status_code} - {response.text}", "ERROR")
        return False
    
    conversations = response.json()
    log(f"✅ Found {len(conversations)} existing conversations")
    
    # Step 3: If no conversations exist, create a new DM conversation
    target_conversation = None
    if len(conversations) == 0:
        log("📝 Step 3: No conversations found, creating new DM conversation...")
        
        # Create conversation with another test user
        response = make_request("POST", "/messaging/conversations", {
            "type": "dm",
            "participant_ids": ["test_participant_456"]  # Mock participant
        }, headers=headers)
        
        if response.status_code != 201:
            log(f"❌ Failed to create conversation: {response.status_code} - {response.text}", "ERROR")
            return False
        
        target_conversation = response.json()
        log(f"✅ Created new conversation: {target_conversation['id']}")
    else:
        # Use the first existing conversation
        target_conversation = conversations[0]
        log(f"✅ Using existing conversation: {target_conversation['id']}")
    
    conversation_id = target_conversation["id"]
    
    # Step 4: Record initial state
    initial_preview = target_conversation.get("lastMessagePreview", "")
    initial_timestamp = target_conversation.get("lastMessageAt", "")
    
    log(f"📊 Step 4: Initial conversation state:")
    log(f"   Last Message Preview: '{initial_preview}'")
    log(f"   Last Message At: {initial_timestamp}")
    
    # Step 5: Send a new message
    test_message = f"P0 Fix Test Message - {int(time.time())}"
    log(f"📤 Step 5: Sending new message: '{test_message}'")
    
    response = make_request("POST", f"/messaging/conversations/{conversation_id}/messages", {
        "text": test_message
    }, headers=headers)
    
    if response.status_code != 201:
        log(f"❌ Failed to send message: {response.status_code} - {response.text}", "ERROR")
        return False
    
    message_data = response.json()
    log(f"✅ Message sent successfully: {message_data['id']}")
    
    # Step 6: Immediately fetch conversations list again to verify update
    log("🔄 Step 6: Fetching conversations list to verify real-time update...")
    
    response = make_request("GET", "/messaging/conversations", headers=headers)
    
    if response.status_code != 200:
        log(f"❌ Failed to refetch conversations: {response.status_code} - {response.text}", "ERROR")
        return False
    
    updated_conversations = response.json()
    
    # Find our conversation in the updated list
    updated_conversation = None
    for conv in updated_conversations:
        if conv["id"] == conversation_id:
            updated_conversation = conv
            break
    
    if not updated_conversation:
        log(f"❌ Conversation {conversation_id} not found in updated list", "ERROR")
        return False
    
    # Step 7: Verify the updates
    updated_preview = updated_conversation.get("lastMessagePreview", "")
    updated_timestamp = updated_conversation.get("lastMessageAt", "")
    
    log(f"📊 Step 7: Updated conversation state:")
    log(f"   Last Message Preview: '{updated_preview}'")
    log(f"   Last Message At: {updated_timestamp}")
    
    # Verify preview was updated
    expected_preview = test_message[:100]  # Backend takes first 100 chars
    if updated_preview != expected_preview:
        log(f"❌ Preview not updated correctly", "ERROR")
        log(f"   Expected: '{expected_preview}'")
        log(f"   Got: '{updated_preview}'")
        return False
    
    # Verify timestamp was updated (should be newer than initial)
    if updated_timestamp == initial_timestamp:
        log(f"❌ Timestamp not updated", "ERROR")
        log(f"   Initial: {initial_timestamp}")
        log(f"   Updated: {updated_timestamp}")
        return False
    
    # Verify conversation is at the top of the list (sorted by lastMessageAt descending)
    if updated_conversations[0]["id"] != conversation_id:
        log(f"❌ Updated conversation not at top of list", "ERROR")
        log(f"   Expected first: {conversation_id}")
        log(f"   Got first: {updated_conversations[0]['id']}")
        return False
    
    # Step 8: Success verification
    log("🎉 Step 8: P0 Fix verification complete!")
    log("✅ Backend correctly updates conversation document")
    log("✅ Fresh GET request returns updated conversation with new preview and timestamp")
    log("✅ Conversation moved to top of list (sorted by lastMessageAt descending)")
    log("✅ This proves the backend is working - frontend just needs to refetch")
    
    return True

if __name__ == "__main__":
    log("🎯 STARTING P0 FIX TEST - Sidebar Conversation List Real-Time Updates")
    log(f"Testing against: {API_BASE}")
    log("Testing the critical bug fix where sidebar conversation list was NOT updating after sending messages")
    
    try:
        if test_sidebar_conversation_list_realtime_updates():
            log("\n🎉 P0 FIX TEST PASSED - Backend correctly updates conversation list")
            sys.exit(0)
        else:
            log("\n❌ P0 FIX TEST FAILED - Backend not updating conversation list correctly")
            sys.exit(1)
    except Exception as e:
        log(f"\n❌ P0 FIX TEST FAILED with exception: {e}", "ERROR")
        import traceback
        traceback.print_exc()
        sys.exit(1)