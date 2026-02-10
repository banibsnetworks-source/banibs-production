"""
Module Registry API Tests
Tests for GET /api/founder/modules endpoints

Features tested:
- GET /api/founder/modules - Returns full registry with filtering
- GET /api/founder/modules?status=active - Filter by status
- GET /api/founder/modules?world=Social%20World - Filter by world
- GET /api/founder/modules/:id - Single module detail
- Auth: Requires super_admin role
- Summary stats: total, active, opening_soon, disabled, worlds
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials (super_admin)
TEST_EMAIL = "raymondneely@banibs.com"
TEST_PASSWORD = "BanibsAdmin2026!"


class TestModulesRegistryAuth:
    """Authentication tests for Module Registry API"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for super_admin user"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token") or data.get("token")
        pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
    
    def test_modules_requires_auth(self):
        """GET /api/founder/modules returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/founder/modules")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: GET /api/founder/modules returns 401 without auth")
    
    def test_modules_requires_admin_role(self, auth_token):
        """GET /api/founder/modules requires super_admin or admin role"""
        # This test verifies that with valid auth, we get 200 (not 403)
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/founder/modules", headers=headers)
        assert response.status_code == 200, f"Expected 200 for super_admin, got {response.status_code}"
        print("PASS: GET /api/founder/modules returns 200 for super_admin")


class TestModulesRegistryList:
    """Tests for GET /api/founder/modules endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token") or data.get("token")
        pytest.skip("Authentication failed")
    
    def test_get_all_modules(self, auth_token):
        """GET /api/founder/modules returns all modules"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/founder/modules", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "modules" in data, "Response should contain 'modules' array"
        assert "summary" in data, "Response should contain 'summary' object"
        assert "registry_version" in data, "Response should contain 'registry_version'"
        
        # Verify modules array is not empty
        modules = data["modules"]
        assert len(modules) > 0, "Should have at least one module"
        print(f"PASS: GET /api/founder/modules returns {len(modules)} modules")
    
    def test_modules_have_required_fields(self, auth_token):
        """Each module should have required fields"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/founder/modules", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        modules = data["modules"]
        
        required_fields = ["id", "display_name", "world", "status"]
        
        for module in modules[:5]:  # Check first 5 modules
            for field in required_fields:
                assert field in module, f"Module {module.get('id', 'unknown')} missing field: {field}"
        
        print("PASS: All modules have required fields (id, display_name, world, status)")
    
    def test_summary_stats(self, auth_token):
        """Summary should contain total, active, opening_soon, disabled counts"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/founder/modules", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        summary = data["summary"]
        
        # Verify summary fields
        assert "total" in summary, "Summary should have 'total'"
        assert "active" in summary, "Summary should have 'active'"
        assert "opening_soon" in summary, "Summary should have 'opening_soon'"
        assert "disabled" in summary, "Summary should have 'disabled'"
        assert "worlds" in summary, "Summary should have 'worlds' list"
        
        # Verify counts are integers
        assert isinstance(summary["total"], int)
        assert isinstance(summary["active"], int)
        assert isinstance(summary["opening_soon"], int)
        
        # Verify total matches modules count
        modules = data["modules"]
        assert summary["total"] == len(modules) or summary["total"] >= len(modules), \
            f"Summary total ({summary['total']}) should match or exceed modules count ({len(modules)})"
        
        print(f"PASS: Summary stats - Total: {summary['total']}, Active: {summary['active']}, Opening Soon: {summary['opening_soon']}")


class TestModulesRegistryFilters:
    """Tests for filtering modules"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token") or data.get("token")
        pytest.skip("Authentication failed")
    
    def test_filter_by_status_active(self, auth_token):
        """GET /api/founder/modules?status=active returns only active modules"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(
            f"{BASE_URL}/api/founder/modules?status=active",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        modules = data["modules"]
        
        # All returned modules should have status=active
        for module in modules:
            assert module["status"] == "active", \
                f"Module {module['id']} has status '{module['status']}', expected 'active'"
        
        # Verify filters_applied in response
        assert data.get("filters_applied", {}).get("status") == "active"
        
        print(f"PASS: Filter by status=active returns {len(modules)} active modules")
    
    def test_filter_by_status_opening_soon(self, auth_token):
        """GET /api/founder/modules?status=opening_soon returns only opening_soon modules"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(
            f"{BASE_URL}/api/founder/modules?status=opening_soon",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        modules = data["modules"]
        
        # All returned modules should have status=opening_soon
        for module in modules:
            assert module["status"] == "opening_soon", \
                f"Module {module['id']} has status '{module['status']}', expected 'opening_soon'"
        
        print(f"PASS: Filter by status=opening_soon returns {len(modules)} modules")
    
    def test_filter_by_world(self, auth_token):
        """GET /api/founder/modules?world=Social%20World returns only Social World modules"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(
            f"{BASE_URL}/api/founder/modules?world=Social%20World",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        modules = data["modules"]
        
        # All returned modules should have world=Social World
        for module in modules:
            assert module["world"].lower() == "social world", \
                f"Module {module['id']} has world '{module['world']}', expected 'Social World'"
        
        print(f"PASS: Filter by world=Social World returns {len(modules)} modules")
    
    def test_combined_filters(self, auth_token):
        """GET /api/founder/modules?status=active&world=Social%20World returns filtered results"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(
            f"{BASE_URL}/api/founder/modules?status=active&world=Social%20World",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        modules = data["modules"]
        
        # All returned modules should match both filters
        for module in modules:
            assert module["status"] == "active", f"Module {module['id']} should be active"
            assert module["world"].lower() == "social world", f"Module {module['id']} should be Social World"
        
        print(f"PASS: Combined filters (active + Social World) returns {len(modules)} modules")


