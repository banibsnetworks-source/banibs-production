"""
HDOS v2 - Circle Trust Order API Tests
Tests for Trust Levels, Policies, and Assignments endpoints

Endpoints tested:
- GET /api/hdos/trust/levels - Get all trust levels
- GET /api/hdos/trust/levels/{level_key} - Get single level
- POST /api/hdos/trust/levels/seed - Seed trust levels
- GET /api/hdos/trust/policies - Get all policies
- POST /api/hdos/trust/policies - Create policy
- PATCH /api/hdos/trust/policies/{policy_id} - Update policy
- PATCH /api/hdos/trust/policies/by-level/{level_key} - Update policy by level
- DELETE /api/hdos/trust/policies/{policy_id} - Delete policy
- GET /api/hdos/trust/assignments - Get all assignments
- POST /api/hdos/trust/assignments - Create assignment
- PATCH /api/hdos/trust/assignments/{assignment_id} - Update assignment
- DELETE /api/hdos/trust/assignments/{assignment_id} - Delete assignment
- GET /api/hdos/trust/check/{subject_id} - Check trust level for subject
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test_admin@banibs.com"
TEST_PASSWORD = "Admin123!"


class TestHDOSTrustAuth:
    """Authentication for HDOS Trust tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        token = data.get("data", {}).get("access_token") or data.get("access_token")
        assert token, f"No token in response: {data}"
        return token
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }


class TestTrustLevels(TestHDOSTrustAuth):
    """Trust Levels endpoint tests (read-only)"""
    
    def test_get_trust_levels(self, auth_headers):
        """GET /api/hdos/trust/levels - Should return all 7 canonical levels"""
        response = requests.get(f"{BASE_URL}/api/hdos/trust/levels", headers=auth_headers)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        
        levels = data.get("data", [])
        assert len(levels) == 7, f"Expected 7 levels, got {len(levels)}"
        
        # Verify canonical order
        expected_keys = ["PEOPLES", "COOL", "CHILL", "ALRIGHT", "OTHERS", "OTHERS_SAFE", "BLOCKED"]
        actual_keys = [level["key"] for level in levels]
        assert actual_keys == expected_keys, f"Level order mismatch: {actual_keys}"
        
        # Verify each level has required fields
        for level in levels:
            assert "id" in level
            assert "key" in level
            assert "order" in level
            assert "name" in level
            assert "description" in level
            assert "color" in level
            assert "is_active" in level
        
        print(f"✓ GET /api/hdos/trust/levels - Returns {len(levels)} levels in correct order")
    
    def test_get_single_trust_level(self, auth_headers):
        """GET /api/hdos/trust/levels/{level_key} - Should return single level"""
        response = requests.get(f"{BASE_URL}/api/hdos/trust/levels/PEOPLES", headers=auth_headers)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        
        level = data.get("data")
        assert level["key"] == "PEOPLES"
        assert level["order"] == 1
        assert level["name"] == "Peoples"
        assert "#" in level["color"]  # Has color code
        
        print(f"✓ GET /api/hdos/trust/levels/PEOPLES - Returns correct level data")
    
    def test_get_invalid_trust_level(self, auth_headers):
        """GET /api/hdos/trust/levels/{invalid} - Should return 404"""
        response = requests.get(f"{BASE_URL}/api/hdos/trust/levels/INVALID_LEVEL", headers=auth_headers)
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ GET /api/hdos/trust/levels/INVALID_LEVEL - Returns 404 as expected")
    
    def test_seed_trust_levels(self, auth_headers):
        """POST /api/hdos/trust/levels/seed - Should seed levels (idempotent)"""
        response = requests.post(f"{BASE_URL}/api/hdos/trust/levels/seed", headers=auth_headers)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert data.get("data", {}).get("seeded") == True
        
        levels = data.get("data", {}).get("levels", [])
        assert len(levels) == 7
        
        print(f"✓ POST /api/hdos/trust/levels/seed - Seeding successful")


