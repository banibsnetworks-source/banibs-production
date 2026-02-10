"""
Frames API Tests - BANIBS Social World Visual Storytelling
Tests for Frames v0.1 feature (Read + Create only)

Key constraints:
- NO likes, comments, or engagement metrics (calm tech design)
- Default visibility = Public
- Support Circle-only and Private (draft) visibility
- Guests can browse public frames only
"""

import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "raymondneely@banibs.com"
TEST_PASSWORD = "BanibsAdmin2026!"


class TestFramesGuestAccess:
    """Test guest (unauthenticated) access to Frames"""
    
    def test_get_frames_guest_access(self):
        """GET /api/frames - Guests can browse public frames"""
        response = requests.get(f"{BASE_URL}/api/frames")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "frames" in data, "Response should contain 'frames' key"
        assert "total" in data, "Response should contain 'total' key"
        assert "skip" in data, "Response should contain 'skip' key"
        assert "limit" in data, "Response should contain 'limit' key"
        assert "has_more" in data, "Response should contain 'has_more' key"
        
        # Verify frames structure
        if data["frames"]:
            frame = data["frames"][0]
            assert "id" in frame, "Frame should have 'id'"
            assert "image_url" in frame, "Frame should have 'image_url'"
            assert "visibility" in frame, "Frame should have 'visibility'"
            assert "creator_id" in frame, "Frame should have 'creator_id'"
            assert "creator_name" in frame, "Frame should have 'creator_name'"
            assert "created_at" in frame, "Frame should have 'created_at'"
            # Verify NO likes/comments fields (calm tech design)
            assert "likes" not in frame, "Frame should NOT have 'likes' (calm tech)"
            assert "comments" not in frame, "Frame should NOT have 'comments' (calm tech)"
            assert "reactions" not in frame, "Frame should NOT have 'reactions' (calm tech)"
        
        print(f"SUCCESS: Guest can browse frames. Total: {data['total']}")
    
    def test_get_frames_pagination(self):
        """GET /api/frames - Pagination works correctly"""
        response = requests.get(f"{BASE_URL}/api/frames?skip=0&limit=10")
        assert response.status_code == 200
        
        data = response.json()
        assert data["skip"] == 0
        assert data["limit"] == 10
        print("SUCCESS: Pagination parameters work correctly")
    
    def test_get_single_frame_guest(self):
        """GET /api/frames/:id - Guest can view public frame details"""
        # First get list to find a frame ID
        list_response = requests.get(f"{BASE_URL}/api/frames")
        assert list_response.status_code == 200
        
        data = list_response.json()
        if data["frames"]:
            frame_id = data["frames"][0]["id"]
            
            # Get single frame
            response = requests.get(f"{BASE_URL}/api/frames/{frame_id}")
            assert response.status_code == 200
            
            frame = response.json()
            assert frame["id"] == frame_id
            assert frame["visibility"] == "public"
            print(f"SUCCESS: Guest can view public frame {frame_id}")
        else:
            print("SKIP: No frames available to test single frame access")
    
    def test_create_frame_requires_auth(self):
        """POST /api/frames - Creating frame requires authentication"""
        payload = {
            "image_url": "https://example.com/test.jpg",
            "caption": "Test caption",
            "visibility": "public"
        }
        response = requests.post(f"{BASE_URL}/api/frames", json=payload)
        assert response.status_code == 401, f"Expected 401 for unauthenticated create, got {response.status_code}"
        print("SUCCESS: Create frame requires authentication")


