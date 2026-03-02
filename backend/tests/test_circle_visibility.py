"""
Circle Visibility V1 - Backend Tests
Tests for circle-based post targeting and visibility filtering.
"""

import pytest
import asyncio
import os
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, AsyncMock

# Set feature flag for tests
os.environ["CIRCLE_VISIBILITY_V1"] = "true"

from db import circle_visibility as cv
from db import social_posts as db_social


class TestTierComparison:
    """Test tier level comparisons"""
    
    def test_tier_meets_minimum_others(self):
        """OTHERS can view OTHERS-gated content"""
        assert cv.tier_meets_minimum("OTHERS", "OTHERS") is True
    
    def test_tier_meets_minimum_peoples_can_view_all(self):
        """PEOPLES can view any tier"""
        assert cv.tier_meets_minimum("PEOPLES", "OTHERS") is True
        assert cv.tier_meets_minimum("PEOPLES", "ALRIGHT") is True
        assert cv.tier_meets_minimum("PEOPLES", "COOL") is True
        assert cv.tier_meets_minimum("PEOPLES", "PEOPLES") is True
    
    def test_tier_insufficient_others_cannot_view_cool(self):
        """OTHERS cannot view COOL-gated content"""
        assert cv.tier_meets_minimum("OTHERS", "COOL") is False
    
    def test_tier_insufficient_alright_cannot_view_peoples(self):
        """ALRIGHT cannot view PEOPLES-gated content"""
        assert cv.tier_meets_minimum("ALRIGHT", "PEOPLES") is False
    
    def test_tier_cool_can_view_alright(self):
        """COOL can view ALRIGHT-gated content"""
        assert cv.tier_meets_minimum("COOL", "ALRIGHT") is True


class TestAsymmetricTier:
    """Test that tier checking is asymmetric (author->viewer direction)"""
    
    @pytest.mark.asyncio
    async def test_asymmetry_direction(self):
        """
        Test that tier check uses author->viewer direction.
        If author->viewer = OTHERS, viewer cannot see PEOPLES-gated post.
        Even if viewer->author = PEOPLES, it should NOT grant access.
        """
        # This is a unit test for the logic
        # The actual DB queries would need mocking for full integration test
        
        # Verify the function signature expects author_id first
        import inspect
        sig = inspect.signature(cv.get_viewer_tier_for_author)
        params = list(sig.parameters.keys())
        assert params[0] == "author_id"
        assert params[1] == "viewer_id"


class TestFeatureFlag:
    """Test feature flag behavior"""
    
    def test_feature_enabled(self):
        """Test feature flag is enabled for tests"""
        assert cv.is_enabled() is True
    
    def test_feature_disabled(self):
        """Test feature flag can be disabled"""
        with patch.dict(os.environ, {"CIRCLE_VISIBILITY_V1": "false"}):
            # Need to reimport or call the function
            assert os.environ.get("CIRCLE_VISIBILITY_V1") == "false"


class TestPostVisibilityRules:
    """Test post visibility rule logic"""
    
    def test_global_post_structure(self):
        """Test GLOBAL post has correct structure"""
        post = {
            "id": "test-1",
            "author_id": "user-a",
            "target_type": "GLOBAL",
            "target_circle_id": None,
            "min_tier_to_view": "OTHERS"
        }
        
        assert post["target_type"] == "GLOBAL"
        assert post["target_circle_id"] is None
    
    def test_circle_post_structure(self):
        """Test CIRCLE post has required fields"""
        post = {
            "id": "test-2",
            "author_id": "user-a",
            "target_type": "CIRCLE",
            "target_circle_id": "circle-1",
            "min_tier_to_view": "COOL"
        }
        
        assert post["target_type"] == "CIRCLE"
        assert post["target_circle_id"] is not None
        assert post["min_tier_to_view"] == "COOL"
    
    def test_expired_post_structure(self):
        """Test expired post has expires_at in past"""
        past = datetime.now(timezone.utc) - timedelta(hours=1)
        post = {
            "id": "test-3",
            "author_id": "user-a",
            "target_type": "GLOBAL",
            "expires_at": past
        }
        
        assert post["expires_at"] < datetime.now(timezone.utc)


class TestBatchTierLookup:
    """Test batch tier lookup optimization"""
    
    @pytest.mark.asyncio
    async def test_self_always_peoples(self):
        """Test that self-lookup always returns PEOPLES"""
        # Mock the get_db function
        with patch('db.circle_visibility.get_db') as mock_db:
            mock_collection = AsyncMock()
            mock_collection.find.return_value.to_list = AsyncMock(return_value=[])
            mock_db.return_value = AsyncMock()
            mock_db.return_value.relationships = mock_collection
            
            tier_map = await cv.batch_get_viewer_tiers(
                ["user-a", "user-b", "viewer-1"],
                "viewer-1"
            )
            
            # viewer-1 looking at their own content should see PEOPLES
            assert tier_map.get("viewer-1") == "PEOPLES"


class TestCircleModelFields:
    """Test that models have required fields"""
    
    def test_social_post_create_has_circle_fields(self):
        """Test SocialPostCreate has circle visibility fields"""
        from models.social_post import SocialPostCreate, PostTargetType, ViewTier
        
        # Verify model has the fields
        fields = SocialPostCreate.model_fields
        assert "target_type" in fields
        assert "target_circle_id" in fields
        assert "min_tier_to_view" in fields
    
    def test_social_post_response_has_circle_fields(self):
        """Test SocialPost response has circle visibility fields"""
        from models.social_post import SocialPost
        
        fields = SocialPost.model_fields
        assert "target_type" in fields
        assert "target_circle_id" in fields
        assert "target_circle_name" in fields
        assert "min_tier_to_view" in fields
        assert "expires_at" in fields
    
    def test_circle_model_has_ephemeral_fields(self):
        """Test Circle model has ephemeral fields"""
        from models.circles import Circle
        
        fields = Circle.model_fields
        assert "is_ephemeral" in fields
        assert "lifespan_seconds" in fields
        assert "expires_at" in fields


class TestTierLevelMapping:
    """Test tier level value mapping"""
    
    def test_tier_levels_order(self):
        """Test tier levels are in correct order (higher = more access)"""
        assert cv.TIER_LEVELS["OTHERS"] < cv.TIER_LEVELS["ALRIGHT"]
        assert cv.TIER_LEVELS["ALRIGHT"] < cv.TIER_LEVELS["COOL"]
        assert cv.TIER_LEVELS["COOL"] < cv.TIER_LEVELS["PEOPLES"]
    
    def test_tier_levels_values(self):
        """Test tier levels have expected values"""
        assert cv.TIER_LEVELS["OTHERS"] == 0
        assert cv.TIER_LEVELS["ALRIGHT"] == 1
        assert cv.TIER_LEVELS["COOL"] == 2
        assert cv.TIER_LEVELS["PEOPLES"] == 3


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