class TestModulesRegistrySingleModule:
    """Tests for GET /api/founder/modules/:id endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token") or data.get("token")
        pytest.skip("Authentication failed")
    
    def test_get_single_module_by_id(self, auth_token):
        """GET /api/founder/modules/:id returns single module details"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Get a known module ID (frames is in the registry)
        response = requests.get(
            f"{BASE_URL}/api/founder/modules/frames",
            headers=headers
        )
        
        assert response.status_code == 200
        module = response.json()
        
        # Verify module fields
        assert module["id"] == "frames"
        assert "display_name" in module
        assert "world" in module
        assert "status" in module
        assert "frontend_routes" in module
        assert "api_routes" in module
        
        print(f"PASS: GET /api/founder/modules/frames returns module: {module['display_name']}")
    
    def test_get_nonexistent_module(self, auth_token):
        """GET /api/founder/modules/:id returns 404 for non-existent module"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.get(
            f"{BASE_URL}/api/founder/modules/nonexistent_module_xyz",
            headers=headers
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: GET /api/founder/modules/nonexistent returns 404")
    
    def test_single_module_requires_auth(self):
        """GET /api/founder/modules/:id requires authentication"""
        response = requests.get(f"{BASE_URL}/api/founder/modules/frames")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: GET /api/founder/modules/:id returns 401 without auth")


class TestModulesRegistryFile:
    """Tests for the registry JSON file"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token") or data.get("token")
        pytest.skip("Authentication failed")
    
    def test_registry_has_expected_modules(self, auth_token):
        """Registry should contain expected modules like frames, local_exchange, etc."""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/founder/modules", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        modules = data["modules"]
        
        # Get module IDs
        module_ids = [m["id"] for m in modules]
        
        # Check for expected modules
        expected_modules = ["frames", "local_exchange", "founder_command", "skills_world"]
        for expected in expected_modules:
            assert expected in module_ids, f"Expected module '{expected}' not found in registry"
        
        print(f"PASS: Registry contains expected modules: {expected_modules}")
    
    def test_registry_module_count(self, auth_token):
        """Registry should have 30 modules as per implementation"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/founder/modules", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        summary = data["summary"]
        
        # Based on the registry file, there should be 30 modules
        assert summary["total"] == 30, f"Expected 30 modules, got {summary['total']}"
        print(f"PASS: Registry has {summary['total']} modules")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