class TestFramesAuthenticated:
    """Test authenticated user access to Frames"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if login_response.status_code != 200:
            pytest.skip(f"Login failed: {login_response.status_code}")
        
        self.token = login_response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.user = login_response.json().get("user", {})
    
    def test_create_frame_public(self):
        """POST /api/frames - Create public frame"""
        payload = {
            "image_url": "https://images.unsplash.com/photo-1596768453698-863c3810414e",
            "caption": "TEST_frame_public - Test public frame",
            "visibility": "public"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/frames",
            json=payload,
            headers=self.headers
        )
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        frame = response.json()
        assert frame["image_url"] == payload["image_url"]
        assert frame["caption"] == payload["caption"]
        assert frame["visibility"] == "public"
        assert "id" in frame
        assert "creator_id" in frame
        assert "creator_name" in frame
        assert "created_at" in frame
        
        # Store for cleanup
        self.created_frame_id = frame["id"]
        print(f"SUCCESS: Created public frame {frame['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/frames/{frame['id']}", headers=self.headers)
    
    def test_create_frame_private(self):
        """POST /api/frames - Create private (draft) frame"""
        payload = {
            "image_url": "https://images.unsplash.com/photo-1596768453698-863c3810414e",
            "caption": "TEST_frame_private - Private draft",
            "visibility": "private"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/frames",
            json=payload,
            headers=self.headers
        )
        
        assert response.status_code == 201
        
        frame = response.json()
        assert frame["visibility"] == "private"
        print(f"SUCCESS: Created private frame {frame['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/frames/{frame['id']}", headers=self.headers)
    
    def test_create_frame_circle_only(self):
        """POST /api/frames - Create circle-only frame"""
        payload = {
            "image_url": "https://images.unsplash.com/photo-1596768453698-863c3810414e",
            "caption": "TEST_frame_circle - Circle only",
            "visibility": "circle"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/frames",
            json=payload,
            headers=self.headers
        )
        
        assert response.status_code == 201
        
        frame = response.json()
        assert frame["visibility"] == "circle"
        print(f"SUCCESS: Created circle-only frame {frame['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/frames/{frame['id']}", headers=self.headers)
    
    def test_create_frame_no_caption(self):
        """POST /api/frames - Create frame without caption (optional)"""
        payload = {
            "image_url": "https://images.unsplash.com/photo-1596768453698-863c3810414e",
            "visibility": "public"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/frames",
            json=payload,
            headers=self.headers
        )
        
        assert response.status_code == 201
        
        frame = response.json()
        assert frame["caption"] is None or frame["caption"] == ""
        print(f"SUCCESS: Created frame without caption {frame['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/frames/{frame['id']}", headers=self.headers)
    
    def test_create_frame_invalid_visibility(self):
        """POST /api/frames - Invalid visibility rejected"""
        payload = {
            "image_url": "https://example.com/test.jpg",
            "caption": "Test",
            "visibility": "invalid_visibility"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/frames",
            json=payload,
            headers=self.headers
        )
        
        assert response.status_code == 400, f"Expected 400 for invalid visibility, got {response.status_code}"
        print("SUCCESS: Invalid visibility rejected with 400")
    
    def test_create_frame_missing_image(self):
        """POST /api/frames - Missing image_url rejected"""
        payload = {
            "caption": "Test without image",
            "visibility": "public"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/frames",
            json=payload,
            headers=self.headers
        )
        
        assert response.status_code == 422, f"Expected 422 for missing image, got {response.status_code}"
        print("SUCCESS: Missing image_url rejected with 422")
    
    def test_get_my_frames(self):
        """GET /api/frames/mine - Get user's own frames"""
        response = requests.get(
            f"{BASE_URL}/api/frames/mine",
            headers=self.headers
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert "frames" in data
        assert "total" in data
        print(f"SUCCESS: Got user's frames. Total: {data['total']}")
    
    def test_get_my_frames_requires_auth(self):
        """GET /api/frames/mine - Requires authentication"""
        response = requests.get(f"{BASE_URL}/api/frames/mine")
        assert response.status_code == 401
        print("SUCCESS: /api/frames/mine requires authentication")
    
    def test_authenticated_user_sees_create_button(self):
        """Authenticated users should see Create button in header"""
        # This is a frontend test, but we verify the API supports it
        response = requests.get(
            f"{BASE_URL}/api/frames",
            headers=self.headers
        )
        assert response.status_code == 200
        print("SUCCESS: Authenticated user can access frames API")


class TestFrameDetail:
    """Test frame detail and modal functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if login_response.status_code != 200:
            pytest.skip(f"Login failed: {login_response.status_code}")
        
        self.token = login_response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_frame_detail_has_creator_info(self):
        """Frame detail includes creator info"""
        # Get a frame
        list_response = requests.get(f"{BASE_URL}/api/frames")
        assert list_response.status_code == 200
        
        data = list_response.json()
        if data["frames"]:
            frame_id = data["frames"][0]["id"]
            
            response = requests.get(f"{BASE_URL}/api/frames/{frame_id}")
            assert response.status_code == 200
            
            frame = response.json()
            assert "creator_id" in frame
            assert "creator_name" in frame
            # creator_avatar is optional
            print(f"SUCCESS: Frame detail has creator info")
        else:
            print("SKIP: No frames to test")
    
    def test_frame_detail_no_likes_comments(self):
        """Frame detail should NOT have likes/comments (calm tech)"""
        list_response = requests.get(f"{BASE_URL}/api/frames")
        assert list_response.status_code == 200
        
        data = list_response.json()
        if data["frames"]:
            frame_id = data["frames"][0]["id"]
            
            response = requests.get(f"{BASE_URL}/api/frames/{frame_id}")
            assert response.status_code == 200
            
            frame = response.json()
            # Verify calm tech design - no engagement metrics
            assert "likes" not in frame, "Frame should NOT have likes"
            assert "comments" not in frame, "Frame should NOT have comments"
            assert "reactions" not in frame, "Frame should NOT have reactions"
            assert "views" not in frame, "Frame should NOT have view count"
            print("SUCCESS: Frame detail follows calm tech design (no likes/comments)")
        else:
            print("SKIP: No frames to test")
    
    def test_invalid_frame_id(self):
        """GET /api/frames/:id - Invalid ID returns 400"""
        response = requests.get(f"{BASE_URL}/api/frames/invalid-id")
        assert response.status_code == 400
        print("SUCCESS: Invalid frame ID returns 400")
    
    def test_nonexistent_frame_id(self):
        """GET /api/frames/:id - Non-existent ID returns 404"""
        # Use a valid ObjectId format but non-existent
        response = requests.get(f"{BASE_URL}/api/frames/000000000000000000000000")
        assert response.status_code == 404
        print("SUCCESS: Non-existent frame ID returns 404")


class TestFrameVisibility:
    """Test frame visibility rules"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if login_response.status_code != 200:
            pytest.skip(f"Login failed: {login_response.status_code}")
        
        self.token = login_response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_private_frame_not_visible_to_guest(self):
        """Private frames should not be visible to guests"""
        # Create a private frame
        payload = {
            "image_url": "https://images.unsplash.com/photo-1596768453698-863c3810414e",
            "caption": "TEST_private_visibility",
            "visibility": "private"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/frames",
            json=payload,
            headers=self.headers
        )
        
        assert create_response.status_code == 201
        frame_id = create_response.json()["id"]
        
        # Try to access as guest
        guest_response = requests.get(f"{BASE_URL}/api/frames/{frame_id}")
        assert guest_response.status_code == 404, "Private frame should not be visible to guest"
        
        print("SUCCESS: Private frame not visible to guest")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/frames/{frame_id}", headers=self.headers)
    
    def test_owner_can_see_own_private_frame(self):
        """Owner can see their own private frames"""
        # Create a private frame
        payload = {
            "image_url": "https://images.unsplash.com/photo-1596768453698-863c3810414e",
            "caption": "TEST_owner_private",
            "visibility": "private"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/frames",
            json=payload,
            headers=self.headers
        )
        
        assert create_response.status_code == 201
        frame_id = create_response.json()["id"]
        
        # Owner can access
        owner_response = requests.get(
            f"{BASE_URL}/api/frames/{frame_id}",
            headers=self.headers
        )
        assert owner_response.status_code == 200
        
        print("SUCCESS: Owner can see own private frame")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/frames/{frame_id}", headers=self.headers)


class TestFrameSafetyFeatures:
    """Test frame safety features (report, hide)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if login_response.status_code != 200:
            pytest.skip(f"Login failed: {login_response.status_code}")
        
        self.token = login_response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_hide_frame_requires_auth(self):
        """POST /api/frames/:id/hide - Requires authentication"""
        # Get a frame ID
        list_response = requests.get(f"{BASE_URL}/api/frames")
        if list_response.json()["frames"]:
            frame_id = list_response.json()["frames"][0]["id"]
            
            response = requests.post(f"{BASE_URL}/api/frames/{frame_id}/hide")
            assert response.status_code == 401
            print("SUCCESS: Hide frame requires authentication")
        else:
            print("SKIP: No frames to test")
    
    def test_report_frame_requires_auth(self):
        """POST /api/frames/:id/report - Requires authentication"""
        list_response = requests.get(f"{BASE_URL}/api/frames")
        if list_response.json()["frames"]:
            frame_id = list_response.json()["frames"][0]["id"]
            
            response = requests.post(
                f"{BASE_URL}/api/frames/{frame_id}/report?reason=test"
            )
            assert response.status_code == 401
            print("SUCCESS: Report frame requires authentication")
        else:
            print("SKIP: No frames to test")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
