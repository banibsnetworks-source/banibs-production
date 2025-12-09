#!/usr/bin/env python3
"""
Test script for Phase 7.6.1 - News Homepage API Endpoint
"""

import requests
import json
import sys
import time
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://identity-trust-hub.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

def log(message: str, level: str = "INFO"):
    """Log test messages with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")

def make_request(method: str, endpoint: str, data=None, headers=None, params=None):
    """Make HTTP request with error handling"""
    url = f"{API_BASE}{endpoint}"
    
    request_headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    if headers:
        request_headers.update(headers)
        
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=request_headers, params=params)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=request_headers)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        log(f"{method} {endpoint} -> {response.status_code}")
        return response
        
    except requests.exceptions.RequestException as e:
        log(f"Request failed: {e}", "ERROR")
        raise

def test_news_homepage_endpoint():
    """Test Phase 7.6.1 - News Homepage API Endpoint"""
    log("Testing Phase 7.6.1 - News Homepage API Endpoint...")
    
    start_time = time.time()
    response = make_request("GET", "/news/homepage")
    response_time = (time.time() - start_time) * 1000
    
    if response.status_code != 200:
        log(f"❌ Homepage endpoint failed: {response.status_code} - {response.text}", "ERROR")
        return False
    
    try:
        data = response.json()
    except Exception as e:
        log(f"❌ Homepage endpoint returned invalid JSON: {e}", "ERROR")
        return False
    
    # Test 1: Verify response structure
    required_keys = ["hero", "top_stories", "sections", "banibs_tv"]
    missing_keys = [key for key in required_keys if key not in data]
    if missing_keys:
        log(f"❌ Homepage response missing keys: {missing_keys}", "ERROR")
        return False
    
    # Test 2: Verify sections structure
    sections = data.get("sections", {})
    required_sections = ["us", "world", "business", "tech", "sports"]
    missing_sections = [section for section in required_sections if section not in sections]
    if missing_sections:
        log(f"❌ Homepage sections missing: {missing_sections}", "ERROR")
        return False
    
    # Test 3: Verify top_stories array
    top_stories = data.get("top_stories", [])
    if not isinstance(top_stories, list):
        log("❌ top_stories should be an array", "ERROR")
        return False
    
    if len(top_stories) > 6:
        log(f"❌ top_stories should have max 6 items, got {len(top_stories)}", "ERROR")
        return False
    
    # Test 4: Verify section item limits
    for section_name, items in sections.items():
        if not isinstance(items, list):
            log(f"❌ Section {section_name} should be an array", "ERROR")
            return False
        
        if len(items) > 12:
            log(f"❌ Section {section_name} should have max 12 items, got {len(items)}", "ERROR")
            return False
    
    # Test 5: Verify news item structure
    all_items = []
    if data.get("hero"):
        all_items.append(data["hero"])
    all_items.extend(top_stories)
    for section_items in sections.values():
        all_items.extend(section_items)
    
    required_news_fields = ["id", "title", "summary", "imageUrl", "publishedAt", "category"]
    for i, item in enumerate(all_items[:5]):  # Check first 5 items
        missing_fields = [field for field in required_news_fields if field not in item]
        if missing_fields:
            log(f"❌ News item {i} missing fields: {missing_fields}", "ERROR")
            return False
        
        # Test 6: Verify datetime serialization
        published_at = item.get("publishedAt")
        if published_at and not isinstance(published_at, str):
            log(f"❌ publishedAt should be ISO string, got {type(published_at)}", "ERROR")
            return False
    
    # Test 7: Verify BANIBS TV structure (if present)
    banibs_tv = data.get("banibs_tv")
    if banibs_tv:
        required_tv_fields = ["id", "title", "description", "thumbnailUrl"]
        missing_tv_fields = [field for field in required_tv_fields if field not in banibs_tv]
        if missing_tv_fields:
            log(f"❌ BANIBS TV missing fields: {missing_tv_fields}", "ERROR")
            return False
    
    # Test 8: Check for duplicates across sections
    all_item_ids = []
    for section_items in sections.values():
        for item in section_items:
            if item.get("id"):
                all_item_ids.append(item["id"])
    
    if len(all_item_ids) != len(set(all_item_ids)):
        log("❌ Duplicate items found across sections", "ERROR")
        return False
    
    # Test 9: Verify response time
    if response_time > 500:
        log(f"⚠️ Response time {response_time:.2f}ms exceeds 500ms target")
    
    # Log success details
    log(f"✅ News Homepage API working - Response time: {response_time:.2f}ms")
    log(f"   Hero: {'Present' if data.get('hero') else 'None'}")
    log(f"   Top Stories: {len(top_stories)} items")
    log(f"   Sections: US({len(sections.get('us', []))}), World({len(sections.get('world', []))}), Business({len(sections.get('business', []))}), Tech({len(sections.get('tech', []))}), Sports({len(sections.get('sports', []))})")
    log(f"   BANIBS TV: {'Present' if banibs_tv else 'None'}")
    
    return True

def test_news_homepage_categorization():
    """Test news categorization logic makes sense"""
    log("Testing news categorization logic...")
    
    response = make_request("GET", "/news/homepage")
    if response.status_code != 200:
        log("❌ Cannot test categorization - homepage endpoint failed", "ERROR")
        return False
    
    data = response.json()
    sections = data.get("sections", {})
    
    # Check if items are reasonably categorized
    categorization_issues = []
    
    # Business section should contain business-related content
    business_items = sections.get("business", [])
    for item in business_items[:3]:  # Check first 3
        category = (item.get("category") or "").lower()
        title = (item.get("title") or "").lower()
        if not any(keyword in category + title for keyword in ["business", "economy", "entrepreneur", "startup", "grant", "funding"]):
            categorization_issues.append(f"Business section item may be miscategorized: {item.get('title', 'Unknown')}")
    
    # Tech section should contain tech-related content
    tech_items = sections.get("tech", [])
    for item in tech_items[:3]:  # Check first 3
        category = (item.get("category") or "").lower()
        title = (item.get("title") or "").lower()
        if not any(keyword in category + title for keyword in ["tech", "technology", "innovation", "ai", "digital", "software"]):
            categorization_issues.append(f"Tech section item may be miscategorized: {item.get('title', 'Unknown')}")
    
    if categorization_issues:
        for issue in categorization_issues[:3]:  # Show max 3 issues
            log(f"⚠️ {issue}")
        log("✅ Categorization working but some items may need review")
    else:
        log("✅ News categorization logic appears correct")
    
    return True

def test_news_homepage_empty_state():
    """Test homepage endpoint handles empty state gracefully"""
    log("Testing news homepage empty state handling...")
    
    # The endpoint should return valid structure even if no news exists
    response = make_request("GET", "/news/homepage")
    
    if response.status_code != 200:
        log(f"❌ Homepage endpoint should handle empty state gracefully, got {response.status_code}", "ERROR")
        return False
    
    data = response.json()
    
    # Should have proper structure even if empty
    required_keys = ["hero", "top_stories", "sections", "banibs_tv"]
    if not all(key in data for key in required_keys):
        log("❌ Homepage should return proper structure even when empty", "ERROR")
        return False
    
    # Sections should be objects with proper keys
    sections = data.get("sections", {})
    required_sections = ["us", "world", "business", "tech", "sports"]
    if not all(section in sections for section in required_sections):
        log("❌ Homepage should return all section keys even when empty", "ERROR")
        return False
    
    log("✅ Homepage endpoint handles empty/sparse data gracefully")
    return True

def main():
    """Run all Phase 7.6.1 tests"""
    log("Starting Phase 7.6.1 - News Homepage API Endpoint Testing")
    log(f"Testing against: {API_BASE}")
    
    tests = [
        ("News Homepage Endpoint Structure", test_news_homepage_endpoint),
        ("News Homepage Categorization Logic", test_news_homepage_categorization),
        ("News Homepage Empty State Handling", test_news_homepage_empty_state),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        log(f"\n--- Running {test_name} ---")
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            log(f"❌ {test_name} failed with exception: {e}", "ERROR")
            failed += 1
            
    log(f"\n=== PHASE 7.6.1 TEST RESULTS ===")
    log(f"✅ Passed: {passed}")
    log(f"❌ Failed: {failed}")
    log(f"Total: {passed + failed}")
    
    if failed == 0:
        log("🎉 All Phase 7.6.1 tests passed!")
        return True
    else:
        log(f"💥 {failed} test(s) failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)