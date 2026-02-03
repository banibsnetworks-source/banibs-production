"""
BANIBS Circles API Tests
Tests for GET /api/circles endpoint with auto-seeding
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCirclesAPI:
    """Circles endpoint tests - Phase 11.5.3"""
    
    def test_get_circles_returns_200(self):
        """Test GET /api/circles returns 200 status"""
        response = requests.get(f"{BASE_URL}/api/circles")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    def test_get_circles_returns_6_seeded_circles(self):
        """Test GET /api/circles returns exactly 6 seeded circles"""
        response = requests.get(f"{BASE_URL}/api/circles")
        assert response.status_code == 200
        
        data = response.json()
        assert "circles" in data, "Response should contain 'circles' key"
        assert "total" in data, "Response should contain 'total' key"
        assert data["total"] == 6, f"Expected 6 circles, got {data['total']}"
        assert len(data["circles"]) == 6, f"Expected 6 circles in list, got {len(data['circles'])}"
    
    def test_circle_structure_has_required_fields(self):
        """Test each circle has required fields: name, description, tags, member_count, privacy_level, is_verified"""
        response = requests.get(f"{BASE_URL}/api/circles")
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["id", "name", "slug", "description", "tags", "member_count", "privacy_level", "is_verified"]
        
        for circle in data["circles"]:
            for field in required_fields:
                assert field in circle, f"Circle missing required field: {field}"
    
    def test_circle_black_entrepreneurs_exists(self):
        """Test Black Entrepreneurs Network circle exists with correct data"""
        response = requests.get(f"{BASE_URL}/api/circles")
        assert response.status_code == 200
        
        data = response.json()
        circle = next((c for c in data["circles"] if c["slug"] == "black-entrepreneurs"), None)
        
        assert circle is not None, "Black Entrepreneurs Network circle not found"
        assert circle["name"] == "Black Entrepreneurs Network"
        assert circle["is_verified"] == True
        assert circle["privacy_level"] == "public"
        assert "business" in circle["tags"]
    
    def test_circle_mental_health_has_request_to_join(self):
        """Test Mental Health circle has request_to_join privacy level"""
        response = requests.get(f"{BASE_URL}/api/circles")
        assert response.status_code == 200
        
        data = response.json()
        circle = next((c for c in data["circles"] if c["slug"] == "mental-health-wellness"), None)
        
        assert circle is not None, "Mental Health & Wellness circle not found"
        assert circle["privacy_level"] == "request_to_join"
        assert circle["is_featured_in_ability"] == True
    
    def test_all_circles_are_verified(self):
        """Test all seeded circles have is_verified=True"""
        response = requests.get(f"{BASE_URL}/api/circles")
        assert response.status_code == 200
        
        data = response.json()
        for circle in data["circles"]:
            assert circle["is_verified"] == True, f"Circle {circle['name']} should be verified"
    
    def test_circles_have_valid_tags(self):
        """Test all circles have non-empty tags array"""
        response = requests.get(f"{BASE_URL}/api/circles")
        assert response.status_code == 200
        
        data = response.json()
        for circle in data["circles"]:
            assert isinstance(circle["tags"], list), f"Circle {circle['name']} tags should be a list"
            assert len(circle["tags"]) > 0, f"Circle {circle['name']} should have at least one tag"
    
    def test_get_single_circle_by_id(self):
        """Test GET /api/circles/{circle_id} returns single circle"""
        response = requests.get(f"{BASE_URL}/api/circles/circle-black-entrepreneurs")
        assert response.status_code == 200
        
        circle = response.json()
        assert circle["id"] == "circle-black-entrepreneurs"
        assert circle["name"] == "Black Entrepreneurs Network"
    
    def test_get_nonexistent_circle_returns_404(self):
        """Test GET /api/circles/{invalid_id} returns 404"""
        response = requests.get(f"{BASE_URL}/api/circles/nonexistent-circle-id")
        assert response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
