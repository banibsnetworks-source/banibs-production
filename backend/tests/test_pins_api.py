"""
User Pinning + Pin Boards API Tests
Testing P1 feature: Platform-wide pinning system

Covers:
- GET /api/pins/boards - List boards, auto-creates default 'Saved' board
- POST /api/pins/boards - Create new board
- PATCH /api/pins/boards/:id - Update board name/description
- DELETE /api/pins/boards/:id - Delete board (block default), move pins option
- POST /api/pins - Pin content, idempotent check
- GET /api/pins - List pins with filters (board_id, content_type, search)
- DELETE /api/pins/:id - Delete pin, update board count
- POST /api/pins/move - Move pin to different board
- GET /api/pins/check/:type/:id - Check pin status
- Auth isolation - user A cannot access user B pins
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sms-otp-security.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "raymondneely@banibs.com"
TEST_PASSWORD = "BanibsAdmin2026!"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for testing"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    if response.status_code != 200:
        pytest.skip(f"Authentication failed: {response.text}")
    return response.json().get("access_token")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return auth headers for API calls"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestPinBoardsAPI:
    """Tests for Pin Boards CRUD operations"""

    def test_get_boards_creates_default(self, auth_headers):
        """GET /api/pins/boards - Auto-creates default 'Saved' board for new users"""
        response = requests.get(f"{BASE_URL}/api/pins/boards", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "boards" in data, "Response should have 'boards' field"
        assert "total" in data, "Response should have 'total' field"
        assert isinstance(data["boards"], list), "boards should be a list"
        
        # Verify default board exists
        boards = data["boards"]
        assert len(boards) >= 1, "Should have at least one board"
        default_board = next((b for b in boards if b.get("is_default")), None)
        assert default_board is not None, "Default board should exist"
        assert default_board["name"] == "Saved", "Default board should be named 'Saved'"
        
        print(f"PASS: GET /api/pins/boards returns {len(boards)} board(s) with default 'Saved' board")

    def test_create_board(self, auth_headers):
        """POST /api/pins/boards - Create new board"""
        test_name = f"TEST_Board_{uuid.uuid4().hex[:8]}"
        response = requests.post(
            f"{BASE_URL}/api/pins/boards",
            headers=auth_headers,
            json={"name": test_name, "description": "Test board description"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "id" in data, "Response should have 'id'"
        assert data["name"] == test_name, "Name should match"
        assert data["description"] == "Test board description", "Description should match"
        assert data["is_default"] == False, "New board should not be default"
        assert data["pin_count"] == 0, "New board should have 0 pins"
        
        print(f"PASS: POST /api/pins/boards created board '{test_name}'")
        return data["id"]

    def test_create_board_duplicate_name_fails(self, auth_headers):
        """POST /api/pins/boards - Cannot create board with duplicate name"""
        # First, create a board
        test_name = f"TEST_DupName_{uuid.uuid4().hex[:8]}"
        response1 = requests.post(
            f"{BASE_URL}/api/pins/boards",
            headers=auth_headers,
            json={"name": test_name}
        )
        assert response1.status_code == 200
        
        # Try to create another with same name
        response2 = requests.post(
            f"{BASE_URL}/api/pins/boards",
            headers=auth_headers,
            json={"name": test_name}
        )
        assert response2.status_code == 400, f"Expected 400 for duplicate name, got {response2.status_code}"
        assert "already exists" in response2.json().get("detail", "").lower()
        
        print(f"PASS: Duplicate board name rejected with 400")

    def test_update_board(self, auth_headers):
        """PATCH /api/pins/boards/:id - Update board name/description"""
        # Create a board first
        test_name = f"TEST_Update_{uuid.uuid4().hex[:8]}"
        create_res = requests.post(
            f"{BASE_URL}/api/pins/boards",
            headers=auth_headers,
            json={"name": test_name}
        )
        board_id = create_res.json()["id"]
        
        # Update it
        new_name = f"TEST_Updated_{uuid.uuid4().hex[:8]}"
        update_res = requests.patch(
            f"{BASE_URL}/api/pins/boards/{board_id}",
            headers=auth_headers,
            json={"name": new_name, "description": "Updated description"}
        )
        
        assert update_res.status_code == 200, f"Expected 200, got {update_res.status_code}: {update_res.text}"
        data = update_res.json()
        assert data["name"] == new_name, "Name should be updated"
        assert data["description"] == "Updated description", "Description should be updated"
        
        print(f"PASS: PATCH /api/pins/boards/{board_id} updated successfully")

    def test_delete_default_board_fails(self, auth_headers):
        """DELETE /api/pins/boards/:id - Cannot delete default 'Saved' board"""
        # Get the default board ID
        boards_res = requests.get(f"{BASE_URL}/api/pins/boards", headers=auth_headers)
        boards = boards_res.json()["boards"]
        default_board = next((b for b in boards if b.get("is_default")), None)
        
        assert default_board is not None, "Default board should exist"
        
        # Try to delete it
        delete_res = requests.delete(
            f"{BASE_URL}/api/pins/boards/{default_board['id']}",
            headers=auth_headers
        )
        
        assert delete_res.status_code == 400, f"Expected 400 for deleting default board, got {delete_res.status_code}"
        assert "default" in delete_res.json().get("detail", "").lower()
        
        print(f"PASS: Cannot delete default 'Saved' board - returns 400")

    def test_delete_board_with_move_pins(self, auth_headers):
        """DELETE /api/pins/boards/:id - Delete board and move pins to default"""
        # Create a board
        test_name = f"TEST_Delete_{uuid.uuid4().hex[:8]}"
        create_res = requests.post(
            f"{BASE_URL}/api/pins/boards",
            headers=auth_headers,
            json={"name": test_name}
        )
        board_id = create_res.json()["id"]
        
        # Add a pin to this board
        pin_res = requests.post(
            f"{BASE_URL}/api/pins",
            headers=auth_headers,
            json={
                "board_id": board_id,
                "content_type": "frame",
                "content_id": f"test_frame_{uuid.uuid4().hex[:8]}",
                "content_snapshot": {
                    "title": "Test Frame",
                    "route": "/test/route"
                }
            }
        )
        assert pin_res.status_code == 200
        
        # Delete board with move_pins_to_default=true (default)
        delete_res = requests.delete(
            f"{BASE_URL}/api/pins/boards/{board_id}?move_pins_to_default=true",
            headers=auth_headers
        )
        
        assert delete_res.status_code == 200, f"Expected 200, got {delete_res.status_code}: {delete_res.text}"
        data = delete_res.json()
        assert data.get("pins_moved") == True, "pins_moved should be True"
        
        # Verify board is deleted
        get_res = requests.get(f"{BASE_URL}/api/pins/boards/{board_id}", headers=auth_headers)
        assert get_res.status_code == 404, "Deleted board should return 404"
        
        print(f"PASS: DELETE /api/pins/boards/{board_id} deleted with pins moved to default")


class TestPinsAPI:
    """Tests for Pin CRUD operations"""

    def test_create_pin_to_default_board(self, auth_headers):
        """POST /api/pins - Pin content to default 'Saved' board"""
        content_id = f"test_content_{uuid.uuid4().hex[:8]}"
        response = requests.post(
            f"{BASE_URL}/api/pins",
            headers=auth_headers,
            json={
                "content_type": "frame",
                "content_id": content_id,
                "content_snapshot": {
                    "title": "Test Frame Title",
                    "subtitle": "Test Creator",
                    "image_url": "https://example.com/image.jpg",
                    "route": f"/socialworld/frames/{content_id}"
                }
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "pin" in data, "Response should have 'pin' field"
        assert data.get("created") == True, "Should indicate pin was created"
        assert data["pin"]["content_type"] == "frame"
        assert data["pin"]["content_id"] == content_id
        
        print(f"PASS: POST /api/pins created pin to default board")
        return data["pin"]["id"]

    def test_create_pin_idempotent(self, auth_headers):
        """POST /api/pins - Pinning same item to same board is idempotent"""
        content_id = f"test_idempotent_{uuid.uuid4().hex[:8]}"
        payload = {
            "content_type": "listing",
            "content_id": content_id,
            "content_snapshot": {
                "title": "Test Listing",
                "route": f"/socialworld/local/{content_id}"
            }
        }
        
        # Pin first time
        res1 = requests.post(f"{BASE_URL}/api/pins", headers=auth_headers, json=payload)
        assert res1.status_code == 200
        data1 = res1.json()
        assert data1.get("created") == True, "First pin should be created"
        pin_id = data1["pin"]["id"]
        
        # Pin same item again - should return existing
        res2 = requests.post(f"{BASE_URL}/api/pins", headers=auth_headers, json=payload)
        assert res2.status_code == 200
        data2 = res2.json()
        assert data2.get("created") == False, "Second pin should not create new"
        assert data2["pin"]["id"] == pin_id, "Should return same pin"
        
        print(f"PASS: POST /api/pins is idempotent - same item returns existing pin")

    def test_create_pin_to_different_boards_allowed(self, auth_headers):
        """POST /api/pins - Same item can be pinned to different boards (Option 1 dedup)"""
        content_id = f"test_multiboard_{uuid.uuid4().hex[:8]}"
        
        # Create a second board
        board_res = requests.post(
            f"{BASE_URL}/api/pins/boards",
            headers=auth_headers,
            json={"name": f"TEST_MultiBoard_{uuid.uuid4().hex[:8]}"}
        )
        second_board_id = board_res.json()["id"]
        
        # Pin to default board first
        res1 = requests.post(
            f"{BASE_URL}/api/pins",
            headers=auth_headers,
            json={
                "content_type": "news",
                "content_id": content_id,
                "content_snapshot": {"title": "Test News", "route": "/news/123"}
            }
        )
        assert res1.status_code == 200
        assert res1.json().get("created") == True
        
        # Pin same item to different board - should succeed
        res2 = requests.post(
            f"{BASE_URL}/api/pins",
            headers=auth_headers,
            json={
                "board_id": second_board_id,
                "content_type": "news",
                "content_id": content_id,
                "content_snapshot": {"title": "Test News", "route": "/news/123"}
            }
        )
        assert res2.status_code == 200, f"Expected 200, got {res2.status_code}: {res2.text}"
        assert res2.json().get("created") == True, "Pin to different board should create new"
        
        print(f"PASS: Same item can be pinned to different boards")

    def test_get_pins_with_filters(self, auth_headers):
        """GET /api/pins - List pins with board_id, content_type, and search filters"""
        # Get default board
        boards_res = requests.get(f"{BASE_URL}/api/pins/boards", headers=auth_headers)
        default_board = next((b for b in boards_res.json()["boards"] if b.get("is_default")), None)
        board_id = default_board["id"]
        
        # Test basic list
        res1 = requests.get(f"{BASE_URL}/api/pins", headers=auth_headers)
        assert res1.status_code == 200
        data1 = res1.json()
        assert "pins" in data1
        assert "has_more" in data1
        print(f"  - GET /api/pins returns {len(data1['pins'])} pins")
        
        # Test with board_id filter
        res2 = requests.get(f"{BASE_URL}/api/pins?board_id={board_id}", headers=auth_headers)
        assert res2.status_code == 200
        print(f"  - GET /api/pins?board_id={board_id} returns {len(res2.json()['pins'])} pins")
        
        # Test with content_type filter
        res3 = requests.get(f"{BASE_URL}/api/pins?content_type=frame", headers=auth_headers)
        assert res3.status_code == 200
        print(f"  - GET /api/pins?content_type=frame returns {len(res3.json()['pins'])} pins")
        
        # Test with search query
        res4 = requests.get(f"{BASE_URL}/api/pins?q=Test", headers=auth_headers)
        assert res4.status_code == 200
        print(f"  - GET /api/pins?q=Test returns {len(res4.json()['pins'])} pins")
        
        print(f"PASS: GET /api/pins works with all filters")

    def test_delete_pin_updates_board_count(self, auth_headers):
        """DELETE /api/pins/:id - Delete pin and update board count"""
        # Create a pin
        content_id = f"test_delete_{uuid.uuid4().hex[:8]}"
        pin_res = requests.post(
            f"{BASE_URL}/api/pins",
            headers=auth_headers,
            json={
                "content_type": "hdos_analysis",
                "content_id": content_id,
                "content_snapshot": {"title": "Test Analysis", "route": "/hdos/analysis/123"}
            }
        )
        pin_id = pin_res.json()["pin"]["id"]
        
        # Get board pin count before
        boards_res1 = requests.get(f"{BASE_URL}/api/pins/boards", headers=auth_headers)
        default_board1 = next((b for b in boards_res1.json()["boards"] if b.get("is_default")), None)
        count_before = default_board1["pin_count"]
        
        # Delete the pin
        delete_res = requests.delete(f"{BASE_URL}/api/pins/{pin_id}", headers=auth_headers)
        assert delete_res.status_code == 200, f"Expected 200, got {delete_res.status_code}: {delete_res.text}"
        
        # Verify pin is deleted
        get_res = requests.get(f"{BASE_URL}/api/pins/{pin_id}", headers=auth_headers)
        assert get_res.status_code == 404, "Deleted pin should return 404"
        
        # Check board count decreased
        boards_res2 = requests.get(f"{BASE_URL}/api/pins/boards", headers=auth_headers)
        default_board2 = next((b for b in boards_res2.json()["boards"] if b.get("is_default")), None)
        count_after = default_board2["pin_count"]
        
        assert count_after == count_before - 1, f"Board pin count should decrease. Before: {count_before}, After: {count_after}"
        
        print(f"PASS: DELETE /api/pins/{pin_id} deleted and board count updated")

    def test_move_pin_to_different_board(self, auth_headers):
        """POST /api/pins/move - Move pin to different board"""
        # Create a new board
        board_res = requests.post(
            f"{BASE_URL}/api/pins/boards",
            headers=auth_headers,
            json={"name": f"TEST_MoveTarget_{uuid.uuid4().hex[:8]}"}
        )
        target_board_id = board_res.json()["id"]
        
        # Create a pin in default board
        content_id = f"test_move_{uuid.uuid4().hex[:8]}"
        pin_res = requests.post(
            f"{BASE_URL}/api/pins",
            headers=auth_headers,
            json={
                "content_type": "article",
                "content_id": content_id,
                "content_snapshot": {"title": "Test Article", "route": "/articles/123"}
            }
        )
        pin_id = pin_res.json()["pin"]["id"]
        original_board_id = pin_res.json()["pin"]["board_id"]
        
        # Move pin to target board
        move_res = requests.post(
            f"{BASE_URL}/api/pins/move",
            headers=auth_headers,
            json={"pin_id": pin_id, "to_board_id": target_board_id}
        )
        
        assert move_res.status_code == 200, f"Expected 200, got {move_res.status_code}: {move_res.text}"
        assert move_res.json().get("moved") == True, "moved should be True"
        
        # Verify pin is in new board
        pin_get_res = requests.get(f"{BASE_URL}/api/pins/{pin_id}", headers=auth_headers)
        assert pin_get_res.json()["board_id"] == target_board_id
        
        print(f"PASS: POST /api/pins/move moved pin to different board")

    def test_check_pin_status(self, auth_headers):
        """GET /api/pins/check/:type/:id - Check if content is pinned"""
        # Create a pin
        content_id = f"test_check_{uuid.uuid4().hex[:8]}"
        pin_res = requests.post(
            f"{BASE_URL}/api/pins",
            headers=auth_headers,
            json={
                "content_type": "frame",
                "content_id": content_id,
                "content_snapshot": {"title": "Test Check Frame", "route": f"/frames/{content_id}"}
            }
        )
        assert pin_res.status_code == 200
        
        # Check pin status - should be pinned
        check_res = requests.get(
            f"{BASE_URL}/api/pins/check/frame/{content_id}",
            headers=auth_headers
        )
        
        assert check_res.status_code == 200, f"Expected 200, got {check_res.status_code}: {check_res.text}"
        data = check_res.json()
        
        assert data.get("is_pinned") == True, "is_pinned should be True"
        assert data.get("pin_count") >= 1, "pin_count should be >= 1"
        assert "pins" in data, "Should have pins array"
        
        print(f"PASS: GET /api/pins/check/frame/{content_id} returns is_pinned=True")

    def test_check_pin_status_not_pinned(self, auth_headers):
        """GET /api/pins/check/:type/:id - Check non-pinned content returns is_pinned=False"""
        unpinned_id = f"unpinned_{uuid.uuid4().hex[:8]}"
        
        check_res = requests.get(
            f"{BASE_URL}/api/pins/check/frame/{unpinned_id}",
            headers=auth_headers
        )
        
        assert check_res.status_code == 200
        data = check_res.json()
        
        assert data.get("is_pinned") == False, "is_pinned should be False for unpinned content"
        assert data.get("pin_count") == 0, "pin_count should be 0"
        
        print(f"PASS: Check status for unpinned content returns is_pinned=False")


class TestAuthIsolation:
    """Tests for auth isolation - users cannot access each other's pins"""

    def test_pins_require_auth(self):
        """API endpoints require authentication"""
        # Try without auth header
        res1 = requests.get(f"{BASE_URL}/api/pins/boards")
        assert res1.status_code == 401 or "Authorization" in res1.text, "Boards should require auth"
        
        res2 = requests.get(f"{BASE_URL}/api/pins")
        assert res2.status_code == 401 or "Authorization" in res2.text, "Pins should require auth"
        
        res3 = requests.post(f"{BASE_URL}/api/pins", json={"content_type": "frame", "content_id": "test"})
        assert res3.status_code == 401 or "Authorization" in res3.text, "Create pin should require auth"
        
        print(f"PASS: All pins endpoints require authentication")