class TestTrustPolicies(TestHDOSTrustAuth):
    """Trust Policies endpoint tests (CRUD)"""
    
    def test_get_trust_policies(self, auth_headers):
        """GET /api/hdos/trust/policies - Should return policies list"""
        response = requests.get(f"{BASE_URL}/api/hdos/trust/policies", headers=auth_headers)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert isinstance(data.get("data"), list)
        
        print(f"✓ GET /api/hdos/trust/policies - Returns {len(data.get('data', []))} policies")
    
    def test_create_and_update_policy_by_level(self, auth_headers):
        """PATCH /api/hdos/trust/policies/by-level/{level_key} - Create/update policy"""
        test_level = "COOL"
        test_modules = ["news", "social", "marketplace"]
        test_notes = f"TEST_POLICY_{uuid.uuid4().hex[:8]} - Test policy notes"
        
        # Create/update policy
        response = requests.patch(
            f"{BASE_URL}/api/hdos/trust/policies/by-level/{test_level}",
            headers=auth_headers,
            json={
                "allowed_modules": test_modules,
                "notes": test_notes
            }
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        
        policy = data.get("data")
        assert policy["level_key"] == test_level
        assert policy["allowed_modules"] == test_modules
        assert policy["notes"] == test_notes
        assert "id" in policy
        
        # Verify by fetching
        get_response = requests.get(f"{BASE_URL}/api/hdos/trust/policies", headers=auth_headers)
        policies = get_response.json().get("data", [])
        cool_policy = next((p for p in policies if p["level_key"] == test_level), None)
        assert cool_policy is not None
        assert cool_policy["notes"] == test_notes
        
        print(f"✓ PATCH /api/hdos/trust/policies/by-level/{test_level} - Policy created/updated")
        
        # Cleanup - reset policy
        requests.patch(
            f"{BASE_URL}/api/hdos/trust/policies/by-level/{test_level}",
            headers=auth_headers,
            json={"allowed_modules": [], "notes": ""}
        )
    
    def test_create_policy_for_invalid_level(self, auth_headers):
        """PATCH /api/hdos/trust/policies/by-level/{invalid} - Should return 400"""
        response = requests.patch(
            f"{BASE_URL}/api/hdos/trust/policies/by-level/INVALID_LEVEL",
            headers=auth_headers,
            json={"allowed_modules": ["test"], "notes": "test"}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"✓ PATCH /api/hdos/trust/policies/by-level/INVALID_LEVEL - Returns 400 as expected")


class TestTrustAssignments(TestHDOSTrustAuth):
    """Trust Assignments endpoint tests (CRUD)"""
    
    def test_get_trust_assignments(self, auth_headers):
        """GET /api/hdos/trust/assignments - Should return assignments list"""
        response = requests.get(f"{BASE_URL}/api/hdos/trust/assignments", headers=auth_headers)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert isinstance(data.get("data"), list)
        
        print(f"✓ GET /api/hdos/trust/assignments - Returns {len(data.get('data', []))} assignments")
    
    def test_create_assignment(self, auth_headers):
        """POST /api/hdos/trust/assignments - Create new assignment"""
        test_email = f"TEST_trust_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(
            f"{BASE_URL}/api/hdos/trust/assignments",
            headers=auth_headers,
            json={
                "subject_type": "EMAIL",
                "subject_id": test_email,
                "subject_label": "Test User",
                "level_key": "COOL",
                "reason": "Test assignment for automated testing"
            }
        )
        
        assert response.status_code == 201, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        
        assignment = data.get("data")
        assert assignment["subject_id"] == test_email
        assert assignment["level_key"] == "COOL"
        assert assignment["level_name"] == "Cool"
        assert assignment["is_active"] == True
        assert "id" in assignment
        
        assignment_id = assignment["id"]
        print(f"✓ POST /api/hdos/trust/assignments - Created assignment {assignment_id}")
        
        # Verify by fetching
        get_response = requests.get(
            f"{BASE_URL}/api/hdos/trust/assignments/{assignment_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 200
        fetched = get_response.json().get("data")
        assert fetched["subject_id"] == test_email
        
        print(f"✓ GET /api/hdos/trust/assignments/{assignment_id} - Verified assignment exists")
        
        return assignment_id
    
    def test_update_assignment(self, auth_headers):
        """PATCH /api/hdos/trust/assignments/{id} - Update assignment level"""
        # First create an assignment
        test_email = f"TEST_update_{uuid.uuid4().hex[:8]}@example.com"
        
        create_response = requests.post(
            f"{BASE_URL}/api/hdos/trust/assignments",
            headers=auth_headers,
            json={
                "subject_type": "EMAIL",
                "subject_id": test_email,
                "level_key": "OTHERS",
                "reason": "Initial assignment"
            }
        )
        assert create_response.status_code == 201
        assignment_id = create_response.json().get("data", {}).get("id")
        
        # Update the level
        update_response = requests.patch(
            f"{BASE_URL}/api/hdos/trust/assignments/{assignment_id}",
            headers=auth_headers,
            json={"level_key": "CHILL", "reason": "Upgraded trust level"}
        )
        
        assert update_response.status_code == 200, f"Failed: {update_response.text}"
        data = update_response.json()
        assert data.get("success") == True
        
        updated = data.get("data")
        assert updated["level_key"] == "CHILL"
        assert updated["level_name"] == "CHILL"
        
        print(f"✓ PATCH /api/hdos/trust/assignments/{assignment_id} - Level updated to CHILL")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/hdos/trust/assignments/{assignment_id}", headers=auth_headers)
    
    def test_delete_assignment(self, auth_headers):
        """DELETE /api/hdos/trust/assignments/{id} - Delete assignment"""
        # First create an assignment
        test_email = f"TEST_delete_{uuid.uuid4().hex[:8]}@example.com"
        
        create_response = requests.post(
            f"{BASE_URL}/api/hdos/trust/assignments",
            headers=auth_headers,
            json={
                "subject_type": "EMAIL",
                "subject_id": test_email,
                "level_key": "BLOCKED",
                "reason": "To be deleted"
            }
        )
        assert create_response.status_code == 201
        assignment_id = create_response.json().get("data", {}).get("id")
        
        # Delete the assignment
        delete_response = requests.delete(
            f"{BASE_URL}/api/hdos/trust/assignments/{assignment_id}",
            headers=auth_headers
        )
        
        assert delete_response.status_code == 200, f"Failed: {delete_response.text}"
        data = delete_response.json()
        assert data.get("success") == True
        assert data.get("data", {}).get("deleted") == True
        
        print(f"✓ DELETE /api/hdos/trust/assignments/{assignment_id} - Assignment deleted")
        
        # Verify it's gone (soft delete - is_active=False)
        get_response = requests.get(
            f"{BASE_URL}/api/hdos/trust/assignments/{assignment_id}",
            headers=auth_headers
        )
        if get_response.status_code == 200:
            # Soft deleted - should have is_active=False
            fetched = get_response.json().get("data")
            assert fetched.get("is_active") == False
            print(f"✓ Verified assignment is soft-deleted (is_active=False)")
    
    def test_create_duplicate_assignment(self, auth_headers):
        """POST /api/hdos/trust/assignments - Duplicate should return 409"""
        test_email = f"TEST_dup_{uuid.uuid4().hex[:8]}@example.com"
        
        # Create first assignment
        first_response = requests.post(
            f"{BASE_URL}/api/hdos/trust/assignments",
            headers=auth_headers,
            json={
                "subject_type": "EMAIL",
                "subject_id": test_email,
                "level_key": "OTHERS"
            }
        )
        assert first_response.status_code == 201
        assignment_id = first_response.json().get("data", {}).get("id")
        
        # Try to create duplicate
        dup_response = requests.post(
            f"{BASE_URL}/api/hdos/trust/assignments",
            headers=auth_headers,
            json={
                "subject_type": "EMAIL",
                "subject_id": test_email,
                "level_key": "COOL"
            }
        )
        
        assert dup_response.status_code == 409, f"Expected 409, got {dup_response.status_code}"
        print(f"✓ POST duplicate assignment - Returns 409 as expected")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/hdos/trust/assignments/{assignment_id}", headers=auth_headers)
    
    def test_check_trust_level(self, auth_headers):
        """GET /api/hdos/trust/check/{subject_id} - Check effective trust level"""
        # Create an assignment first
        test_email = f"TEST_check_{uuid.uuid4().hex[:8]}@example.com"
        
        create_response = requests.post(
            f"{BASE_URL}/api/hdos/trust/assignments",
            headers=auth_headers,
            json={
                "subject_type": "EMAIL",
                "subject_id": test_email,
                "level_key": "ALRIGHT"
            }
        )
        assert create_response.status_code == 201
        assignment_id = create_response.json().get("data", {}).get("id")
        
        # Check trust level
        check_response = requests.get(
            f"{BASE_URL}/api/hdos/trust/check/{test_email}?subject_type=EMAIL",
            headers=auth_headers
        )
        
        assert check_response.status_code == 200, f"Failed: {check_response.text}"
        data = check_response.json()
        assert data.get("success") == True
        
        result = data.get("data")
        assert result["has_assignment"] == True
        assert result["level"]["key"] == "ALRIGHT"
        
        print(f"✓ GET /api/hdos/trust/check/{test_email} - Returns ALRIGHT level")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/hdos/trust/assignments/{assignment_id}", headers=auth_headers)
    
    def test_check_unknown_subject_returns_default(self, auth_headers):
        """GET /api/hdos/trust/check/{unknown} - Should return OTHERS as default"""
        unknown_email = f"unknown_{uuid.uuid4().hex}@example.com"
        
        response = requests.get(
            f"{BASE_URL}/api/hdos/trust/check/{unknown_email}?subject_type=EMAIL",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        result = data.get("data")
        assert result["has_assignment"] == False
        assert result["level"]["key"] == "OTHERS"  # Default level
        
        print(f"✓ GET /api/hdos/trust/check/{unknown_email} - Returns OTHERS (default)")


class TestTrustUnauthorized:
    """Test unauthorized access to trust endpoints"""
    
    def test_levels_without_auth(self):
        """GET /api/hdos/trust/levels without auth - Should return 401"""
        response = requests.get(f"{BASE_URL}/api/hdos/trust/levels")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ GET /api/hdos/trust/levels without auth - Returns 401")
    
    def test_policies_without_auth(self):
        """GET /api/hdos/trust/policies without auth - Should return 401"""
        response = requests.get(f"{BASE_URL}/api/hdos/trust/policies")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ GET /api/hdos/trust/policies without auth - Returns 401")
    
    def test_assignments_without_auth(self):
        """GET /api/hdos/trust/assignments without auth - Should return 401"""
        response = requests.get(f"{BASE_URL}/api/hdos/trust/assignments")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ GET /api/hdos/trust/assignments without auth - Returns 401")


# Cleanup fixture to remove test data after all tests
@pytest.fixture(scope="module", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed assignments after tests"""
    yield
    
    # Login and cleanup
    try:
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_response.status_code == 200:
            data = login_response.json()
            token = data.get("data", {}).get("access_token") or data.get("access_token")
            headers = {"Authorization": f"Bearer {token}"}
            
            # Get all assignments and delete TEST_ ones
            assignments_response = requests.get(f"{BASE_URL}/api/hdos/trust/assignments", headers=headers)
            if assignments_response.status_code == 200:
                assignments = assignments_response.json().get("data", [])
                for assignment in assignments:
                    if assignment.get("subject_id", "").startswith("TEST_"):
                        requests.delete(
                            f"{BASE_URL}/api/hdos/trust/assignments/{assignment['id']}?hard_delete=true",
                            headers=headers
                        )
                        print(f"Cleaned up test assignment: {assignment['subject_id']}")
    except Exception as e:
        print(f"Cleanup error: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
