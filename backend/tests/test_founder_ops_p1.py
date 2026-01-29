"""
Founder Ops Hub - Tasks & Detectors API Tests (P1)
Tests for:
- Tasks CRUD API (POST, GET, PATCH, DELETE, MOVE)
- Detectors CRUD API (POST, GET, PATCH, DELETE)

Access: super_admin only
Response envelope: {success: bool, data: object|list, error: {code, message, details}|null}
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test_admin@banibs.com"
TEST_PASSWORD = "Admin123!"


class TestFounderOpsAuth:
    """Authentication tests for Founder Ops endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for super_admin user"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        return data["access_token"]
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        # Verify super_admin role
        assert "super_admin" in data["user"]["roles"], "User should have super_admin role"


class TestTasksCRUD:
    """Tasks CRUD API tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {auth_token}"
        }
    
    def test_get_tasks_empty_or_list(self, auth_headers):
        """GET /api/founder-ops/tasks - should return list (possibly empty)"""
        response = requests.get(
            f"{BASE_URL}/api/founder-ops/tasks",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        # Response envelope check
        assert data["success"] is True
        assert "data" in data
        assert isinstance(data["data"], list)
        print(f"Found {len(data['data'])} existing tasks")
    
    def test_create_task_minimal(self, auth_headers):
        """POST /api/founder-ops/tasks - create task with minimal fields"""
        task_data = {
            "title": f"TEST_Task_Minimal_{uuid.uuid4().hex[:8]}"
        }
        response = requests.post(
            f"{BASE_URL}/api/founder-ops/tasks",
            json=task_data,
            headers=auth_headers
        )
        assert response.status_code == 201, f"Create failed: {response.text}"
        data = response.json()
        
        # Response envelope check
        assert data["success"] is True
        assert data["error"] is None
        
        # Data assertions
        task = data["data"]
        assert "id" in task
        assert task["title"] == task_data["title"]
        assert task["column"] == "P0"  # Default column
        assert task["status"] == "OPEN"  # Default status
        assert task["priority"] == "MEDIUM"  # Default priority
        assert task["owner"] == "Founder"  # Default owner
        assert "audit" in task
        assert "created_at" in task["audit"]
        assert "updated_at" in task["audit"]
        
        # Cleanup
        task_id = task["id"]
        requests.delete(f"{BASE_URL}/api/founder-ops/tasks/{task_id}", headers=auth_headers)
        print(f"Created and cleaned up task: {task_id}")
    
    def test_create_task_full_fields(self, auth_headers):
        """POST /api/founder-ops/tasks - create task with all fields"""
        task_data = {
            "title": f"TEST_Task_Full_{uuid.uuid4().hex[:8]}",
            "description": "This is a test task with full fields",
            "column": "P1",
            "status": "IN_PROGRESS",
            "priority": "HIGH",
            "tags": ["test", "automation"],
            "order": 1.5,
            "owner": "TestOwner",
            "linked": {
                "module_key": "test_module",
                "discovery_id": None,
                "detector_id": None,
                "ops_log_id": None
            }
        }
        response = requests.post(
            f"{BASE_URL}/api/founder-ops/tasks",
            json=task_data,
            headers=auth_headers
        )
        assert response.status_code == 201, f"Create failed: {response.text}"
        data = response.json()
        
        assert data["success"] is True
        task = data["data"]
        
        # Verify all fields
        assert task["title"] == task_data["title"]
        assert task["description"] == task_data["description"]
        assert task["column"] == "P1"
        assert task["status"] == "IN_PROGRESS"
        assert task["priority"] == "HIGH"
        assert task["tags"] == ["test", "automation"]
        assert task["order"] == 1.5
        assert task["owner"] == "TestOwner"
        assert task["linked"]["module_key"] == "test_module"
        
        # Cleanup
        task_id = task["id"]
        requests.delete(f"{BASE_URL}/api/founder-ops/tasks/{task_id}", headers=auth_headers)
        print(f"Created full task and cleaned up: {task_id}")
    
    def test_get_task_by_id(self, auth_headers):
        """GET /api/founder-ops/tasks/:id - get single task"""
        # First create a task
        task_data = {"title": f"TEST_GetById_{uuid.uuid4().hex[:8]}"}
        create_resp = requests.post(
            f"{BASE_URL}/api/founder-ops/tasks",
            json=task_data,
            headers=auth_headers
        )
        assert create_resp.status_code == 201
        task_id = create_resp.json()["data"]["id"]
        
        # Get by ID
        response = requests.get(
            f"{BASE_URL}/api/founder-ops/tasks/{task_id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["id"] == task_id
        assert data["data"]["title"] == task_data["title"]
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/founder-ops/tasks/{task_id}", headers=auth_headers)
        print(f"Get by ID test passed for task: {task_id}")
    
    def test_update_task_patch(self, auth_headers):
        """PATCH /api/founder-ops/tasks/:id - update task fields"""
        # Create task
        task_data = {"title": f"TEST_Update_{uuid.uuid4().hex[:8]}", "priority": "LOW"}
        create_resp = requests.post(
            f"{BASE_URL}/api/founder-ops/tasks",
            json=task_data,
            headers=auth_headers
        )
        assert create_resp.status_code == 201
        task_id = create_resp.json()["data"]["id"]
        
        # Update task
        update_data = {
            "title": "TEST_Updated_Title",
            "priority": "CRITICAL",
            "status": "BLOCKED",
            "description": "Updated description"
        }
        response = requests.patch(
            f"{BASE_URL}/api/founder-ops/tasks/{task_id}",
            json=update_data,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        data = response.json()
        
        assert data["success"] is True
        task = data["data"]
        assert task["title"] == "TEST_Updated_Title"
        assert task["priority"] == "CRITICAL"
        assert task["status"] == "BLOCKED"
        assert task["description"] == "Updated description"
        
        # Verify persistence with GET
        get_resp = requests.get(f"{BASE_URL}/api/founder-ops/tasks/{task_id}", headers=auth_headers)
        assert get_resp.status_code == 200
        assert get_resp.json()["data"]["title"] == "TEST_Updated_Title"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/founder-ops/tasks/{task_id}", headers=auth_headers)
        print(f"Update test passed for task: {task_id}")
    
    def test_move_task(self, auth_headers):
        """POST /api/founder-ops/tasks/:id/move - move task to different column"""
        # Create task in P0
        task_data = {"title": f"TEST_Move_{uuid.uuid4().hex[:8]}", "column": "P0", "order": 0}
        create_resp = requests.post(
            f"{BASE_URL}/api/founder-ops/tasks",
            json=task_data,
            headers=auth_headers
        )
        assert create_resp.status_code == 201
        task_id = create_resp.json()["data"]["id"]
        assert create_resp.json()["data"]["column"] == "P0"
        
        # Move to P1
        move_data = {"to_column": "P1", "to_order": 2.5}
        response = requests.post(
            f"{BASE_URL}/api/founder-ops/tasks/{task_id}/move",
            json=move_data,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Move failed: {response.text}"
        data = response.json()
        
        assert data["success"] is True
        assert data["data"]["column"] == "P1"
        assert data["data"]["order"] == 2.5
        
        # Move to LATER
        move_data2 = {"to_column": "LATER", "to_order": 5.0}
        response2 = requests.post(
            f"{BASE_URL}/api/founder-ops/tasks/{task_id}/move",
            json=move_data2,
            headers=auth_headers
        )
        assert response2.status_code == 200
        assert response2.json()["data"]["column"] == "LATER"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/founder-ops/tasks/{task_id}", headers=auth_headers)
        print(f"Move test passed for task: {task_id}")
    
    def test_delete_task(self, auth_headers):
        """DELETE /api/founder-ops/tasks/:id - delete task"""
        # Create task
        task_data = {"title": f"TEST_Delete_{uuid.uuid4().hex[:8]}"}
        create_resp = requests.post(
            f"{BASE_URL}/api/founder-ops/tasks",
            json=task_data,
            headers=auth_headers
        )
        assert create_resp.status_code == 201
        task_id = create_resp.json()["data"]["id"]
        
        # Delete task
        response = requests.delete(
            f"{BASE_URL}/api/founder-ops/tasks/{task_id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["deleted"] is True
        assert data["data"]["id"] == task_id
        
        # Verify deletion - should return 404
        get_resp = requests.get(f"{BASE_URL}/api/founder-ops/tasks/{task_id}", headers=auth_headers)
        assert get_resp.status_code == 404
        print(f"Delete test passed for task: {task_id}")
    
    def test_get_tasks_sorted_by_order(self, auth_headers):
        """GET /api/founder-ops/tasks?sort=order - verify sorting"""
        # Create multiple tasks with different orders
        task_ids = []
        for i, order in enumerate([3.0, 1.0, 2.0]):
            task_data = {
                "title": f"TEST_Sort_{i}_{uuid.uuid4().hex[:8]}",
                "column": "P0",
                "order": order
            }
            resp = requests.post(f"{BASE_URL}/api/founder-ops/tasks", json=task_data, headers=auth_headers)
            assert resp.status_code == 201
            task_ids.append(resp.json()["data"]["id"])
        
        # Get tasks sorted by order
        response = requests.get(
            f"{BASE_URL}/api/founder-ops/tasks?column=P0&sort=order",
            headers=auth_headers
        )
        assert response.status_code == 200
        tasks = response.json()["data"]
        
        # Verify order (ascending)
        test_tasks = [t for t in tasks if t["id"] in task_ids]
        orders = [t["order"] for t in test_tasks]
        assert orders == sorted(orders), f"Tasks not sorted by order: {orders}"
        
        # Cleanup
        for task_id in task_ids:
            requests.delete(f"{BASE_URL}/api/founder-ops/tasks/{task_id}", headers=auth_headers)
        print("Sort test passed")
    
    def test_task_not_found(self, auth_headers):
        """GET/PATCH/DELETE non-existent task returns 404"""
        fake_id = str(uuid.uuid4())
        
        # GET
        resp = requests.get(f"{BASE_URL}/api/founder-ops/tasks/{fake_id}", headers=auth_headers)
        assert resp.status_code == 404
        
        # PATCH
        resp = requests.patch(
            f"{BASE_URL}/api/founder-ops/tasks/{fake_id}",
            json={"title": "test"},
            headers=auth_headers
        )
        assert resp.status_code == 404
        
        # DELETE
        resp = requests.delete(f"{BASE_URL}/api/founder-ops/tasks/{fake_id}", headers=auth_headers)
        assert resp.status_code == 404
        
        # MOVE
        resp = requests.post(
            f"{BASE_URL}/api/founder-ops/tasks/{fake_id}/move",
            json={"to_column": "P1", "to_order": 1.0},
            headers=auth_headers
        )
        assert resp.status_code == 404
        print("Not found tests passed")


class TestDetectorsCRUD:
    """Detectors CRUD API tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {auth_token}"
        }
    
    def test_get_detectors_empty_or_list(self, auth_headers):
        """GET /api/founder-ops/detectors - should return list"""
        response = requests.get(
            f"{BASE_URL}/api/founder-ops/detectors",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        print(f"Found {len(data['data'])} existing detectors")
    
    def test_create_detector_minimal(self, auth_headers):
        """POST /api/founder-ops/detectors - create with minimal fields"""
        detector_data = {
            "name": f"TEST_Detector_Min_{uuid.uuid4().hex[:8]}",
            "type": "CUSTOM"
        }
        response = requests.post(
            f"{BASE_URL}/api/founder-ops/detectors",
            json=detector_data,
            headers=auth_headers
        )
        assert response.status_code == 201, f"Create failed: {response.text}"
        data = response.json()
        
        assert data["success"] is True
        detector = data["data"]
        assert "id" in detector
        assert detector["name"] == detector_data["name"]
        assert detector["type"] == "CUSTOM"
        assert detector["domain"] == "HDOS"  # Default
        assert detector["status"] == "DRAFT"  # Default
        assert detector["severity_default"] == "MEDIUM"  # Default
        assert "audit" in detector
        
        # Cleanup
        detector_id = detector["id"]
        requests.delete(f"{BASE_URL}/api/founder-ops/detectors/{detector_id}", headers=auth_headers)
        print(f"Created and cleaned up detector: {detector_id}")
    
    def test_create_detector_full_fields(self, auth_headers):
        """POST /api/founder-ops/detectors - create with all fields"""
        detector_data = {
            "name": f"TEST_Detector_Full_{uuid.uuid4().hex[:8]}",
            "domain": "BANIBS",
            "type": "DOG",
            "status": "ACTIVE",
            "severity_default": "HIGH",
            "description": "Test detector with full fields",
            "canonical_rules": [
                "Rule 1: Check for suspicious patterns",
                "Rule 2: Verify identity claims"
            ],
            "signals": [
                {"key": "sig1", "label": "Signal 1", "description": "First signal", "weight": 1.5},
                {"key": "sig2", "label": "Signal 2", "description": "Second signal", "weight": 2.0}
            ],
            "actions": [
                {"key": "act1", "label": "Action 1", "description": "First action"},
                {"key": "act2", "label": "Action 2", "description": "Second action"}
            ],
            "ui": {
                "visible": True,
                "color_hint": "#FF5733",
                "icon": "shield"
            },
            "linked": {
                "module_key": "test_module",
                "discovery_ids": ["disc1", "disc2"],
                "related_detector_ids": []
            }
        }
        response = requests.post(
            f"{BASE_URL}/api/founder-ops/detectors",
            json=detector_data,
            headers=auth_headers
        )
        assert response.status_code == 201, f"Create failed: {response.text}"
        data = response.json()
        
        assert data["success"] is True
        detector = data["data"]
        
        # Verify all fields
        assert detector["name"] == detector_data["name"]
        assert detector["domain"] == "BANIBS"
        assert detector["type"] == "DOG"
        assert detector["status"] == "ACTIVE"
        assert detector["severity_default"] == "HIGH"
        assert detector["description"] == detector_data["description"]
        assert len(detector["canonical_rules"]) == 2
        assert detector["canonical_rules"][0] == "Rule 1: Check for suspicious patterns"
        assert len(detector["signals"]) == 2
        assert detector["signals"][0]["key"] == "sig1"
        assert len(detector["actions"]) == 2
        assert detector["ui"]["color_hint"] == "#FF5733"
        assert detector["linked"]["module_key"] == "test_module"
        
        # Cleanup
        detector_id = detector["id"]
        requests.delete(f"{BASE_URL}/api/founder-ops/detectors/{detector_id}", headers=auth_headers)
        print(f"Created full detector and cleaned up: {detector_id}")
    
    def test_get_detector_by_id(self, auth_headers):
        """GET /api/founder-ops/detectors/:id - get single detector"""
        # Create detector
        detector_data = {"name": f"TEST_GetById_{uuid.uuid4().hex[:8]}", "type": "CUSTOM"}
        create_resp = requests.post(
            f"{BASE_URL}/api/founder-ops/detectors",
            json=detector_data,
            headers=auth_headers
        )
        assert create_resp.status_code == 201
        detector_id = create_resp.json()["data"]["id"]
        
        # Get by ID
        response = requests.get(
            f"{BASE_URL}/api/founder-ops/detectors/{detector_id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["id"] == detector_id
        assert data["data"]["name"] == detector_data["name"]
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/founder-ops/detectors/{detector_id}", headers=auth_headers)
        print(f"Get by ID test passed for detector: {detector_id}")
    
    def test_update_detector_patch(self, auth_headers):
        """PATCH /api/founder-ops/detectors/:id - update detector fields"""
        # Create detector
        detector_data = {"name": f"TEST_Update_{uuid.uuid4().hex[:8]}", "type": "CUSTOM", "status": "DRAFT"}
        create_resp = requests.post(
            f"{BASE_URL}/api/founder-ops/detectors",
            json=detector_data,
            headers=auth_headers
        )
        assert create_resp.status_code == 201
        detector_id = create_resp.json()["data"]["id"]
        
        # Update detector
        update_data = {
            "name": "TEST_Updated_Detector",
            "status": "ACTIVE",
            "severity_default": "CRITICAL",
            "description": "Updated description",
            "canonical_rules": ["New Rule 1", "New Rule 2", "New Rule 3"]
        }
        response = requests.patch(
            f"{BASE_URL}/api/founder-ops/detectors/{detector_id}",
            json=update_data,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        data = response.json()
        
        assert data["success"] is True
        detector = data["data"]
        assert detector["name"] == "TEST_Updated_Detector"
        assert detector["status"] == "ACTIVE"
        assert detector["severity_default"] == "CRITICAL"
        assert detector["description"] == "Updated description"
        assert len(detector["canonical_rules"]) == 3
        
        # Verify persistence with GET
        get_resp = requests.get(f"{BASE_URL}/api/founder-ops/detectors/{detector_id}", headers=auth_headers)
        assert get_resp.status_code == 200
        assert get_resp.json()["data"]["name"] == "TEST_Updated_Detector"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/founder-ops/detectors/{detector_id}", headers=auth_headers)
        print(f"Update test passed for detector: {detector_id}")
    
    def test_delete_detector(self, auth_headers):
        """DELETE /api/founder-ops/detectors/:id - delete detector"""
        # Create detector
        detector_data = {"name": f"TEST_Delete_{uuid.uuid4().hex[:8]}", "type": "CUSTOM"}
        create_resp = requests.post(
            f"{BASE_URL}/api/founder-ops/detectors",
            json=detector_data,
            headers=auth_headers
        )
        assert create_resp.status_code == 201
        detector_id = create_resp.json()["data"]["id"]
        
        # Delete detector
        response = requests.delete(
            f"{BASE_URL}/api/founder-ops/detectors/{detector_id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["deleted"] is True
        assert data["data"]["id"] == detector_id
        
        # Verify deletion - should return 404
        get_resp = requests.get(f"{BASE_URL}/api/founder-ops/detectors/{detector_id}", headers=auth_headers)
        assert get_resp.status_code == 404
        print(f"Delete test passed for detector: {detector_id}")
    
    def test_detector_not_found(self, auth_headers):
        """GET/PATCH/DELETE non-existent detector returns 404"""
        fake_id = str(uuid.uuid4())
        
        # GET
        resp = requests.get(f"{BASE_URL}/api/founder-ops/detectors/{fake_id}", headers=auth_headers)
        assert resp.status_code == 404
        
        # PATCH
        resp = requests.patch(
            f"{BASE_URL}/api/founder-ops/detectors/{fake_id}",
            json={"name": "test"},
            headers=auth_headers
        )
        assert resp.status_code == 404
        
        # DELETE
        resp = requests.delete(f"{BASE_URL}/api/founder-ops/detectors/{fake_id}", headers=auth_headers)
        assert resp.status_code == 404
        print("Detector not found tests passed")
    
    def test_detector_domain_filter(self, auth_headers):
        """GET /api/founder-ops/detectors?domain=X - filter by domain"""
        # Create detectors with different domains
        detector_ids = []
        for domain in ["HDOS", "BANIBS", "TRUST"]:
            detector_data = {
                "name": f"TEST_Domain_{domain}_{uuid.uuid4().hex[:8]}",
                "type": "CUSTOM",
                "domain": domain
            }
            resp = requests.post(f"{BASE_URL}/api/founder-ops/detectors", json=detector_data, headers=auth_headers)
            assert resp.status_code == 201
            detector_ids.append(resp.json()["data"]["id"])
        
        # Filter by HDOS domain
        response = requests.get(
            f"{BASE_URL}/api/founder-ops/detectors?domain=HDOS",
            headers=auth_headers
        )
        assert response.status_code == 200
        detectors = response.json()["data"]
        
        # All returned should be HDOS domain
        for d in detectors:
            assert d["domain"] == "HDOS"
        
        # Cleanup
        for detector_id in detector_ids:
            requests.delete(f"{BASE_URL}/api/founder-ops/detectors/{detector_id}", headers=auth_headers)
        print("Domain filter test passed")
    
    def test_detector_types(self, auth_headers):
        """Test creating detectors with different types"""
        detector_types = ["DOG", "BDL_BIS", "LPL", "SPOOFING_FRIEND", "CUSTOM"]
        detector_ids = []
        
        for dtype in detector_types:
            detector_data = {
                "name": f"TEST_Type_{dtype}_{uuid.uuid4().hex[:8]}",
                "type": dtype
            }
            resp = requests.post(f"{BASE_URL}/api/founder-ops/detectors", json=detector_data, headers=auth_headers)
            assert resp.status_code == 201, f"Failed to create detector with type {dtype}: {resp.text}"
            assert resp.json()["data"]["type"] == dtype
            detector_ids.append(resp.json()["data"]["id"])
        
        # Cleanup
        for detector_id in detector_ids:
            requests.delete(f"{BASE_URL}/api/founder-ops/detectors/{detector_id}", headers=auth_headers)
        print(f"Tested {len(detector_types)} detector types successfully")


class TestUnauthorizedAccess:
    """Test that endpoints require authentication"""
    
    def test_tasks_requires_auth(self):
        """Tasks endpoints should require authentication"""
        # No auth header
        resp = requests.get(f"{BASE_URL}/api/founder-ops/tasks")
        assert resp.status_code in [401, 403], f"Expected 401/403, got {resp.status_code}"
        
        resp = requests.post(f"{BASE_URL}/api/founder-ops/tasks", json={"title": "test"})
        assert resp.status_code in [401, 403]
    
    def test_detectors_requires_auth(self):
        """Detectors endpoints should require authentication"""
        resp = requests.get(f"{BASE_URL}/api/founder-ops/detectors")
        assert resp.status_code in [401, 403]
        
        resp = requests.post(f"{BASE_URL}/api/founder-ops/detectors", json={"name": "test", "type": "CUSTOM"})
        assert resp.status_code in [401, 403]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
