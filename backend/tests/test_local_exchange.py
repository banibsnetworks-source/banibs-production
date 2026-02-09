"""
Local Exchange API Tests
Tests for BANIBS Social World Marketplace MVP
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://community-pulse-85.preview.emergentagent.com')

class TestLocalExchangeCategories:
    """Test categories and conditions endpoints"""
    
    def test_get_categories_returns_12_categories(self):
        """GET /api/local-exchange/categories returns 12 categories"""
        response = requests.get(f"{BASE_URL}/api/local-exchange/categories")
        assert response.status_code == 200
        
        data = response.json()
        assert "categories" in data
        assert len(data["categories"]) == 12
        
        # Verify category structure
        for cat in data["categories"]:
            assert "id" in cat
            assert "name" in cat
            assert "icon" in cat
    
    def test_get_categories_returns_5_conditions(self):
        """GET /api/local-exchange/categories returns 5 conditions"""
        response = requests.get(f"{BASE_URL}/api/local-exchange/categories")
        assert response.status_code == 200
        
        data = response.json()
        assert "conditions" in data
        assert len(data["conditions"]) == 5
        
        # Verify expected conditions
        condition_ids = [c["id"] for c in data["conditions"]]
        assert "new" in condition_ids
        assert "like_new" in condition_ids
        assert "good" in condition_ids
        assert "fair" in condition_ids
        assert "for_parts" in condition_ids


class TestLocalExchangeListings:
    """Test listings endpoints"""
    
    def test_get_listings_guest_access(self):
        """GET /api/local-exchange/listings works for guests (no auth)"""
        response = requests.get(f"{BASE_URL}/api/local-exchange/listings")
        assert response.status_code == 200
        
        data = response.json()
        assert "listings" in data
        assert "total" in data
        assert "skip" in data
        assert "limit" in data
        assert "has_more" in data
        assert isinstance(data["listings"], list)
    
    def test_get_listings_with_category_filter(self):
        """GET /api/local-exchange/listings with category filter"""
        response = requests.get(f"{BASE_URL}/api/local-exchange/listings?category=electronics")
        assert response.status_code == 200
        
        data = response.json()
        assert "listings" in data
    
    def test_get_listings_with_search_filter(self):
        """GET /api/local-exchange/listings with search filter"""
        response = requests.get(f"{BASE_URL}/api/local-exchange/listings?search=test")
        assert response.status_code == 200
        
        data = response.json()
        assert "listings" in data
    
    def test_get_listings_with_free_filter(self):
        """GET /api/local-exchange/listings with is_free filter"""
        response = requests.get(f"{BASE_URL}/api/local-exchange/listings?is_free=true")
        assert response.status_code == 200
        
        data = response.json()
        assert "listings" in data
    
    def test_get_listings_with_sort(self):
        """GET /api/local-exchange/listings with sort parameter"""
        for sort in ["newest", "oldest", "price_low", "price_high"]:
            response = requests.get(f"{BASE_URL}/api/local-exchange/listings?sort={sort}")
            assert response.status_code == 200
            
            data = response.json()
            assert "listings" in data
    
    def test_get_listings_pagination(self):
        """GET /api/local-exchange/listings with pagination"""
        response = requests.get(f"{BASE_URL}/api/local-exchange/listings?skip=0&limit=10")
        assert response.status_code == 200
        
        data = response.json()
        assert data["skip"] == 0
        assert data["limit"] == 10


class TestLocalExchangeAuth:
    """Test authenticated endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "raymondneely@banibs.com",
            "password": "BanibsAdmin2026!"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_create_listing_requires_auth(self):
        """POST /api/local-exchange/listings requires authentication"""
        response = requests.post(f"{BASE_URL}/api/local-exchange/listings", json={
            "title": "Test Item",
            "description": "Test description for the item",
            "category": "electronics",
            "price": 100,
            "condition": "good",
            "location_city": "New York",
            "location_zip": "10001"
        })
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403]
    
    def test_get_my_listings_requires_auth(self):
        """GET /api/local-exchange/listings/mine requires authentication"""
        response = requests.get(f"{BASE_URL}/api/local-exchange/listings/mine")
        assert response.status_code in [401, 403]
    
    def test_create_listing_with_auth(self, auth_token):
        """POST /api/local-exchange/listings creates listing with auth"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        payload = {
            "title": "TEST_Vintage Electronics",
            "description": "Test description for vintage electronics item for sale",
            "category": "electronics",
            "price": 150.00,
            "is_free": False,
            "condition": "good",
            "photos": [],
            "location_city": "Atlanta",
            "location_zip": "30301",
            "location_state": "GA",
            "visibility_radius": 25
        }
        
        response = requests.post(
            f"{BASE_URL}/api/local-exchange/listings",
            json=payload,
            headers=headers
        )
        
        assert response.status_code == 201
        
        data = response.json()
        assert data["title"] == payload["title"]
        assert data["category"] == payload["category"]
        assert data["price"] == payload["price"]
        assert data["condition"] == payload["condition"]
        assert data["location_city"] == payload["location_city"]
        assert "id" in data
        assert "seller_id" in data
        
        # Cleanup - delete the test listing
        listing_id = data["id"]
        delete_response = requests.delete(
            f"{BASE_URL}/api/local-exchange/listings/{listing_id}",
            headers=headers
        )
        assert delete_response.status_code == 204
    
    def test_create_free_listing(self, auth_token):
        """POST /api/local-exchange/listings creates free listing"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        payload = {
            "title": "TEST_Free Item Giveaway",
            "description": "Free item for anyone who wants it - test listing",
            "category": "free",
            "price": 0,
            "is_free": True,
            "condition": "good",
            "photos": [],
            "location_city": "Chicago",
            "location_zip": "60601",
            "location_state": "IL",
            "visibility_radius": 25
        }
        
        response = requests.post(
            f"{BASE_URL}/api/local-exchange/listings",
            json=payload,
            headers=headers
        )
        
        assert response.status_code == 201
        
        data = response.json()
        assert data["is_free"] == True
        assert data["price"] == 0
        
        # Cleanup
        listing_id = data["id"]
        requests.delete(f"{BASE_URL}/api/local-exchange/listings/{listing_id}", headers=headers)
    
    def test_get_my_listings_with_auth(self, auth_token):
        """GET /api/local-exchange/listings/mine returns user's listings"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.get(
            f"{BASE_URL}/api/local-exchange/listings/mine",
            headers=headers
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert "listings" in data
        assert "total" in data
    
    def test_invalid_category_rejected(self, auth_token):
        """POST /api/local-exchange/listings rejects invalid category"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        payload = {
            "title": "TEST_Invalid Category",
            "description": "Test description for invalid category test",
            "category": "invalid_category",
            "price": 100,
            "condition": "good",
            "location_city": "Miami",
            "location_zip": "33101"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/local-exchange/listings",
            json=payload,
            headers=headers
        )
        
        assert response.status_code == 400
    
    def test_invalid_condition_rejected(self, auth_token):
        """POST /api/local-exchange/listings rejects invalid condition"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        payload = {
            "title": "TEST_Invalid Condition",
            "description": "Test description for invalid condition test",
            "category": "electronics",
            "price": 100,
            "condition": "invalid_condition",
            "location_city": "Miami",
            "location_zip": "33101"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/local-exchange/listings",
            json=payload,
            headers=headers
        )
        
        assert response.status_code == 400


class TestLocalExchangeListingDetail:
    """Test single listing endpoints"""
    
    def test_get_invalid_listing_returns_404(self):
        """GET /api/local-exchange/listings/{id} returns 404 for non-existent"""
        response = requests.get(f"{BASE_URL}/api/local-exchange/listings/000000000000000000000000")
        assert response.status_code == 404
    
    def test_get_invalid_listing_id_format(self):
        """GET /api/local-exchange/listings/{id} returns 400 for invalid ID format"""
        response = requests.get(f"{BASE_URL}/api/local-exchange/listings/invalid-id")
        assert response.status_code == 400


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
