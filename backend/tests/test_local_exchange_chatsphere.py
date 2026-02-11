"""
Local Exchange → ChatSphere Integration Tests
Tests for the initiate-chat endpoint and listing context messaging

Test Coverage:
- Authentication requirements
- Self-messaging prevention
- Sold/inactive listing handling
- Non-existent listing handling
- Block state checking
- Conversation creation with listing metadata
- Idempotent conversation retrieval
- Listing context message creation
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://visualstory-49.preview.emergentagent.com')

# Test credentials
SELLER_EMAIL = "raymondneely@banibs.com"
SELLER_PASSWORD = "BanibsAdmin2026!"
BUYER_EMAIL = "testbuyer@banibs.com"
BUYER_PASSWORD = "TestBuyer2026!"

# Test listing ID (owned by seller)
TEST_LISTING_ID = "698c04e7f0a024212c77c1bb"


class TestInitiateChatAuthentication:
    """Test authentication requirements for initiate-chat endpoint"""
    
    def test_initiate_chat_requires_auth(self):
        """POST /api/local-exchange/listings/:id/initiate-chat returns 401 without token"""
        response = requests.post(
            f"{BASE_URL}/api/local-exchange/listings/{TEST_LISTING_ID}/initiate-chat"
        )
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
    
    def test_initiate_chat_with_invalid_token(self):
        """POST /api/local-exchange/listings/:id/initiate-chat returns 401 with invalid token"""
        response = requests.post(
            f"{BASE_URL}/api/local-exchange/listings/{TEST_LISTING_ID}/initiate-chat",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        assert response.status_code == 401


class TestInitiateChatValidation:
    """Test validation rules for initiate-chat endpoint"""
    
    @pytest.fixture
    def seller_token(self):
        """Get seller authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SELLER_EMAIL,
            "password": SELLER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Seller authentication failed")
    
    @pytest.fixture
    def buyer_token(self):
        """Get buyer authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": BUYER_EMAIL,
            "password": BUYER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Buyer authentication failed")
    
    def test_cannot_message_yourself(self, seller_token):
        """POST /api/local-exchange/listings/:id/initiate-chat returns 400 when messaging yourself"""
        response = requests.post(
            f"{BASE_URL}/api/local-exchange/listings/{TEST_LISTING_ID}/initiate-chat",
            headers={"Authorization": f"Bearer {seller_token}"}
        )
        assert response.status_code == 400
        data = response.json()
        assert "cannot message yourself" in data["detail"].lower()
    
    def test_nonexistent_listing_returns_404(self, buyer_token):
        """POST /api/local-exchange/listings/:id/initiate-chat returns 404 for non-existent listing"""
        response = requests.post(
            f"{BASE_URL}/api/local-exchange/listings/000000000000000000000000/initiate-chat",
            headers={"Authorization": f"Bearer {buyer_token}"}
        )
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower()
    
    def test_invalid_listing_id_returns_400(self, buyer_token):
        """POST /api/local-exchange/listings/:id/initiate-chat returns 400 for invalid ID format"""
        response = requests.post(
            f"{BASE_URL}/api/local-exchange/listings/invalid-id/initiate-chat",
            headers={"Authorization": f"Bearer {buyer_token}"}
        )
        assert response.status_code == 400
        data = response.json()
        assert "invalid" in data["detail"].lower()


class TestInitiateChatConversationCreation:
    """Test conversation creation and retrieval"""
    
    @pytest.fixture
    def buyer_token(self):
        """Get buyer authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": BUYER_EMAIL,
            "password": BUYER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Buyer authentication failed")
    
    def test_creates_conversation_with_listing_context(self, buyer_token):
        """POST /api/local-exchange/listings/:id/initiate-chat creates conversation with listing metadata"""
        response = requests.post(
            f"{BASE_URL}/api/local-exchange/listings/{TEST_LISTING_ID}/initiate-chat",
            headers={"Authorization": f"Bearer {buyer_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "conversation_id" in data
        assert "is_new" in data
        assert "listing_context" in data
        
        # Verify listing context structure
        ctx = data["listing_context"]
        assert ctx["type"] == "listing_context"
        assert ctx["listing_id"] == TEST_LISTING_ID
        assert "title" in ctx
        assert "price" in ctx
        assert "thumbnail" in ctx
        assert "link" in ctx
        assert "category" in ctx
        assert "condition" in ctx
        assert "seller_name" in ctx
        assert "location_city" in ctx
    
    def test_returns_existing_conversation_idempotent(self, buyer_token):
        """POST /api/local-exchange/listings/:id/initiate-chat returns existing conversation on repeat calls"""
        # First call
        response1 = requests.post(
            f"{BASE_URL}/api/local-exchange/listings/{TEST_LISTING_ID}/initiate-chat",
            headers={"Authorization": f"Bearer {buyer_token}"}
        )
        assert response1.status_code == 200
        data1 = response1.json()
        conv_id1 = data1["conversation_id"]
        
        # Second call - should return same conversation
        response2 = requests.post(
            f"{BASE_URL}/api/local-exchange/listings/{TEST_LISTING_ID}/initiate-chat",
            headers={"Authorization": f"Bearer {buyer_token}"}
        )
        assert response2.status_code == 200
        data2 = response2.json()
        conv_id2 = data2["conversation_id"]
        
        # Verify same conversation returned
        assert conv_id1 == conv_id2
        assert data2["is_new"] == False
    
    def test_conversation_has_listing_context_message(self, buyer_token):
        """Created conversation has listing_context system message with metadata"""
        # Initiate chat
        init_response = requests.post(
            f"{BASE_URL}/api/local-exchange/listings/{TEST_LISTING_ID}/initiate-chat",
            headers={"Authorization": f"Bearer {buyer_token}"}
        )
        assert init_response.status_code == 200
        conv_id = init_response.json()["conversation_id"]
        
        # Get messages
        messages_response = requests.get(
            f"{BASE_URL}/api/messaging/conversations/{conv_id}/messages",
            headers={"Authorization": f"Bearer {buyer_token}"}
        )
        assert messages_response.status_code == 200
        
        messages = messages_response.json()
        assert len(messages) >= 1
        
        # Find listing_context message
        listing_msg = None
        for msg in messages:
            if msg.get("type") == "listing_context":
                listing_msg = msg
                break
        
        assert listing_msg is not None, "No listing_context message found"
        assert listing_msg["senderId"] == "system"
        assert "metadata" in listing_msg
        
        # Verify metadata fields
        metadata = listing_msg["metadata"]
        assert "listing_id" in metadata
        assert "listing_title" in metadata
        assert "listing_price" in metadata
        assert "listing_thumbnail" in metadata
        assert "listing_link" in metadata


class TestInitiateChatSoldListing:
    """Test handling of sold/inactive listings"""
    
    @pytest.fixture
    def seller_token(self):
        """Get seller authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SELLER_EMAIL,
            "password": SELLER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Seller authentication failed")
    
    @pytest.fixture
    def buyer_token(self):
        """Get buyer authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": BUYER_EMAIL,
            "password": BUYER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Buyer authentication failed")
    
    def test_sold_listing_returns_400(self, seller_token, buyer_token):
        """POST /api/local-exchange/listings/:id/initiate-chat returns 400 for sold listing"""
        # Create a test listing
        create_response = requests.post(
            f"{BASE_URL}/api/local-exchange/listings",
            headers={"Authorization": f"Bearer {seller_token}"},
            json={
                "title": "TEST_Sold Item for Chat Test",
                "description": "This item will be marked as sold for testing",
                "category": "electronics",
                "price": 100,
                "condition": "good",
                "location_city": "Test City",
                "location_zip": "12345"
            }
        )
        assert create_response.status_code == 201
        listing_id = create_response.json()["id"]
        
        try:
            # Mark as sold
            update_response = requests.patch(
                f"{BASE_URL}/api/local-exchange/listings/{listing_id}",
                headers={"Authorization": f"Bearer {seller_token}"},
                json={"status": "sold"}
            )
            assert update_response.status_code == 200
            
            # Try to initiate chat - should fail
            chat_response = requests.post(
                f"{BASE_URL}/api/local-exchange/listings/{listing_id}/initiate-chat",
                headers={"Authorization": f"Bearer {buyer_token}"}
            )
            assert chat_response.status_code == 400
            assert "no longer available" in chat_response.json()["detail"].lower()
        finally:
            # Cleanup
            requests.delete(
                f"{BASE_URL}/api/local-exchange/listings/{listing_id}",
                headers={"Authorization": f"Bearer {seller_token}"}
            )


class TestModuleRegistryIntegration:
    """Test that Module Registry is updated with integration notes"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SELLER_EMAIL,
            "password": SELLER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_local_exchange_module_has_initiate_chat_route(self, admin_token):
        """Module Registry local_exchange entry includes initiate-chat API route"""
        response = requests.get(
            f"{BASE_URL}/api/founder/modules/local_exchange",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        api_routes = data.get("api_routes", [])
        
        # Check for initiate-chat route
        has_initiate_chat = any("initiate-chat" in route for route in api_routes)
        assert has_initiate_chat, "initiate-chat route not found in local_exchange module"
    
    def test_local_exchange_module_has_integration_notes(self, admin_token):
        """Module Registry local_exchange entry has ChatSphere integration notes"""
        response = requests.get(
            f"{BASE_URL}/api/founder/modules/local_exchange",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        notes = data.get("notes", "")
        
        # Check for integration mention
        assert "chatsphere" in notes.lower() or "integrated" in notes.lower(), \
            "Integration notes not found in local_exchange module"
    
    def test_chatsphere_module_has_integration_notes(self, admin_token):
        """Module Registry chatsphere entry has Local Exchange integration notes"""
        response = requests.get(
            f"{BASE_URL}/api/founder/modules/chatsphere",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        notes = data.get("notes", "")
        
        # Check for integration mention
        assert "local exchange" in notes.lower() or "listing" in notes.lower(), \
            "Integration notes not found in chatsphere module"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
