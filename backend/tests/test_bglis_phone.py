"""
BGLIS v1.0 - Phone Verification API Tests

Tests for voluntary phone verification system:
- POST /api/auth/send-otp (purpose='upgrade')
- POST /api/auth/verify-otp (bypass code 111111)
- POST /api/bglis/link-phone
- PATCH /api/bglis/remove-phone
- GET /api/bglis/status
- GET /api/bglis/check/:user_id (public)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "raymondneely@banibs.com"
TEST_PASSWORD = "BanibsAdmin2026!"
BYPASS_OTP = "111111"
TEST_PHONE = "+15551234567"


class TestBGLISPhoneAuth:
    """Test authentication endpoints for phone verification"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_01_login_and_get_token(self):
        """Login to get auth token for subsequent tests"""
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "Missing access_token in response"
        # Store token for other tests
        pytest.auth_token = data["access_token"]
        pytest.user_id = data.get("user", {}).get("id")
        print(f"Login successful, user_id: {pytest.user_id}")
    
    def test_02_send_otp_upgrade(self):
        """Test sending OTP for phone upgrade purpose"""
        response = self.session.post(
            f"{BASE_URL}/api/auth/send-otp",
            json={"phone_number": TEST_PHONE, "purpose": "upgrade"}
        )
        assert response.status_code == 200, f"Send OTP failed: {response.text}"
        data = response.json()
        assert data.get("success") is True
        assert data.get("phone_number") == TEST_PHONE
        assert "expires_in_seconds" in data
        print(f"OTP sent to {TEST_PHONE}, expires in {data['expires_in_seconds']}s")
    
    def test_03_send_otp_invalid_phone(self):
        """Test sending OTP with invalid phone number"""
        response = self.session.post(
            f"{BASE_URL}/api/auth/send-otp",
            json={"phone_number": "invalid", "purpose": "upgrade"}
        )
        # Should return 400 for invalid phone format
        assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
    
    def test_04_verify_otp_bypass_code(self):
        """Test verifying OTP with bypass code 111111"""
        # First send OTP
        send_response = self.session.post(
            f"{BASE_URL}/api/auth/send-otp",
            json={"phone_number": TEST_PHONE, "purpose": "upgrade"}
        )
        assert send_response.status_code == 200, f"Send OTP failed: {send_response.text}"
        
        # Verify with bypass code
        response = self.session.post(
            f"{BASE_URL}/api/auth/verify-otp",
            json={
                "phone_number": TEST_PHONE,
                "purpose": "upgrade",
                "code": BYPASS_OTP
            }
        )
        assert response.status_code == 200, f"Verify OTP failed: {response.text}"
        data = response.json()
        assert data.get("success") is True
        print("OTP verification with bypass code successful")
    
    def test_05_verify_otp_wrong_code(self):
        """Test verifying OTP with wrong code"""
        # First send OTP
        send_response = self.session.post(
            f"{BASE_URL}/api/auth/send-otp",
            json={"phone_number": TEST_PHONE, "purpose": "upgrade"}
        )
        assert send_response.status_code == 200
        
        # Verify with wrong code
        response = self.session.post(
            f"{BASE_URL}/api/auth/verify-otp",
            json={
                "phone_number": TEST_PHONE,
                "purpose": "upgrade",
                "code": "000000"
            }
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("Wrong OTP code correctly rejected")


class TestBGLISLinkPhone:
    """Test phone linking endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup with auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login first to get token
        login_resp = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if login_resp.status_code == 200:
            self.token = login_resp.json().get("access_token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
            self.user_id = login_resp.json().get("user", {}).get("id")
        else:
            pytest.skip("Login failed - skipping authenticated tests")
    
    def test_06_link_phone_without_auth(self):
        """Test link-phone endpoint without authorization"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        response = session.post(
            f"{BASE_URL}/api/bglis/link-phone",
            json={"phone_number": TEST_PHONE}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("Link phone correctly requires authentication")
    
    def test_07_link_phone_with_auth(self):
        """Test link-phone endpoint with valid auth and OTP"""
        # First send and verify OTP
        self.session.post(
            f"{BASE_URL}/api/auth/send-otp",
            json={"phone_number": TEST_PHONE, "purpose": "upgrade"}
        )
        self.session.post(
            f"{BASE_URL}/api/auth/verify-otp",
            json={"phone_number": TEST_PHONE, "purpose": "upgrade", "code": BYPASS_OTP}
        )
        
        # Then link phone
        response = self.session.post(
            f"{BASE_URL}/api/bglis/link-phone",
            json={"phone_number": TEST_PHONE}
        )
        assert response.status_code == 200, f"Link phone failed: {response.text}"
        data = response.json()
        assert data.get("success") is True
        assert "phone_masked" in data
        print(f"Phone linked successfully, masked: {data.get('phone_masked')}")
    
    def test_08_get_phone_status(self):
        """Test GET /api/bglis/status endpoint"""
        response = self.session.get(f"{BASE_URL}/api/bglis/status")
        assert response.status_code == 200, f"Get status failed: {response.text}"
        data = response.json()
        assert "is_phone_verified" in data
        print(f"Phone status: verified={data.get('is_phone_verified')}, masked={data.get('phone_masked')}")
    
    def test_09_check_user_verified_public(self):
        """Test GET /api/bglis/check/:user_id public endpoint"""
        # Use current user ID
        response = self.session.get(f"{BASE_URL}/api/bglis/check/{self.user_id}")
        assert response.status_code == 200, f"Check user failed: {response.text}"
        data = response.json()
        assert "is_phone_verified" in data
        print(f"Public check for user {self.user_id}: verified={data.get('is_phone_verified')}")
    
    def test_10_check_nonexistent_user(self):
        """Test check endpoint with non-existent user"""
        response = self.session.get(f"{BASE_URL}/api/bglis/check/nonexistent-user-123")
        assert response.status_code == 200  # Should return is_phone_verified: false
        data = response.json()
        assert data.get("is_phone_verified") is False
        print("Non-existent user check returns is_phone_verified=false")


class TestBGLISRemovePhone:
    """Test phone removal endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup with auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login first to get token
        login_resp = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if login_resp.status_code == 200:
            self.token = login_resp.json().get("access_token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            pytest.skip("Login failed - skipping authenticated tests")
    
    def test_11_remove_phone_without_auth(self):
        """Test remove-phone endpoint without authorization"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        response = session.patch(f"{BASE_URL}/api/bglis/remove-phone")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("Remove phone correctly requires authentication")
    
    def test_12_remove_phone_with_auth(self):
        """Test remove-phone endpoint with valid auth"""
        response = self.session.patch(f"{BASE_URL}/api/bglis/remove-phone")
        assert response.status_code == 200, f"Remove phone failed: {response.text}"
        data = response.json()
        assert data.get("success") is True
        assert data.get("message") == "Phone verification removed"
        print("Phone verification removed successfully")
    
    def test_13_verify_phone_removed(self):
        """Verify phone is removed via status endpoint"""
        response = self.session.get(f"{BASE_URL}/api/bglis/status")
        assert response.status_code == 200
        data = response.json()
        assert data.get("is_phone_verified") is False
        assert data.get("phone_masked") is None
        print("Phone verification status correctly shows as removed")


class TestBGLISFullFlow:
    """Test complete phone verification flow"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup with auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login first to get token
        login_resp = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if login_resp.status_code == 200:
            self.token = login_resp.json().get("access_token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
            self.user_id = login_resp.json().get("user", {}).get("id")
        else:
            pytest.skip("Login failed - skipping authenticated tests")
    
    def test_14_full_verification_flow(self):
        """Test complete flow: send OTP -> verify -> link -> check -> remove"""
        
        # Step 1: Send OTP
        send_resp = self.session.post(
            f"{BASE_URL}/api/auth/send-otp",
            json={"phone_number": TEST_PHONE, "purpose": "upgrade"}
        )
        assert send_resp.status_code == 200, f"Send OTP failed: {send_resp.text}"
        print("Step 1: OTP sent")
        
        # Step 2: Verify OTP with bypass code
        verify_resp = self.session.post(
            f"{BASE_URL}/api/auth/verify-otp",
            json={"phone_number": TEST_PHONE, "purpose": "upgrade", "code": BYPASS_OTP}
        )
        assert verify_resp.status_code == 200, f"Verify OTP failed: {verify_resp.text}"
        print("Step 2: OTP verified")
        
        # Step 3: Link phone to account
        link_resp = self.session.post(
            f"{BASE_URL}/api/bglis/link-phone",
            json={"phone_number": TEST_PHONE}
        )
        assert link_resp.status_code == 200, f"Link phone failed: {link_resp.text}"
        print("Step 3: Phone linked")
        
        # Step 4: Check status - should be verified
        status_resp = self.session.get(f"{BASE_URL}/api/bglis/status")
        assert status_resp.status_code == 200
        status_data = status_resp.json()
        assert status_data.get("is_phone_verified") is True
        print(f"Step 4: Status verified, masked phone: {status_data.get('phone_masked')}")
        
        # Step 5: Public check should show verified
        check_resp = self.session.get(f"{BASE_URL}/api/bglis/check/{self.user_id}")
        assert check_resp.status_code == 200
        check_data = check_resp.json()
        assert check_data.get("is_phone_verified") is True
        print("Step 5: Public check shows verified")
        
        # Step 6: Remove phone
        remove_resp = self.session.patch(f"{BASE_URL}/api/bglis/remove-phone")
        assert remove_resp.status_code == 200
        print("Step 6: Phone removed")
        
        # Step 7: Verify removal
        final_status = self.session.get(f"{BASE_URL}/api/bglis/status").json()
        assert final_status.get("is_phone_verified") is False
        print("Step 7: Status shows phone removed - FULL FLOW COMPLETE")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
