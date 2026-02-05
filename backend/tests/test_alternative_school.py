"""
Alternative School Hub - Backend API Tests
Tests public read endpoints and admin CRUD operations

Collections tested:
- alt_school_tutors
- alt_school_programs
- alt_school_resources
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials for super_admin
TEST_EMAIL = "raymondneely@banibs.com"
TEST_PASSWORD = "BanibsAdmin2026!"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def auth_token(api_client):
    """Get authentication token for super_admin"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture(scope="module")
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


class TestPublicEndpoints:
    """Test public read-only endpoints (no auth required)"""
    
    def test_get_hub_data(self, api_client):
        """GET /api/alt-school/hub - Returns combined hub data"""
        response = api_client.get(f"{BASE_URL}/api/alt-school/hub")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "tutors" in data
        assert "programs" in data
        assert "resources" in data
        assert "tutor_count" in data
        assert "program_count" in data
        assert "resource_count" in data
        
        # Verify counts match array lengths
        assert data["tutor_count"] == len(data["tutors"])
        assert data["program_count"] == len(data["programs"])
        assert data["resource_count"] == len(data["resources"])
        
        # Verify data was seeded (should have 3 of each)
        assert data["tutor_count"] >= 2, "Expected at least 2 tutors (founding + developing)"
        assert data["program_count"] >= 2, "Expected at least 2 programs"
        assert data["resource_count"] >= 2, "Expected at least 2 resources"
        
        print(f"Hub data: {data['tutor_count']} tutors, {data['program_count']} programs, {data['resource_count']} resources")
    
    def test_get_tutors(self, api_client):
        """GET /api/alt-school/tutors - Returns tutor listings"""
        response = api_client.get(f"{BASE_URL}/api/alt-school/tutors")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "tutors" in data
        assert "count" in data
        assert data["count"] == len(data["tutors"])
        
        # Verify tutor structure
        if data["tutors"]:
            tutor = data["tutors"][0]
            assert "id" in tutor
            assert "name" in tutor
            assert "focus_subject" in tutor
            assert "age_or_grade_range" in tutor
            assert "location" in tutor
            assert "description" in tutor
            assert "contact_info" in tutor
            assert "status" in tutor
            assert "created_at" in tutor
            
            print(f"First tutor: {tutor['name']} - {tutor['focus_subject']}")
    
    def test_get_tutors_with_status_filter(self, api_client):
        """GET /api/alt-school/tutors?status=founding - Filter by status"""
        response = api_client.get(f"{BASE_URL}/api/alt-school/tutors?status=founding")
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned tutors should have founding status
        for tutor in data["tutors"]:
            assert tutor["status"] == "founding", f"Expected founding status, got {tutor['status']}"
        
        print(f"Found {data['count']} founding tutors")
    
    def test_get_programs(self, api_client):
        """GET /api/alt-school/programs - Returns program categories"""
        response = api_client.get(f"{BASE_URL}/api/alt-school/programs")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "programs" in data
        assert "count" in data
        
        # Verify program structure
        if data["programs"]:
            program = data["programs"][0]
            assert "id" in program
            assert "title" in program
            assert "description" in program
            assert "status" in program
            assert "created_at" in program
            
            print(f"First program: {program['title']}")
    
    def test_get_programs_with_status_filter(self, api_client):
        """GET /api/alt-school/programs?status=developing - Filter by status"""
        response = api_client.get(f"{BASE_URL}/api/alt-school/programs?status=developing")
        
        assert response.status_code == 200
        data = response.json()
        
        for program in data["programs"]:
            assert program["status"] == "developing"
        
        print(f"Found {data['count']} developing programs")
    
    def test_get_resources(self, api_client):
        """GET /api/alt-school/resources - Returns learning resources"""
        response = api_client.get(f"{BASE_URL}/api/alt-school/resources")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "resources" in data
        assert "count" in data
        
        # Verify resource structure
        if data["resources"]:
            resource = data["resources"][0]
            assert "id" in resource
            assert "title" in resource
            assert "description" in resource
            assert "category" in resource
            assert "status" in resource
            assert "created_at" in resource
            
            print(f"First resource: {resource['title']} ({resource['category']})")
    
    def test_get_resources_with_category_filter(self, api_client):
        """GET /api/alt-school/resources?category=Getting Started - Filter by category"""
        response = api_client.get(f"{BASE_URL}/api/alt-school/resources?category=Getting%20Started")
        
        assert response.status_code == 200
        data = response.json()
        
        for resource in data["resources"]:
            assert resource["category"] == "Getting Started"
        
        print(f"Found {data['count']} resources in 'Getting Started' category")


