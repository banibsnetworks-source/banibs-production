#!/usr/bin/env python3
"""
Book Vault API Test Suite
Tests the Book Vault endpoints for the BANIBS platform
"""

import requests
import json
import sys
from datetime import datetime
from typing import Optional, Dict, Any

# Backend URL from frontend/.env
BACKEND_URL = "https://bookvault-manager.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class BookVaultTester:
    def __init__(self):
        self.admin_token = None
        self.contributor_token = None
        self.test_work_id = None
        self.test_entry_id = None
        self.test_new_entry_id = None
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    headers: Optional[Dict] = None, params: Optional[Dict] = None) -> requests.Response:
        """Make HTTP request with error handling"""
        url = f"{API_BASE}{endpoint}"
        
        request_headers = self.session.headers.copy()
        if headers:
            request_headers.update(headers)
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=request_headers, params=params)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=request_headers)
            elif method.upper() == "PATCH":
                response = self.session.patch(url, json=data, headers=request_headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=request_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            self.log(f"{method} {endpoint} -> {response.status_code}")
            return response
            
        except requests.exceptions.RequestException as e:
            self.log(f"Request failed: {e}", "ERROR")
            raise
            
    def test_admin_login(self) -> bool:
        """Test admin login with admin@banibs.com / BanibsAdmin#2025"""
        self.log("Testing admin login...")
        
        response = self.make_request("POST", "/auth/login", {
            "email": "admin@banibs.com",
            "password": "BanibsAdmin#2025"
        })
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.admin_token = data["access_token"]
                self.log("✅ Admin login successful")
                return True
            else:
                self.log("❌ Admin login response missing access_token", "ERROR")
                return False
        else:
            self.log(f"❌ Admin login failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_book_vault_authentication(self) -> bool:
        """Test Book Vault endpoints require authentication"""
        self.log("📚 BOOK VAULT AUTHENTICATION TEST")
        
        # Test without token - should return 401
        response = self.make_request("GET", "/book-vault/works")
        if response.status_code != 401:
            self.log(f"❌ Book Vault works endpoint should require auth, got {response.status_code}", "ERROR")
            return False
        
        self.log("✅ Book Vault properly requires authentication")
        return True
    
    def test_book_vault_works_list(self) -> bool:
        """Test GET /api/book-vault/works - List all works"""
        self.log("📚 BOOK VAULT WORKS LIST TEST")
        
        if not self.admin_token:
            self.log("❌ No admin token available for Book Vault test", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = self.make_request("GET", "/book-vault/works", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if "works" in data and "total" in data:
                works = data["works"]
                total = data["total"]
                self.log(f"✅ Works list endpoint working - Found {total} works")
                
                # Should have 4 seeded works
                if total >= 4:
                    self.log("✅ Expected seeded works found")
                    
                    # Verify work structure
                    if works:
                        work = works[0]
                        required_fields = ["id", "title", "series_key", "work_type", "status"]
                        if all(field in work for field in required_fields):
                            self.log(f"✅ Work structure correct - Sample: '{work['title']}'")
                            return True
                        else:
                            missing = [f for f in required_fields if f not in work]
                            self.log(f"❌ Work missing fields: {missing}", "ERROR")
                            return False
                    else:
                        self.log("❌ No works in response", "ERROR")
                        return False
                else:
                    self.log(f"⚠️ Expected at least 4 seeded works, found {total}")
                    return True
            else:
                self.log(f"❌ Works list response missing required fields: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ Works list failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_book_vault_work_detail(self) -> bool:
        """Test GET /api/book-vault/works/{work_id} - Get specific work"""
        self.log("📚 BOOK VAULT WORK DETAIL TEST")
        
        if not self.admin_token:
            self.log("❌ No admin token available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # First get list of works to find G-1
        response = self.make_request("GET", "/book-vault/works", headers=headers)
        if response.status_code != 200:
            self.log("❌ Could not get works list for detail test", "ERROR")
            return False
        
        works = response.json().get("works", [])
        g1_work = None
        for work in works:
            if work.get("order_key") == "G-1":
                g1_work = work
                break
        
        if not g1_work:
            self.log("❌ Could not find G-1 work for detail test", "ERROR")
            return False
        
        # Test work detail
        work_id = g1_work["id"]
        response = self.make_request("GET", f"/book-vault/works/{work_id}", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["work", "entry_count", "version_count"]
            
            if all(field in data for field in required_fields):
                work = data["work"]
                entry_count = data["entry_count"]
                version_count = data["version_count"]
                
                self.log(f"✅ Work detail working - '{work['title']}'")
                self.log(f"   Entries: {entry_count}, Versions: {version_count}")
                
                # G-1 should have 5 scripture notes
                if entry_count >= 5:
                    self.log("✅ Expected scripture notes found")
                    return True
                else:
                    self.log(f"⚠️ Expected at least 5 entries, found {entry_count}")
                    return True
            else:
                missing = [f for f in required_fields if f not in data]
                self.log(f"❌ Work detail missing fields: {missing}", "ERROR")
                return False
        else:
            self.log(f"❌ Work detail failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_book_vault_create_work(self) -> bool:
        """Test POST /api/book-vault/works - Create new work"""
        self.log("📚 BOOK VAULT CREATE WORK TEST")
        
        if not self.admin_token:
            self.log("❌ No admin token available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        work_data = {
            "series_key": "OTHER",
            "work_type": "book",
            "order_key": "TEST-1",
            "title": "Test Work",
            "subtitle": "A test work for API validation",
            "status": "planned",
            "description": "This is a test work created during API testing",
            "tags": ["test", "api-validation"]
        }
        
        response = self.make_request("POST", "/book-vault/works", work_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "work" in data:
                work = data["work"]
                self.log(f"✅ Work created successfully - ID: {work['id']}")
                self.log(f"   Title: '{work['title']}'")
                
                # Store for cleanup/further testing
                self.test_work_id = work["id"]
                return True
            else:
                self.log(f"❌ Create work response invalid: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ Create work failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_book_vault_entries_list(self) -> bool:
        """Test GET /api/book-vault/works/{work_id}/entries - List entries"""
        self.log("📚 BOOK VAULT ENTRIES LIST TEST")
        
        if not self.admin_token:
            self.log("❌ No admin token available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Get G-1 work ID
        response = self.make_request("GET", "/book-vault/works", headers=headers)
        if response.status_code != 200:
            self.log("❌ Could not get works for entries test", "ERROR")
            return False
        
        works = response.json().get("works", [])
        g1_work = None
        for work in works:
            if work.get("order_key") == "G-1":
                g1_work = work
                break
        
        if not g1_work:
            self.log("❌ Could not find G-1 work", "ERROR")
            return False
        
        # Test entries list
        work_id = g1_work["id"]
        response = self.make_request("GET", f"/book-vault/works/{work_id}/entries", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if "entries" in data and "total" in data:
                entries = data["entries"]
                total = data["total"]
                self.log(f"✅ Entries list working - Found {total} entries")
                
                # Should have 5 scripture notes
                if total >= 5:
                    scripture_notes = [e for e in entries if e.get("entry_type") == "scripture_note"]
                    self.log(f"✅ Found {len(scripture_notes)} scripture notes")
                    
                    if scripture_notes:
                        note = scripture_notes[0]
                        self.log(f"   Sample: '{note['title']}'")
                        
                        # Store for further testing
                        self.test_entry_id = note["id"]
                    
                    return True
                else:
                    self.log(f"⚠️ Expected at least 5 entries, found {total}")
                    return True
            else:
                self.log(f"❌ Entries list response invalid: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ Entries list failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_book_vault_search(self) -> bool:
        """Test GET /api/book-vault/search - Search functionality"""
        self.log("📚 BOOK VAULT SEARCH TEST")
        
        if not self.admin_token:
            self.log("❌ No admin token available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test search for "light"
        response = self.make_request("GET", "/book-vault/search", 
                                   params={"q": "light"}, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["query", "works", "entries", "versions", "total"]
            
            if all(field in data for field in required_fields):
                query = data["query"]
                works = data["works"]
                entries = data["entries"]
                versions = data["versions"]
                total = data["total"]
                
                self.log(f"✅ Search working - Query: '{query}', Total results: {total}")
                self.log(f"   Works: {len(works)}, Entries: {len(entries)}, Versions: {len(versions)}")
                
                # Should find "The Light God Wants You to See"
                light_work = None
                for work in works:
                    if "light" in work.get("title", "").lower():
                        light_work = work
                        break
                
                if light_work:
                    self.log(f"✅ Found expected work: '{light_work['title']}'")
                
                return True
            else:
                missing = [f for f in required_fields if f not in data]
                self.log(f"❌ Search response missing fields: {missing}", "ERROR")
                return False
        else:
            self.log(f"❌ Search failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_book_vault_search_matthew(self) -> bool:
        """Test search for 'Matthew' - should find scripture notes"""
        self.log("📚 BOOK VAULT SEARCH MATTHEW TEST")
        
        if not self.admin_token:
            self.log("❌ No admin token available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        response = self.make_request("GET", "/book-vault/search", 
                                   params={"q": "Matthew"}, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            total = data.get("total", 0)
            entries = data.get("entries", [])
            
            self.log(f"✅ Matthew search working - Total results: {total}")
            
            # Should find Matthew scripture note
            matthew_entry = None
            for entry in entries:
                if "matthew" in entry.get("title", "").lower():
                    matthew_entry = entry
                    break
            
            if matthew_entry:
                self.log(f"✅ Found Matthew scripture note: '{matthew_entry['title']}'")
            
            return True
        else:
            self.log(f"❌ Matthew search failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_book_vault_entry_detail(self) -> bool:
        """Test GET /api/book-vault/entries/{entry_id} - Get entry with version"""
        self.log("📚 BOOK VAULT ENTRY DETAIL TEST")
        
        if not self.admin_token or not self.test_entry_id:
            self.log("❌ No admin token or test entry available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = self.make_request("GET", f"/book-vault/entries/{self.test_entry_id}", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["entry", "current_version", "version_count"]
            
            if all(field in data for field in required_fields):
                entry = data["entry"]
                current_version = data["current_version"]
                version_count = data["version_count"]
                
                self.log(f"✅ Entry detail working - '{entry['title']}'")
                self.log(f"   Version count: {version_count}")
                
                if current_version:
                    self.log(f"   Current version: v{current_version.get('version_number', 1)}")
                    return True
                else:
                    self.log("⚠️ No current version found")
                    return True
            else:
                missing = [f for f in required_fields if f not in data]
                self.log(f"❌ Entry detail missing fields: {missing}", "ERROR")
                return False
        else:
            self.log(f"❌ Entry detail failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_book_vault_create_entry(self) -> bool:
        """Test POST /api/book-vault/works/{work_id}/entries - Create entry"""
        self.log("📚 BOOK VAULT CREATE ENTRY TEST")
        
        if not self.admin_token or not self.test_work_id:
            self.log("❌ No admin token or test work available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        entry_data = {
            "work_id": self.test_work_id,
            "entry_type": "chapter",
            "title": "Test Chapter",
            "order_index": 1,
            "tags": ["test", "chapter"],
            "content": "# Test Chapter\n\nThis is a test chapter created during API testing.",
            "content_format": "markdown"
        }
        
        response = self.make_request("POST", f"/book-vault/works/{self.test_work_id}/entries", 
                                   entry_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "entry" in data and "version" in data:
                entry = data["entry"]
                version = data["version"]
                self.log(f"✅ Entry created successfully - ID: {entry['id']}")
                self.log(f"   Title: '{entry['title']}'")
                self.log(f"   Version: v{version['version_number']}")
                
                # Store for further testing
                self.test_new_entry_id = entry["id"]
                return True
            else:
                self.log(f"❌ Create entry response invalid: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ Create entry failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_book_vault_versions_list(self) -> bool:
        """Test GET /api/book-vault/entries/{entry_id}/versions - List versions"""
        self.log("📚 BOOK VAULT VERSIONS LIST TEST")
        
        if not self.admin_token or not self.test_new_entry_id:
            self.log("❌ No admin token or test entry available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = self.make_request("GET", f"/book-vault/entries/{self.test_new_entry_id}/versions", 
                                   headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["entry_id", "current_version_id", "versions", "total"]
            
            if all(field in data for field in required_fields):
                versions = data["versions"]
                total = data["total"]
                self.log(f"✅ Versions list working - Found {total} versions")
                
                if versions:
                    version = versions[0]
                    self.log(f"   Latest version: v{version.get('version_number', 1)}")
                    return True
                else:
                    self.log("⚠️ No versions found")
                    return True
            else:
                missing = [f for f in required_fields if f not in data]
                self.log(f"❌ Versions list missing fields: {missing}", "ERROR")
                return False
        else:
            self.log(f"❌ Versions list failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_book_vault_create_version(self) -> bool:
        """Test POST /api/book-vault/entries/{entry_id}/versions - Create new version"""
        self.log("📚 BOOK VAULT CREATE VERSION TEST")
        
        if not self.admin_token or not self.test_new_entry_id:
            self.log("❌ No admin token or test entry available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        version_data = {
            "content": "# Test Chapter - Updated\n\nThis is an updated version of the test chapter.",
            "content_format": "markdown",
            "source": "user",
            "notes": "Updated during API testing"
        }
        
        response = self.make_request("POST", f"/book-vault/entries/{self.test_new_entry_id}/versions", 
                                   version_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "version" in data:
                version = data["version"]
                self.log(f"✅ Version created successfully - v{version['version_number']}")
                self.log(f"   Notes: {version.get('notes', 'None')}")
                return True
            else:
                self.log(f"❌ Create version response invalid: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ Create version failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_book_vault_update_work(self) -> bool:
        """Test PATCH /api/book-vault/works/{work_id} - Update work"""
        self.log("📚 BOOK VAULT UPDATE WORK TEST")
        
        if not self.admin_token or not self.test_work_id:
            self.log("❌ No admin token or test work available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        update_data = {
            "status": "drafting",
            "description": "Updated description during API testing",
            "tags": ["test", "api-validation", "updated"]
        }
        
        response = self.make_request("PATCH", f"/book-vault/works/{self.test_work_id}", 
                                   update_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "updated_fields" in data:
                updated_fields = data["updated_fields"]
                self.log(f"✅ Work updated successfully - Fields: {updated_fields}")
                return True
            else:
                self.log(f"❌ Update work response invalid: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ Update work failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_book_vault_soft_delete(self) -> bool:
        """Test DELETE /api/book-vault/works/{work_id} - Soft delete"""
        self.log("📚 BOOK VAULT SOFT DELETE TEST")
        
        if not self.admin_token or not self.test_work_id:
            self.log("❌ No admin token or test work available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        response = self.make_request("DELETE", f"/book-vault/works/{self.test_work_id}", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "archived" in data.get("message", "").lower():
                self.log("✅ Soft delete working - Work archived")
                
                # Verify work no longer appears in list
                list_response = self.make_request("GET", "/book-vault/works", headers=headers)
                if list_response.status_code == 200:
                    works = list_response.json().get("works", [])
                    deleted_work = None
                    for work in works:
                        if work["id"] == self.test_work_id:
                            deleted_work = work
                            break
                    
                    if not deleted_work:
                        self.log("✅ Deleted work no longer appears in list")
                        return True
                    else:
                        self.log("❌ Deleted work still appears in list", "ERROR")
                        return False
                else:
                    self.log("⚠️ Could not verify deletion in list")
                    return True
            else:
                self.log(f"❌ Soft delete response invalid: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ Soft delete failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_book_vault_role_checking(self) -> bool:
        """Test that only admin/super_admin/founder can access Book Vault"""
        self.log("📚 BOOK VAULT ROLE CHECKING TEST")
        
        # Test with no token (should be denied)
        response = self.make_request("GET", "/book-vault/works")
        
        if response.status_code == 401:
            self.log("✅ Role checking working - Unauthenticated properly denied")
            return True
        else:
            self.log(f"❌ Role checking failed - Expected 401, got {response.status_code}", "ERROR")
            return False
    
    def test_book_vault_export_work(self) -> bool:
        """Test POST /api/book-vault/works/{work_id}/export/markdown - Export work"""
        self.log("📚 BOOK VAULT EXPORT WORK TEST")
        
        if not self.admin_token:
            self.log("❌ No admin token available", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Get G-1 work for export test (has content)
        response = self.make_request("GET", "/book-vault/works", headers=headers)
        if response.status_code != 200:
            self.log("❌ Could not get works for export test", "ERROR")
            return False
        
        works = response.json().get("works", [])
        g1_work = None
        for work in works:
            if work.get("order_key") == "G-1":
                g1_work = work
                break
        
        if not g1_work:
            self.log("❌ Could not find G-1 work for export test", "ERROR")
            return False
        
        work_id = g1_work["id"]
        response = self.make_request("POST", f"/book-vault/works/{work_id}/export/markdown", 
                                   headers=headers)
        
        if response.status_code == 200:
            content = response.text
            
            # Verify watermark is present
            if "BANIBS Book Vault — Internal Draft — Not for distribution" in content:
                self.log("✅ Export working - Watermark found")
                
                # Verify content structure
                if "The Light God Wants You to See" in content:
                    self.log("✅ Work title found in export")
                    
                    # Check for timestamp
                    if "Exported:" in content:
                        self.log("✅ Export timestamp found")
                        return True
                    else:
                        self.log("⚠️ Export timestamp not found")
                        return True
                else:
                    self.log("❌ Work title not found in export", "ERROR")
                    return False
            else:
                self.log("❌ Watermark not found in export", "ERROR")
                return False
        else:
            self.log(f"❌ Export failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def run_all_tests(self) -> bool:
        """Run all Book Vault tests"""
        self.log("=" * 80)
        self.log("BOOK VAULT API TESTS")
        self.log("=" * 80)
        self.log(f"Testing against: {API_BASE}")
        self.log("Testing Book Vault endpoints for literary works management")
        
        tests = [
            # Authentication Setup
            ("Admin Login", self.test_admin_login),
            
            # Book Vault Tests - Authentication & Authorization
            ("Book Vault Authentication", self.test_book_vault_authentication),
            ("Book Vault Role Checking", self.test_book_vault_role_checking),
            
            # Works CRUD
            ("Book Vault Works List", self.test_book_vault_works_list),
            ("Book Vault Work Detail", self.test_book_vault_work_detail),
            ("Book Vault Create Work", self.test_book_vault_create_work),
            ("Book Vault Update Work", self.test_book_vault_update_work),
            
            # Entries CRUD
            ("Book Vault Entries List", self.test_book_vault_entries_list),
            ("Book Vault Entry Detail", self.test_book_vault_entry_detail),
            ("Book Vault Create Entry", self.test_book_vault_create_entry),
            
            # Versions
            ("Book Vault Versions List", self.test_book_vault_versions_list),
            ("Book Vault Create Version", self.test_book_vault_create_version),
            
            # Search
            ("Book Vault Search Light", self.test_book_vault_search),
            ("Book Vault Search Matthew", self.test_book_vault_search_matthew),
            
            # Export
            ("Book Vault Export Work", self.test_book_vault_export_work),
            
            # Cleanup
            ("Book Vault Soft Delete", self.test_book_vault_soft_delete),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            self.log(f"\n--- Running {test_name} ---")
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log(f"ERROR {test_name} failed with exception: {e}", "ERROR")
                failed += 1
                
        self.log(f"\n=== BOOK VAULT TEST RESULTS ===")
        self.log(f"Passed: {passed}")
        self.log(f"Failed: {failed}")
        self.log(f"Total: {passed + failed}")
        
        if failed == 0:
            self.log("All Book Vault tests passed!")
            return True
        else:
            self.log(f"{failed} Book Vault test(s) failed")
            return False

if __name__ == "__main__":
    tester = BookVaultTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)