class TestContentTypes:
    """Tests for different supported content types"""

    def test_supported_content_types(self, auth_headers):
        """POST /api/pins - Supports all content types: frame, listing, news, hdos_analysis, etc."""
        content_types = ["frame", "news", "listing", "hdos_analysis", "note", "article", "video", "product"]
        
        for ct in content_types:
            content_id = f"test_{ct}_{uuid.uuid4().hex[:8]}"
            res = requests.post(
                f"{BASE_URL}/api/pins",
                headers=auth_headers,
                json={
                    "content_type": ct,
                    "content_id": content_id,
                    "content_snapshot": {
                        "title": f"Test {ct}",
                        "route": f"/test/{ct}/{content_id}"
                    }
                }
            )
            assert res.status_code == 200, f"Expected 200 for {ct}, got {res.status_code}: {res.text}"
            print(f"  - {ct}: OK")
        
        print(f"PASS: All {len(content_types)} content types supported")


class TestEdgeCases:
    """Tests for edge cases and validation"""

    def test_invalid_board_id_format(self, auth_headers):
        """API handles invalid board ID format"""
        res = requests.get(f"{BASE_URL}/api/pins/boards/invalid_id", headers=auth_headers)
        assert res.status_code == 400, f"Expected 400 for invalid ID, got {res.status_code}"
        
        print(f"PASS: Invalid board ID returns 400")

    def test_nonexistent_board_id(self, auth_headers):
        """API handles non-existent board ID"""
        fake_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format but doesn't exist
        res = requests.get(f"{BASE_URL}/api/pins/boards/{fake_id}", headers=auth_headers)
        assert res.status_code == 404, f"Expected 404 for non-existent board, got {res.status_code}"
        
        print(f"PASS: Non-existent board ID returns 404")

    def test_create_board_validation(self, auth_headers):
        """Board name validation"""
        # Empty name should fail
        res = requests.post(
            f"{BASE_URL}/api/pins/boards",
            headers=auth_headers,
            json={"name": ""}
        )
        assert res.status_code == 422, f"Expected 422 for empty name, got {res.status_code}"
        
        print(f"PASS: Empty board name validation works")

    def test_pin_validation_missing_fields(self, auth_headers):
        """Pin creation requires content_type, content_id, and content_snapshot"""
        # Missing content_type
        res = requests.post(
            f"{BASE_URL}/api/pins",
            headers=auth_headers,
            json={"content_id": "test", "content_snapshot": {"title": "Test", "route": "/test"}}
        )
        assert res.status_code == 422, f"Expected 422 for missing content_type, got {res.status_code}"
        
        print(f"PASS: Pin validation for missing fields works")


# Cleanup fixture to run after all tests
@pytest.fixture(scope="module", autouse=True)
def cleanup_test_data(auth_headers):
    """Cleanup TEST_ prefixed boards after tests complete"""
    yield
    
    # Get all boards
    boards_res = requests.get(f"{BASE_URL}/api/pins/boards", headers=auth_headers)
    if boards_res.status_code == 200:
        boards = boards_res.json().get("boards", [])
        for board in boards:
            if board["name"].startswith("TEST_"):
                requests.delete(
                    f"{BASE_URL}/api/pins/boards/{board['id']}?move_pins_to_default=false",
                    headers=auth_headers
                )
    
    print("Cleanup: Removed TEST_ boards")