class TestAdminTutorCRUD:
    """Test admin CRUD operations for tutors (requires super_admin)"""
    
    def test_create_tutor(self, authenticated_client):
        """POST /api/alt-school/admin/tutors - Create new tutor"""
        tutor_data = {
            "name": "TEST_Dr. Test Tutor",
            "focus_subject": "Test Subject",
            "age_or_grade_range": "Grades 1-5",
            "location": "Test City / Remote",
            "description": "Test tutor description for automated testing.",
            "contact_info": "test@example.com",
            "status": "developing"
        }
        
        response = authenticated_client.post(
            f"{BASE_URL}/api/alt-school/admin/tutors",
            json=tutor_data
        )
        
        assert response.status_code == 201
        created = response.json()
        
        # Verify all fields
        assert created["name"] == tutor_data["name"]
        assert created["focus_subject"] == tutor_data["focus_subject"]
        assert created["age_or_grade_range"] == tutor_data["age_or_grade_range"]
        assert created["location"] == tutor_data["location"]
        assert created["description"] == tutor_data["description"]
        assert created["contact_info"] == tutor_data["contact_info"]
        assert created["status"] == tutor_data["status"]
        assert "id" in created
        assert "created_at" in created
        
        # Store ID for cleanup
        TestAdminTutorCRUD.created_tutor_id = created["id"]
        print(f"Created tutor: {created['id']}")
    
    def test_update_tutor(self, authenticated_client):
        """PUT /api/alt-school/admin/tutors/{id} - Update tutor"""
        tutor_id = getattr(TestAdminTutorCRUD, 'created_tutor_id', None)
        if not tutor_id:
            pytest.skip("No tutor created to update")
        
        update_data = {
            "name": "TEST_Dr. Updated Tutor",
            "status": "founding"
        }
        
        response = authenticated_client.put(
            f"{BASE_URL}/api/alt-school/admin/tutors/{tutor_id}",
            json=update_data
        )
        
        assert response.status_code == 200
        updated = response.json()
        
        assert updated["name"] == update_data["name"]
        assert updated["status"] == update_data["status"]
        assert updated["updated_at"] is not None
        
        print(f"Updated tutor: {updated['name']}")
    
    def test_update_nonexistent_tutor(self, authenticated_client):
        """PUT /api/alt-school/admin/tutors/{id} - 404 for nonexistent"""
        fake_id = str(uuid.uuid4())
        
        response = authenticated_client.put(
            f"{BASE_URL}/api/alt-school/admin/tutors/{fake_id}",
            json={"name": "Test"}
        )
        
        assert response.status_code == 404
    
    def test_delete_tutor(self, authenticated_client):
        """DELETE /api/alt-school/admin/tutors/{id} - Delete tutor"""
        tutor_id = getattr(TestAdminTutorCRUD, 'created_tutor_id', None)
        if not tutor_id:
            pytest.skip("No tutor created to delete")
        
        response = authenticated_client.delete(
            f"{BASE_URL}/api/alt-school/admin/tutors/{tutor_id}"
        )
        
        assert response.status_code == 204
        
        # Verify deletion - GET should not find it in list
        get_response = authenticated_client.get(f"{BASE_URL}/api/alt-school/tutors")
        tutors = get_response.json()["tutors"]
        tutor_ids = [t["id"] for t in tutors]
        assert tutor_id not in tutor_ids, "Deleted tutor should not appear in list"
        
        print(f"Deleted tutor: {tutor_id}")
    
    def test_delete_nonexistent_tutor(self, authenticated_client):
        """DELETE /api/alt-school/admin/tutors/{id} - 404 for nonexistent"""
        fake_id = str(uuid.uuid4())
        
        response = authenticated_client.delete(
            f"{BASE_URL}/api/alt-school/admin/tutors/{fake_id}"
        )
        
        assert response.status_code == 404


