"""
Test Suite for Alternative School Hub - Tutor Intake API (Phase-0.5)
Tests:
- POST /api/alt-school/intake/tutors - Public submission
- GET /api/alt-school/admin/intake/tutors - Admin list
- GET /api/alt-school/admin/intake/stats - Admin stats
- PUT /api/alt-school/admin/intake/tutors/:id - Admin update
- Security: Unauthenticated access blocked
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "raymondneely@banibs.com"
ADMIN_PASSWORD = "BanibsAdmin2026!"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def auth_token(api_client):
    """Get authentication token for admin user"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json().get("access_token")


@pytest.fixture(scope="module")
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


class TestPublicTutorIntake:
    """Public endpoint tests for tutor intake submission"""
    
    def test_submit_valid_application(self, api_client):
        """POST /api/alt-school/intake/tutors - Valid submission returns {ok: true}"""
        unique_id = str(uuid.uuid4())[:8]
        payload = {
            "name": f"TEST_Dr. Test Educator {unique_id}",
            "email": f"test.educator.{unique_id}@example.com",
            "phone": "(555) 123-4567",
            "location": "Remote / Atlanta, GA",
            "subject_focus": "Mathematics and Science",
            "age_grade_range": "Grades 6-12",
            "bio": "I am a passionate educator with over 15 years of experience teaching mathematics and science to middle and high school students. I specialize in making complex concepts accessible.",
            "website": "https://example.com/educator",
            "availability": "Weekday afternoons, Flexible weekends",
            "consent_acknowledged": True
        }
        
        response = api_client.post(f"{BASE_URL}/api/alt-school/intake/tutors", json=payload)
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("ok") == True, "Response should have ok: true"
        assert "message" in data, "Response should have a message"
    
    def test_submit_missing_consent_returns_400(self, api_client):
        """POST /api/alt-school/intake/tutors - Missing consent checkbox returns 400"""
        payload = {
            "name": "TEST_No Consent User",
            "email": "noconsent@example.com",
            "location": "Remote",
            "subject_focus": "English",
            "age_grade_range": "K-5",
            "bio": "This is a test bio that is at least 50 characters long for validation purposes.",
            "consent_acknowledged": False  # Consent NOT acknowledged
        }
        
        response = api_client.post(f"{BASE_URL}/api/alt-school/intake/tutors", json=payload)
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        data = response.json()
        assert "detail" in data, "Should have error detail"
        assert "consent" in data["detail"].lower() or "acknowledge" in data["detail"].lower()
    
    def test_submit_missing_required_fields_returns_422(self, api_client):
        """POST /api/alt-school/intake/tutors - Missing required fields returns validation error"""
        # Missing name, email, location, subject_focus, age_grade_range, bio
        payload = {
            "consent_acknowledged": True
        }
        
        response = api_client.post(f"{BASE_URL}/api/alt-school/intake/tutors", json=payload)
        
        assert response.status_code == 422, f"Expected 422, got {response.status_code}: {response.text}"
    
    def test_submit_bio_too_short_returns_422(self, api_client):
        """POST /api/alt-school/intake/tutors - Bio under 50 chars returns validation error"""
        payload = {
            "name": "TEST_Short Bio User",
            "email": "shortbio@example.com",
            "location": "Remote",
            "subject_focus": "Math",
            "age_grade_range": "K-5",
            "bio": "Too short bio",  # Less than 50 characters
            "consent_acknowledged": True
        }
        
        response = api_client.post(f"{BASE_URL}/api/alt-school/intake/tutors", json=payload)
        
        assert response.status_code == 422, f"Expected 422, got {response.status_code}: {response.text}"
    
    def test_submit_bio_too_long_returns_422(self, api_client):
        """POST /api/alt-school/intake/tutors - Bio over 600 chars returns validation error"""
        payload = {
            "name": "TEST_Long Bio User",
            "email": "longbio@example.com",
            "location": "Remote",
            "subject_focus": "Math",
            "age_grade_range": "K-5",
            "bio": "A" * 601,  # More than 600 characters
            "consent_acknowledged": True
        }
        
        response = api_client.post(f"{BASE_URL}/api/alt-school/intake/tutors", json=payload)
        
        assert response.status_code == 422, f"Expected 422, got {response.status_code}: {response.text}"


