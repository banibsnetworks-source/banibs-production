"""
Integration tests for BANIBS Opportunities API (Phase 2.7)
Tests all CRUD operations, admin workflow, and filtering
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8001/api/opportunities"
ADMIN_KEY = "BANIBS_INTERNAL_KEY"

def print_test(name, passed, details=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {name}")
    if details:
        print(f"   Details: {details}")
    print()

def test_create_opportunity():
    """Test creating a new opportunity"""
    payload = {
        "title": "Test Job Opportunity",
        "orgName": "Test Corp",
        "type": "job",
        "location": "Remote",
        "deadline": "2025-12-31T23:59:59",
        "description": "Test description",
        "link": "https://example.com/apply"
    }
    
    response = requests.post(f"{BASE_URL}/", json=payload)
    passed = response.status_code == 201 and "id" in response.json()
    print_test("Create Opportunity", passed, f"Status: {response.status_code}, Response: {response.json()}")
    return response.json().get("id") if passed else None

def test_get_public_opportunities_empty():
    """Test getting public opportunities (should be empty before approval)"""
    response = requests.get(f"{BASE_URL}/")
    data = response.json()
    passed = response.status_code == 200 and isinstance(data, list)
    print_test("Get Public Opportunities (before approval)", passed, f"Count: {len(data)}")

def test_get_pending_opportunities(opp_id):
    """Test admin getting pending opportunities"""
    headers = {"X-API-Key": ADMIN_KEY}
    response = requests.get(f"{BASE_URL}/pending", headers=headers)
    data = response.json()
    passed = response.status_code == 200 and len(data) > 0
    print_test("Get Pending Opportunities (Admin)", passed, f"Count: {len(data)}")
    return passed

def test_approve_opportunity(opp_id):
    """Test admin approving an opportunity"""
    headers = {"X-API-Key": ADMIN_KEY}
    response = requests.patch(f"{BASE_URL}/{opp_id}/approve", headers=headers)
    data = response.json()
    passed = response.status_code == 200 and data.get("approved") == True
    print_test("Approve Opportunity", passed, f"Response: {data}")
    return passed

def test_get_public_opportunities_after_approval():
    """Test getting public opportunities (should have approved items)"""
    response = requests.get(f"{BASE_URL}/")
    data = response.json()
    passed = response.status_code == 200 and len(data) > 0
    print_test("Get Public Opportunities (after approval)", passed, f"Count: {len(data)}")

def test_feature_opportunity(opp_id):
    """Test admin featuring an opportunity"""
    headers = {"X-API-Key": ADMIN_KEY}
    response = requests.patch(f"{BASE_URL}/{opp_id}/feature", headers=headers)
    data = response.json()
    passed = response.status_code == 200 and data.get("featured") == True
    print_test("Feature Opportunity", passed, f"Response: {data}")
    return passed

def test_get_featured_opportunities():
    """Test getting featured opportunities"""
    response = requests.get(f"{BASE_URL}/featured")
    data = response.json()
    passed = response.status_code == 200 and len(data) > 0 and data[0].get("featured") == True
    print_test("Get Featured Opportunities", passed, f"Count: {len(data)}")

def test_type_filtering():
    """Test filtering opportunities by type"""
    # Create grant opportunity
    grant_payload = {
        "title": "Test Grant",
        "orgName": "Grant Foundation",
        "type": "grant",
        "description": "Grant for research"
    }
    grant_response = requests.post(f"{BASE_URL}/", json=grant_payload)
    grant_id = grant_response.json().get("id")
    
    # Approve it
    headers = {"X-API-Key": ADMIN_KEY}
    requests.patch(f"{BASE_URL}/{grant_id}/approve", headers=headers)
    
    # Test filtering
    job_response = requests.get(f"{BASE_URL}/?type=job")
    grant_response = requests.get(f"{BASE_URL}/?type=grant")
    
    job_data = job_response.json()
    grant_data = grant_response.json()
    
    passed = (
        all(item["type"] == "job" for item in job_data) and
        all(item["type"] == "grant" for item in grant_data)
    )
    print_test("Type Filtering", passed, f"Jobs: {len(job_data)}, Grants: {len(grant_data)}")

def test_reject_opportunity():
    """Test admin rejecting an opportunity"""
    # Create spam opportunity
    spam_payload = {
        "title": "Spam Opportunity",
        "orgName": "Fake Corp",
        "type": "job",
        "description": "Should be rejected"
    }
    spam_response = requests.post(f"{BASE_URL}/", json=spam_payload)
    spam_id = spam_response.json().get("id")
    
    # Reject it
    headers = {"X-API-Key": ADMIN_KEY}
    response = requests.patch(f"{BASE_URL}/{spam_id}/reject", headers=headers)
    data = response.json()
    
    passed = response.status_code == 200 and data.get("approved") == False
    print_test("Reject Opportunity", passed, f"Response: {data}")

def test_unauthorized_admin_access():
    """Test that admin endpoints require valid API key"""
    # Try without key
    response1 = requests.get(f"{BASE_URL}/pending")
    
    # Try with wrong key
    headers = {"X-API-Key": "WRONG_KEY"}
    response2 = requests.get(f"{BASE_URL}/pending", headers=headers)
    
    passed = response1.status_code == 403 and response2.status_code == 403
    print_test("Admin Authorization Protection", passed, f"Status codes: {response1.status_code}, {response2.status_code}")

def run_all_tests():
    """Run all integration tests"""
    print("=" * 60)
    print("BANIBS Phase 2.7 - Opportunities API Integration Tests")
    print("=" * 60)
    print()
    
    # Test flow
    opp_id = test_create_opportunity()
    
    if opp_id:
        test_get_public_opportunities_empty()
        test_get_pending_opportunities(opp_id)
        test_approve_opportunity(opp_id)
        test_get_public_opportunities_after_approval()
        test_feature_opportunity(opp_id)
        test_get_featured_opportunities()
    
    test_type_filtering()
    test_reject_opportunity()
    test_unauthorized_admin_access()
    
    print("=" * 60)
    print("Tests Complete!")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