class TestAdminProgramCRUD:
    """Test admin CRUD operations for programs (requires super_admin)"""
    
    def test_create_program(self, authenticated_client):
        """POST /api/alt-school/admin/programs - Create new program"""
        program_data = {
            "title": "TEST_Test Program",
            "description": "Test program description for automated testing.",
            "status": "developing"
        }
        
        response = authenticated_client.post(
            f"{BASE_URL}/api/alt-school/admin/programs",
            json=program_data
        )
        
        assert response.status_code == 201
        created = response.json()
        
        assert created["title"] == program_data["title"]
        assert created["description"] == program_data["description"]
        assert created["status"] == program_data["status"]
        assert "id" in created
        
        TestAdminProgramCRUD.created_program_id = created["id"]
        print(f"Created program: {created['id']}")
    
    def test_update_program(self, authenticated_client):
        """PUT /api/alt-school/admin/programs/{id} - Update program"""
        program_id = getattr(TestAdminProgramCRUD, 'created_program_id', None)
        if not program_id:
            pytest.skip("No program created to update")
        
        update_data = {
            "title": "TEST_Updated Program",
            "status": "founding"
        }
        
        response = authenticated_client.put(
            f"{BASE_URL}/api/alt-school/admin/programs/{program_id}",
            json=update_data
        )
        
        assert response.status_code == 200
        updated = response.json()
        
        assert updated["title"] == update_data["title"]
        assert updated["status"] == update_data["status"]
        
        print(f"Updated program: {updated['title']}")
    
    def test_delete_program(self, authenticated_client):
        """DELETE /api/alt-school/admin/programs/{id} - Delete program"""
        program_id = getattr(TestAdminProgramCRUD, 'created_program_id', None)
        if not program_id:
            pytest.skip("No program created to delete")
        
        response = authenticated_client.delete(
            f"{BASE_URL}/api/alt-school/admin/programs/{program_id}"
        )
        
        assert response.status_code == 204
        print(f"Deleted program: {program_id}")


class TestAdminResourceCRUD:
    """Test admin CRUD operations for resources (requires super_admin)"""
    
    def test_create_resource(self, authenticated_client):
        """POST /api/alt-school/admin/resources - Create new resource"""
        resource_data = {
            "title": "TEST_Test Resource",
            "description": "Test resource description for automated testing.",
            "category": "Testing",
            "link_url": "https://example.com/test",
            "status": "developing"
        }
        
        response = authenticated_client.post(
            f"{BASE_URL}/api/alt-school/admin/resources",
            json=resource_data
        )
        
        assert response.status_code == 201
        created = response.json()
        
        assert created["title"] == resource_data["title"]
        assert created["description"] == resource_data["description"]
        assert created["category"] == resource_data["category"]
        assert created["link_url"] == resource_data["link_url"]
        assert created["status"] == resource_data["status"]
        assert "id" in created
        
        TestAdminResourceCRUD.created_resource_id = created["id"]
        print(f"Created resource: {created['id']}")
    
    def test_update_resource(self, authenticated_client):
        """PUT /api/alt-school/admin/resources/{id} - Update resource"""
        resource_id = getattr(TestAdminResourceCRUD, 'created_resource_id', None)
        if not resource_id:
            pytest.skip("No resource created to update")
        
        update_data = {
            "title": "TEST_Updated Resource",
            "category": "Updated Category",
            "status": "founding"
        }
        
        response = authenticated_client.put(
            f"{BASE_URL}/api/alt-school/admin/resources/{resource_id}",
            json=update_data
        )
        
        assert response.status_code == 200
        updated = response.json()
        
        assert updated["title"] == update_data["title"]
        assert updated["category"] == update_data["category"]
        assert updated["status"] == update_data["status"]
        
        print(f"Updated resource: {updated['title']}")
    
    def test_delete_resource(self, authenticated_client):
        """DELETE /api/alt-school/admin/resources/{id} - Delete resource"""
        resource_id = getattr(TestAdminResourceCRUD, 'created_resource_id', None)
        if not resource_id:
            pytest.skip("No resource created to delete")
        
        response = authenticated_client.delete(
            f"{BASE_URL}/api/alt-school/admin/resources/{resource_id}"
        )
        
        assert response.status_code == 204
        print(f"Deleted resource: {resource_id}")


