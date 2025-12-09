"""
Test suite for BDII Identity Resolution Service
Tests all identity resolution patterns and threading
"""

import pytest
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.bdii.identity_resolution import IdentityResolutionService
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio


class TestBDIIIdentityResolution:
    """Test BDII identity resolution service"""
    
    @pytest.fixture
    async def db(self):
        """Create test database connection"""
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'test_database')
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        yield db
        client.close()
    
    @pytest.fixture
    async def identity_service(self, db):
        """Create identity service instance"""
        return IdentityResolutionService(db)
    
    @pytest.mark.asyncio
    async def test_resolve_by_uuid(self, identity_service):
        """Test resolving identity by UUID"""
        # Use a known UUID from test database
        test_uuid = "b95996a9-5c8a-4190-a3d6-07e016d46bf0"
        
        user = await identity_service.resolve_identity(test_uuid)
        
        assert user is not None
        assert user['id'] == test_uuid
        assert 'email' in user
        assert 'roles' in user
    
    @pytest.mark.asyncio
    async def test_resolve_by_email(self, identity_service):
        """Test resolving identity by email"""
        test_email = "test@example.com"
        
        user = await identity_service.resolve_identity(test_email)
        
        assert user is not None
        assert user['email'] == test_email
        assert 'id' in user
    
    @pytest.mark.asyncio
    async def test_resolve_by_username(self, identity_service):
        """Test resolving identity by username"""
        # First get a user with a username
        user = await identity_service.resolve_identity("test@example.com")
        if user and user.get('username'):
            username = user['username']
            
            resolved = await identity_service.resolve_identity(username)
            
            assert resolved is not None
            assert resolved['id'] == user['id']
    
    @pytest.mark.asyncio
    async def test_get_contributor_identity(self, identity_service):
        """Test getting contributor identity"""
        # Use a known contributor UUID
        test_uuid = "b95996a9-5c8a-4190-a3d6-07e016d46bf0"
        
        contributor = await identity_service.get_contributor_identity(test_uuid)
        
        assert contributor is not None
        assert contributor['bglis_id'] == test_uuid
        assert contributor['is_contributor'] == True
        assert 'organization' in contributor
        assert 'total_submissions' in contributor
    
    @pytest.mark.asyncio
    async def test_get_peoples_identity(self, identity_service):
        """Test getting peoples/social identity"""
        test_uuid = "b95996a9-5c8a-4190-a3d6-07e016d46bf0"
        
        peoples = await identity_service.get_peoples_identity(test_uuid)
        
        assert peoples is not None
        assert peoples['bglis_id'] == test_uuid
        assert 'username' in peoples
        assert 'name' in peoples
    
    @pytest.mark.asyncio
    async def test_get_full_identity(self, identity_service):
        """Test getting complete threaded identity"""
        test_uuid = "b95996a9-5c8a-4190-a3d6-07e016d46bf0"
        
        full_identity = await identity_service.get_full_identity(test_uuid)
        
        assert full_identity is not None
        assert 'bglis' in full_identity
        assert 'peoples' in full_identity
        assert 'contributor' in full_identity
        assert 'seller' in full_identity
        assert 'admin' in full_identity
        
        # Check BGLIS core
        assert full_identity['bglis']['id'] == test_uuid
        
        # Check Peoples
        assert full_identity['peoples']['bglis_id'] == test_uuid
        
        # Check Contributor
        assert full_identity['contributor']['bglis_id'] == test_uuid
    
    @pytest.mark.asyncio
    async def test_check_role(self, identity_service):
        """Test role checking"""
        test_uuid = "b95996a9-5c8a-4190-a3d6-07e016d46bf0"
        
        # Check contributor role
        is_contributor = await identity_service.check_role(test_uuid, "contributor")
        assert is_contributor == True
        
        # Check non-existent role
        is_seller = await identity_service.check_role(test_uuid, "seller")
        assert is_seller == False
    
    @pytest.mark.asyncio
    async def test_resolve_invalid_identifier(self, identity_service):
        """Test resolving invalid identifier"""
        user = await identity_service.resolve_identity("invalid@#$%identifier")
        
        assert user is None
    
    @pytest.mark.asyncio
    async def test_resolve_non_existent_user(self, identity_service):
        """Test resolving non-existent user"""
        user = await identity_service.resolve_identity("nonexistent@example.com")
        
        assert user is None


# Manual test runner (for running outside pytest)
async def run_manual_tests():
    """Run tests manually without pytest"""
    print("Starting BDII Identity Resolution Service Tests\n")
    
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    service = IdentityResolutionService(db)
    
    # Test 1: Resolve by UUID
    print("Test 1: Resolve by UUID")
    test_uuid = "b95996a9-5c8a-4190-a3d6-07e016d46bf0"
    user = await service.resolve_identity(test_uuid)
    print(f"  Result: {'✅ PASS' if user and user['id'] == test_uuid else '❌ FAIL'}")
    
    # Test 2: Resolve by email
    print("\nTest 2: Resolve by email")
    test_email = "test@example.com"
    user = await service.resolve_identity(test_email)
    print(f"  Result: {'✅ PASS' if user and user['email'] == test_email else '❌ FAIL'}")
    
    # Test 3: Get contributor identity
    print("\nTest 3: Get contributor identity")
    contributor = await service.get_contributor_identity(test_uuid)
    print(f"  Result: {'✅ PASS' if contributor and contributor['is_contributor'] else '❌ FAIL'}")
    if contributor:
        print(f"  Organization: {contributor.get('organization')}")
        print(f"  Total submissions: {contributor.get('total_submissions')}")
    
    # Test 4: Get peoples identity
    print("\nTest 4: Get peoples identity")
    peoples = await service.get_peoples_identity(test_uuid)
    print(f"  Result: {'✅ PASS' if peoples and peoples['bglis_id'] == test_uuid else '❌ FAIL'}")
    if peoples:
        print(f"  Username: {peoples.get('username')}")
        print(f"  Name: {peoples.get('name')}")
    
    # Test 5: Get full identity
    print("\nTest 5: Get full threaded identity")
    full = await service.get_full_identity(test_uuid)
    print(f"  Result: {'✅ PASS' if full and all(k in full for k in ['bglis', 'peoples', 'contributor']) else '❌ FAIL'}")
    if full:
        print(f"  BGLIS ID: {full['bglis']['id']}")
        print(f"  Roles: {full['bglis']['roles']}")
        print(f"  Is Contributor: {full['contributor']['is_contributor']}")
    
    # Test 6: Check role
    print("\nTest 6: Check role")
    is_contributor = await service.check_role(test_uuid, "contributor")
    print(f"  Has contributor role: {'✅ PASS' if is_contributor else '❌ FAIL'}")
    
    client.close()
    print("\n✅ All manual tests completed")


if __name__ == "__main__":
    asyncio.run(run_manual_tests())
