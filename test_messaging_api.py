#!/usr/bin/env python3
"""
BANIBS Connect Messaging API Test Suite - Phase 3.1
Comprehensive testing of messaging endpoints with Beanie ODM
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://calm-tech-learn.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class MessagingAPITester:
    def __init__(self):
        self.access_token = None
        self.user_id = None
        self.test_conversation_id = None
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def make_request(self, method: str, endpoint: str, data=None, headers=None, params=None):
        """Make HTTP request with error handling"""
        url = f"{API_BASE}{endpoint}"
        
        request_headers = self.session.headers.copy()
        if headers:
            request_headers.update(headers)
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=request_headers, params=params)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=request_headers)
            elif method.upper() == "PATCH":
                response = self.session.patch(url, json=data, headers=request_headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=request_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            self.log(f"{method} {endpoint} -> {response.status_code}")
            return response
            
        except requests.exceptions.RequestException as e:
            self.log(f"Request failed: {e}", "ERROR")
            raise
    
    def test_authentication_setup(self) -> bool:
        """Test authentication setup using existing test user"""
        self.log("Testing authentication setup...")
        
        # Use the existing test user credentials
        test_email = "social_test_user@example.com"
        test_password = "TestPass123!"
        
        response = self.make_request("POST", "/auth/login", {
            "email": test_email,
            "password": test_password
        })
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                self.access_token = data["access_token"]
                self.user_id = data["user"]["id"]
                self.log(f"✅ Authentication successful - User ID: {self.user_id}")
                return True
            else:
                self.log("❌ Login response missing required fields", "ERROR")
                return False
        else:
            self.log(f"❌ Authentication failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_create_conversation(self) -> bool:
        """Test creating a DM conversation"""
        if not self.access_token:
            self.log("❌ No access token available", "ERROR")
            return False
        
        self.log("Testing conversation creation...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Create a DM conversation with another participant
        mock_participant_id = "test_participant_123"
        
        response = self.make_request("POST", "/messaging/conversations", {
            "type": "dm",
            "participant_ids": [mock_participant_id]
        }, headers=headers)
        
        if response.status_code == 201:
            data = response.json()
            self.log(f"   Response data: {json.dumps(data, indent=2)}")
            required_fields = ["type", "participant_ids", "created_at", "updated_at"]
            id_field = "id" if "id" in data else "_id"
            
            if all(field in data for field in required_fields) and id_field in data:
                self.test_conversation_id = data[id_field]
                self.log(f"✅ Conversation created - ID: {self.test_conversation_id}")
                self.log(f"   Type: {data['type']}, Participants: {len(data['participant_ids'])}")
                return True
            else:
                missing = [f for f in required_fields if f not in data]
                if id_field not in data:
                    missing.append("id/_id")
                available = list(data.keys())
                self.log(f"❌ Missing fields: {missing}", "ERROR")
                self.log(f"   Available fields: {available}", "ERROR")
                return False
        else:
            self.log(f"❌ Creation failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_list_conversations(self) -> bool:
        """Test listing conversations"""
        if not self.access_token:
            self.log("❌ No access token available", "ERROR")
            return False
        
        self.log("Testing conversation listing...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = self.make_request("GET", "/messaging/conversations", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log(f"✅ Listed {len(data)} conversations")
                return True
            else:
                self.log(f"❌ Response not a list: {type(data)}", "ERROR")
                return False
        else:
            self.log(f"❌ Listing failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_get_conversation(self) -> bool:
        """Test getting single conversation"""
        if not self.access_token or not self.test_conversation_id:
            self.log("❌ No access token or conversation ID", "ERROR")
            return False
        
        self.log("Testing single conversation retrieval...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = self.make_request("GET", f"/messaging/conversations/{self.test_conversation_id}", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            self.log(f"✅ Retrieved conversation: {data.get('id', 'unknown')}")
            return True
        else:
            self.log(f"❌ Retrieval failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_send_messages(self) -> bool:
        """Test sending messages with BANIBS emoji placeholders"""
        if not self.access_token or not self.test_conversation_id:
            self.log("❌ No access token or conversation ID", "ERROR")
            return False
        
        self.log("Testing message sending...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Test messages
        messages = [
            "Hello! This is a test message.",
            "Hello [emoji:banibs_full_banibs_009]! How are you?",
            "Amazing feature! [emoji:banibs_full_banibs_015] Love it!"
        ]
        
        for i, text in enumerate(messages):
            response = self.make_request("POST", f"/messaging/conversations/{self.test_conversation_id}/messages", {
                "type": "text",
                "text": text
            }, headers=headers)
            
            if response.status_code == 201:
                data = response.json()
                self.log(f"✅ Message {i+1} sent: {text[:30]}...")
                
                # Check BANIBS emoji preservation
                if "[emoji:banibs_full_banibs_" in text:
                    if "[emoji:banibs_full_banibs_" in data.get("text", ""):
                        self.log("   ✅ BANIBS emoji placeholder preserved")
                    else:
                        self.log("   ❌ BANIBS emoji placeholder lost", "ERROR")
                        return False
            else:
                self.log(f"❌ Message {i+1} failed: {response.status_code}", "ERROR")
                return False
        
        return True
    
    def test_list_messages(self) -> bool:
        """Test listing messages with pagination"""
        if not self.access_token or not self.test_conversation_id:
            self.log("❌ No access token or conversation ID", "ERROR")
            return False
        
        self.log("Testing message listing...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Test basic listing
        response = self.make_request("GET", f"/messaging/conversations/{self.test_conversation_id}/messages", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log(f"✅ Listed {len(data)} messages")
                
                # Check for BANIBS emoji placeholders
                emoji_msgs = [m for m in data if m.get("text") and "[emoji:banibs_full_banibs_" in m["text"]]
                if emoji_msgs:
                    self.log(f"   ✅ Found {len(emoji_msgs)} messages with BANIBS emojis")
                
                # Test pagination
                paginated = self.make_request("GET", f"/messaging/conversations/{self.test_conversation_id}/messages", 
                                            headers=headers, params={"page": 1, "limit": 2})
                
                if paginated.status_code == 200:
                    pag_data = paginated.json()
                    if isinstance(pag_data, list) and len(pag_data) <= 2:
                        self.log("   ✅ Pagination working")
                        return True
                    else:
                        self.log("   ❌ Pagination failed", "ERROR")
                        return False
                else:
                    self.log("   ❌ Pagination request failed", "ERROR")
                    return False
            else:
                self.log(f"❌ Response not a list: {type(data)}", "ERROR")
                return False
        else:
            self.log(f"❌ Listing failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_mark_messages_read(self) -> bool:
        """Test marking messages as read"""
        if not self.access_token or not self.test_conversation_id:
            self.log("❌ No access token or conversation ID", "ERROR")
            return False
        
        self.log("Testing mark messages read...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = self.make_request("POST", f"/messaging/conversations/{self.test_conversation_id}/read", {}, headers=headers)
        
        if response.status_code == 204:
            self.log("✅ Messages marked as read (204 No Content)")
            return True
        else:
            self.log(f"❌ Mark read failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_error_handling(self) -> bool:
        """Test error handling scenarios"""
        self.log("Testing error handling...")
        
        # Test unauthorized access
        response = self.make_request("GET", "/messaging/conversations")
        if response.status_code == 401:
            self.log("   ✅ Unauthorized access returns 401")
        else:
            self.log(f"   ❌ Should return 401, got {response.status_code}", "ERROR")
            return False
        
        if not self.access_token:
            return True
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Test invalid conversation ID (use valid ObjectId format but non-existent)
        invalid_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format but doesn't exist
        response = self.make_request("GET", f"/messaging/conversations/{invalid_id}", headers=headers)
        if response.status_code == 404:
            self.log("   ✅ Invalid conversation returns 404")
        else:
            self.log(f"   ❌ Should return 404, got {response.status_code}", "ERROR")
            return False
        
        # Test message without content
        if self.test_conversation_id:
            response = self.make_request("POST", f"/messaging/conversations/{self.test_conversation_id}/messages", {
                "type": "text"
                # No text or media_url
            }, headers=headers)
            
            if response.status_code == 400:
                self.log("   ✅ Message without content returns 400")
            else:
                self.log(f"   ❌ Should return 400, got {response.status_code}", "ERROR")
                return False
        
        # Test group conversation without title
        response = self.make_request("POST", "/messaging/conversations", {
            "type": "group",
            "participant_ids": ["user1", "user2"]
            # No title
        }, headers=headers)
        
        if response.status_code == 400:
            self.log("   ✅ Group without title returns 400")
        else:
            self.log(f"   ❌ Should return 400, got {response.status_code}", "ERROR")
            return False
        
        return True
    
    def run_all_tests(self) -> bool:
        """Run all messaging API tests"""
        self.log("🚀 Starting BANIBS Connect Messaging API Test Suite - Phase 3.1")
        self.log(f"Testing against: {API_BASE}")
        
        tests = [
            ("Authentication Setup", self.test_authentication_setup),
            ("Create Conversation", self.test_create_conversation),
            ("List Conversations", self.test_list_conversations),
            ("Get Single Conversation", self.test_get_conversation),
            ("Send Messages (with BANIBS emojis)", self.test_send_messages),
            ("List Messages (with pagination)", self.test_list_messages),
            ("Mark Messages Read", self.test_mark_messages_read),
            ("Error Handling", self.test_error_handling),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            self.log(f"\n--- Running {test_name} ---")
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log(f"❌ {test_name} failed with exception: {e}", "ERROR")
                failed += 1
        
        self.log(f"\n=== MESSAGING API TEST RESULTS ===")
        self.log(f"✅ Passed: {passed}")
        self.log(f"❌ Failed: {failed}")
        self.log(f"Total: {passed + failed}")
        
        if failed == 0:
            self.log("🎉 All messaging API tests passed!")
        else:
            self.log(f"💥 {failed} test(s) failed")
        
        return failed == 0

if __name__ == "__main__":
    tester = MessagingAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)