class TestAdminSeedEndpoint:
    """Test admin seed endpoint"""
    
    def test_seed_is_idempotent(self, authenticated_client):
        """POST /api/alt-school/admin/seed - Should be idempotent"""
        response = authenticated_client.post(f"{BASE_URL}/api/alt-school/admin/seed")
        
        assert response.status_code == 200
        data = response.json()
        
        # Since data is already seeded, should return seeded=False
        assert "message" in data
        assert data.get("seeded") == False, "Data already seeded, should return seeded=False"
        
        print(f"Seed response: {data['message']}")


class TestUnauthorizedAccess:
    """Test that admin endpoints require authentication"""
    
    def test_create_tutor_unauthorized(self, api_client):
        """POST /api/alt-school/admin/tutors - Should require auth"""
        # Remove auth header if present
        api_client.headers.pop("Authorization", None)
        
        response = api_client.post(
            f"{BASE_URL}/api/alt-school/admin/tutors",
            json={"name": "Test", "focus_subject": "Test", "age_or_grade_range": "Test", 
                  "location": "Test", "description": "Test", "contact_info": "Test"}
        )
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_seed_unauthorized(self, api_client):
        """POST /api/alt-school/admin/seed - Should require auth"""
        api_client.headers.pop("Authorization", None)
        
        response = api_client.post(f"{BASE_URL}/api/alt-school/admin/seed")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"


class TestHubDataFiltering:
    """Test that hub data correctly filters by status"""
    
    def test_hub_excludes_future_status(self, api_client):
        """GET /api/alt-school/hub - Should exclude 'future' status items"""
        response = api_client.get(f"{BASE_URL}/api/alt-school/hub")
        
        assert response.status_code == 200
        data = response.json()
        
        # Check all items have founding or developing status (not future)
        for tutor in data["tutors"]:
            assert tutor["status"] in ["founding", "developing"], f"Unexpected status: {tutor['status']}"
        
        for program in data["programs"]:
            assert program["status"] in ["founding", "developing"], f"Unexpected status: {program['status']}"
        
        for resource in data["resources"]:
            assert resource["status"] in ["founding", "developing"], f"Unexpected status: {resource['status']}"
        
        print("Hub data correctly filters to founding/developing only")


class TestStatusBadgeMapping:
    """Test that status values map correctly to display labels"""
    
    def test_founding_status_exists(self, api_client):
        """Verify founding status tutors exist"""
        response = api_client.get(f"{BASE_URL}/api/alt-school/tutors?status=founding")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["count"] >= 1, "Expected at least 1 founding tutor"
        print(f"Found {data['count']} founding tutors (should show 'Active' badge)")
    
    def test_developing_status_exists(self, api_client):
        """Verify developing status tutors exist"""
        response = api_client.get(f"{BASE_URL}/api/alt-school/tutors?status=developing")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["count"] >= 1, "Expected at least 1 developing tutor"
        print(f"Found {data['count']} developing tutors (should show 'Coming Soon' badge)")