class TestAdminIntakeEndpoints:
    """Admin endpoint tests (require super_admin role)"""
    
    def test_list_submissions_authenticated(self, authenticated_client):
        """GET /api/alt-school/admin/intake/tutors - Admin can list submissions"""
        response = authenticated_client.get(f"{BASE_URL}/api/alt-school/admin/intake/tutors")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "submissions" in data, "Response should have submissions array"
        assert "count" in data, "Response should have count"
        assert isinstance(data["submissions"], list)
    
    def test_list_submissions_filter_by_status(self, authenticated_client):
        """GET /api/alt-school/admin/intake/tutors?status=new - Filter by status works"""
        response = authenticated_client.get(f"{BASE_URL}/api/alt-school/admin/intake/tutors?status=new")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # All returned submissions should have status=new
        for sub in data["submissions"]:
            assert sub["status"] == "new", f"Expected status 'new', got '{sub['status']}'"
    
    def test_get_intake_stats(self, authenticated_client):
        """GET /api/alt-school/admin/intake/stats - Returns counts by status"""
        response = authenticated_client.get(f"{BASE_URL}/api/alt-school/admin/intake/stats")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Should have counts for each status
        assert "new" in data, "Stats should have 'new' count"
        assert "reviewed" in data, "Stats should have 'reviewed' count"
        assert "approved" in data, "Stats should have 'approved' count"
        assert "rejected" in data, "Stats should have 'rejected' count"
        assert "total" in data, "Stats should have 'total' count"
    
    def test_update_submission_status(self, authenticated_client, api_client):
        """PUT /api/alt-school/admin/intake/tutors/:id - Admin can update status and notes"""
        # First create a submission
        unique_id = str(uuid.uuid4())[:8]
        create_payload = {
            "name": f"TEST_Update Status User {unique_id}",
            "email": f"updatestatus.{unique_id}@example.com",
            "location": "Test Location",
            "subject_focus": "Test Subject",
            "age_grade_range": "K-12",
            "bio": "This is a test bio that is at least 50 characters long for validation purposes and testing.",
            "consent_acknowledged": True
        }
        
        # Create submission (public endpoint, no auth needed)
        create_response = requests.post(
            f"{BASE_URL}/api/alt-school/intake/tutors",
            json=create_payload,
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 201
        
        # Get the submission ID from the list
        list_response = authenticated_client.get(f"{BASE_URL}/api/alt-school/admin/intake/tutors")
        submissions = list_response.json()["submissions"]
        
        # Find our test submission
        test_submission = None
        for sub in submissions:
            if sub["email"] == create_payload["email"]:
                test_submission = sub
                break
        
        assert test_submission is not None, "Test submission not found"
        submission_id = test_submission["id"]
        
        # Update status to 'reviewed' with notes
        update_payload = {
            "status": "reviewed",
            "notes": "Reviewed by testing agent - looks promising"
        }
        
        update_response = authenticated_client.put(
            f"{BASE_URL}/api/alt-school/admin/intake/tutors/{submission_id}",
            json=update_payload
        )
        
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}: {update_response.text}"
        updated_data = update_response.json()
        assert updated_data["status"] == "reviewed", "Status should be updated to 'reviewed'"
        assert updated_data["notes"] == update_payload["notes"], "Notes should be updated"
    
    def test_update_submission_to_approved(self, authenticated_client):
        """PUT /api/alt-school/admin/intake/tutors/:id - Can update to approved status"""
        # Get existing submissions
        list_response = authenticated_client.get(f"{BASE_URL}/api/alt-school/admin/intake/tutors")
        submissions = list_response.json()["submissions"]
        
        if len(submissions) == 0:
            pytest.skip("No submissions to test with")
        
        # Use first submission
        submission_id = submissions[0]["id"]
        
        update_payload = {
            "status": "approved",
            "notes": "Approved for listing in Alternative School Hub"
        }
        
        response = authenticated_client.put(
            f"{BASE_URL}/api/alt-school/admin/intake/tutors/{submission_id}",
            json=update_payload
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "approved"


class TestSecurityUnauthorizedAccess:
    """Security tests - unauthenticated users cannot access admin endpoints"""
    
    def test_list_submissions_unauthenticated_returns_401(self, api_client):
        """GET /api/alt-school/admin/intake/tutors - Returns 401 without auth"""
        # Use a fresh session without auth
        response = requests.get(
            f"{BASE_URL}/api/alt-school/admin/intake/tutors",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_get_stats_unauthenticated_returns_401(self, api_client):
        """GET /api/alt-school/admin/intake/stats - Returns 401 without auth"""
        response = requests.get(
            f"{BASE_URL}/api/alt-school/admin/intake/stats",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_update_submission_unauthenticated_returns_401(self, api_client):
        """PUT /api/alt-school/admin/intake/tutors/:id - Returns 401 without auth"""
        response = requests.put(
            f"{BASE_URL}/api/alt-school/admin/intake/tutors/some-id",
            json={"status": "approved"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"


class TestDataPersistence:
    """Test that data is properly persisted in database"""
    
    def test_submission_persists_and_retrievable(self, authenticated_client, api_client):
        """Create submission and verify it appears in admin list"""
        unique_id = str(uuid.uuid4())[:8]
        payload = {
            "name": f"TEST_Persistence Check {unique_id}",
            "email": f"persistence.{unique_id}@example.com",
            "phone": "(555) 999-8888",
            "location": "Test City, TS",
            "subject_focus": "Persistence Testing",
            "age_grade_range": "All Ages",
            "bio": "This submission tests that data is properly persisted in the database and can be retrieved via admin endpoints.",
            "website": "https://persistence-test.com",
            "availability": "Always available for testing",
            "consent_acknowledged": True
        }
        
        # Create submission
        create_response = requests.post(
            f"{BASE_URL}/api/alt-school/intake/tutors",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 201
        
        # Verify it appears in admin list
        list_response = authenticated_client.get(f"{BASE_URL}/api/alt-school/admin/intake/tutors")
        assert list_response.status_code == 200
        
        submissions = list_response.json()["submissions"]
        found = False
        for sub in submissions:
            if sub["email"] == payload["email"]:
                found = True
                # Verify all fields persisted correctly
                assert sub["name"] == payload["name"]
                assert sub["phone"] == payload["phone"]
                assert sub["location"] == payload["location"]
                assert sub["subject_focus"] == payload["subject_focus"]
                assert sub["age_grade_range"] == payload["age_grade_range"]
                assert sub["bio"] == payload["bio"]
                assert sub["website"] == payload["website"]
                assert sub["availability"] == payload["availability"]
                assert sub["status"] == "new"  # Default status
                break
        
        assert found, f"Submission with email {payload['email']} not found in admin list"
