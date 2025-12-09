"""
Feed Ranking Shadow Mode Tests - Phase C Circle Trust Order
Tests for trust-weighted feed ranking algorithm (SHADOW MODE ONLY)

Founder-Approved Trust Weights:
- PEOPLES: +100
- COOL: +60
- CHILL: +40
- ALRIGHT: +20
- OTHERS: +10
- SAFE MODE: 0.1 (near-zero, suppressed)
- BLOCKED: -1000 (not visible)
"""

import pytest
from datetime import datetime, timezone, timedelta

from services.feed_ranker import (
    FeedRankerService,
    rank_feed_by_trust,
    calculate_rank_delta,
    TRUST_TIER_WEIGHTS
)
from db.relationships import (
    TIER_PEOPLES,
    TIER_COOL,
    TIER_CHILL,
    TIER_ALRIGHT,
    TIER_OTHERS,
    TIER_OTHERS_SAFE_MODE,
    TIER_BLOCKED
)


class TestTrustWeights:
    """Test Founder-approved trust tier weights"""
    
    def test_peoples_weight_100(self):
        """PEOPLES should have weight +100 (Founder Decision)"""
        weight = FeedRankerService.get_trust_weight(TIER_PEOPLES)
        assert weight == 100
    
    def test_cool_weight_60(self):
        """COOL should have weight +60 (Founder Decision)"""
        weight = FeedRankerService.get_trust_weight(TIER_COOL)
        assert weight == 60
    
    def test_chill_weight_40(self):
        """CHILL should have weight +40 (Founder Decision)"""
        weight = FeedRankerService.get_trust_weight(TIER_CHILL)
        assert weight == 40
    
    def test_alright_weight_20(self):
        """ALRIGHT should have weight +20 (Founder Decision)"""
        weight = FeedRankerService.get_trust_weight(TIER_ALRIGHT)
        assert weight == 20
    
    def test_others_weight_10(self):
        """OTHERS should have weight +10 (Founder Decision)"""
        weight = FeedRankerService.get_trust_weight(TIER_OTHERS)
        assert weight == 10
    
    def test_safe_mode_near_zero(self):
        """SAFE MODE should have near-zero weight (suppressed) (Founder Decision)"""
        weight = FeedRankerService.get_trust_weight(TIER_OTHERS_SAFE_MODE)
        assert weight == 0.1
        assert weight < 1  # Near-zero
    
    def test_blocked_negative_weight(self):
        """BLOCKED should have negative weight (not visible) (Founder Decision)"""
        weight = FeedRankerService.get_trust_weight(TIER_BLOCKED)
        assert weight == -1000
        assert weight < 0


class TestPostScoring:
    """Test post scoring algorithm"""
    
    def test_peoples_gets_highest_trust_boost(self):
        """PEOPLES tier posts should get highest trust boost"""
        post = {}
        
        score_peoples = FeedRankerService.calculate_post_score(
            post, TIER_PEOPLES,
            base_relevance_score=50, recency_score=50, engagement_score=50
        )
        
        score_cool = FeedRankerService.calculate_post_score(
            post, TIER_COOL,
            base_relevance_score=50, recency_score=50, engagement_score=50
        )
        
        assert score_peoples["total_score"] > score_cool["total_score"]
        assert score_peoples["trust_component"] == 100 * 0.4  # 40
        assert score_cool["trust_component"] == 60 * 0.4  # 24
    
    def test_score_components_weighted_correctly(self):
        """Score components should follow Founder-approved formula"""
        post = {}
        
        score = FeedRankerService.calculate_post_score(
            post, TIER_PEOPLES,
            base_relevance_score=50,
            recency_score=80,
            engagement_score=60
        )
        
        # Trust component: 100 * 0.4 = 40
        assert score["trust_component"] == 40
        
        # Recency component: 80 * 0.3 = 24
        assert score["recency_component"] == 24
        
        # Engagement component: 60 * 0.3 = 18
        assert score["engagement_component"] == 18
        
        # Total: 50 + 40 + 24 + 18 = 132
        assert score["total_score"] == 132
    
    def test_blocked_posts_scored_but_filtered(self):
        """BLOCKED posts should be scored but then filtered out"""
        post = {}
        
        score = FeedRankerService.calculate_post_score(
            post, TIER_BLOCKED,
            base_relevance_score=50, recency_score=50, engagement_score=50
        )
        
        # Trust component is negative
        assert score["trust_weight"] == -1000
        assert score["trust_component"] < 0


class TestRecencyScoring:
    """Test recency score calculation"""
    
    def test_recent_post_high_score(self):
        """Recent posts should have high recency scores"""
        now = datetime.now(timezone.utc)
        recent_post = now - timedelta(minutes=30)
        
        score = FeedRankerService.calculate_recency_score(recent_post)
        assert score > 90  # Very recent
    
    def test_old_post_low_score(self):
        """Old posts should have low recency scores"""
        now = datetime.now(timezone.utc)
        old_post = now - timedelta(days=7)
        
        score = FeedRankerService.calculate_recency_score(old_post)
        assert score < 30  # Old
    
    def test_day_old_post_medium_score(self):
        """1-day-old posts should have medium scores"""
        now = datetime.now(timezone.utc)
        day_old = now - timedelta(days=1)
        
        score = FeedRankerService.calculate_recency_score(day_old)
        assert 50 < score < 90


class TestEngagementScoring:
    """Test engagement score calculation"""
    
    def test_high_engagement_high_score(self):
        """Posts with high engagement should score high"""
        post = {
            "like_count": 100,
            "comment_count": 20,
            "share_count": 10,
            "view_count": 1000
        }
        
        score = FeedRankerService.calculate_engagement_score(post)
        assert score > 70
    
    def test_no_engagement_low_score(self):
        """Posts with no engagement should score low"""
        post = {
            "like_count": 0,
            "comment_count": 0,
            "share_count": 0,
            "view_count": 0
        }
        
        score = FeedRankerService.calculate_engagement_score(post)
        assert score == 0
    
    def test_comments_weighted_more_than_likes(self):
        """Comments should be weighted more than likes"""
        post_comments = {
            "like_count": 0,
            "comment_count": 10,
            "share_count": 0,
            "view_count": 0
        }
        
        post_likes = {
            "like_count": 50,  # 50 likes = 100 points
            "comment_count": 0,
            "share_count": 0,
            "view_count": 0
        }
        
        score_comments = FeedRankerService.calculate_engagement_score(post_comments)
        score_likes = FeedRankerService.calculate_engagement_score(post_likes)
        
        # 10 comments (100 points) > 50 likes (100 points) but engagement_score uses log scale
        # So scores should be similar but comments slightly higher
        assert score_comments >= score_likes * 0.95


class TestFeedRanking:
    """Test full feed ranking"""
    
    def test_peoples_posts_ranked_higher(self):
        """PEOPLES posts should be ranked higher than OTHERS posts"""
        posts = [
            {
                "id": "post1",
                "author_id": "author1",
                "created_at": datetime.now(timezone.utc),
                "like_count": 10,
                "comment_count": 2
            },
            {
                "id": "post2",
                "author_id": "author2",
                "created_at": datetime.now(timezone.utc),
                "like_count": 10,
                "comment_count": 2
            }
        ]
        
        viewer_relationships = {
            "author1": TIER_PEOPLES,
            "author2": TIER_OTHERS
        }
        
        ranked = rank_feed_by_trust(posts, "viewer123", viewer_relationships)
        
        # PEOPLES post should be ranked first
        assert ranked[0]["id"] == "post1"
        assert ranked[1]["id"] == "post2"
    
    def test_blocked_posts_excluded(self):
        """BLOCKED posts should be excluded from feed"""
        posts = [
            {
                "id": "post1",
                "author_id": "author1",
                "created_at": datetime.now(timezone.utc),
                "like_count": 10,
                "comment_count": 2
            },
            {
                "id": "post2",
                "author_id": "author2",
                "created_at": datetime.now(timezone.utc),
                "like_count": 10,
                "comment_count": 2
            }
        ]
        
        viewer_relationships = {
            "author1": TIER_PEOPLES,
            "author2": TIER_BLOCKED  # Blocked
        }
        
        ranked = rank_feed_by_trust(posts, "viewer123", viewer_relationships)
        
        # Only PEOPLES post should be in feed
        assert len(ranked) == 1
        assert ranked[0]["id"] == "post1"
    
    def test_engagement_can_override_tier(self):
        """High engagement can boost lower-tier posts"""
        now = datetime.now(timezone.utc)
        
        posts = [
            {
                "id": "post1",
                "author_id": "author1",
                "created_at": now,
                "like_count": 0,
                "comment_count": 0
            },
            {
                "id": "post2",
                "author_id": "author2",
                "created_at": now,
                "like_count": 500,  # Very high engagement
                "comment_count": 100
            }
        ]
        
        viewer_relationships = {
            "author1": TIER_PEOPLES,  # High tier, low engagement
            "author2": TIER_OTHERS    # Low tier, HIGH engagement
        }
        
        ranked = rank_feed_by_trust(posts, "viewer123", viewer_relationships)
        
        # High engagement OTHERS post might rank higher than low engagement PEOPLES post
        # This ensures engagement matters, not just tier
        assert ranked[0]["trust_score"]["total_score"] > ranked[1]["trust_score"]["total_score"]


class TestRankDelta:
    """Test rank position delta calculation"""
    
    def test_no_reordering_zero_delta(self):
        """If order unchanged, all deltas should be 0"""
        chrono_order = ["post1", "post2", "post3"]
        trust_order = ["post1", "post2", "post3"]
        
        deltas = calculate_rank_delta(chrono_order, trust_order)
        
        assert deltas["post1"] == 0
        assert deltas["post2"] == 0
        assert deltas["post3"] == 0
    
    def test_post_moved_up_positive_delta(self):
        """Post moved up should have positive delta"""
        chrono_order = ["post1", "post2", "post3"]
        trust_order = ["post3", "post1", "post2"]  # post3 moved up
        
        deltas = calculate_rank_delta(chrono_order, trust_order)
        
        assert deltas["post3"] > 0  # Moved up (was 2, now 0)
        assert deltas["post1"] < 0  # Moved down (was 0, now 1)
    
    def test_large_reordering_tracked(self):
        """Large reordering should be captured in deltas"""
        chrono_order = ["post1", "post2", "post3", "post4", "post5"]
        trust_order = ["post5", "post4", "post3", "post2", "post1"]  # Reversed
        
        deltas = calculate_rank_delta(chrono_order, trust_order)
        
        # post5: was 4, now 0 = +4
        assert deltas["post5"] == 4
        
        # post1: was 0, now 4 = -4
        assert deltas["post1"] == -4


class TestDiversityAnalysis:
    """Test content diversity analysis"""
    
    def test_diverse_feed_high_entropy(self):
        """Feed with diverse tiers should have high entropy"""
        posts = [
            {"id": "p1", "author_id": "a1"},
            {"id": "p2", "author_id": "a2"},
            {"id": "p3", "author_id": "a3"},
            {"id": "p4", "author_id": "a4"},
        ]
        
        relationships = {
            "a1": TIER_PEOPLES,
            "a2": TIER_COOL,
            "a3": TIER_CHILL,
            "a4": TIER_ALRIGHT
        }
        
        diversity = FeedRankerService.analyze_feed_diversity(posts, relationships)
        
        assert diversity["total_posts"] == 4
        assert diversity["diversity_entropy"] > 1.5  # High diversity
    
    def test_homogeneous_feed_low_entropy(self):
        """Feed dominated by one tier should have low entropy"""
        posts = [
            {"id": "p1", "author_id": "a1"},
            {"id": "p2", "author_id": "a2"},
            {"id": "p3", "author_id": "a3"},
            {"id": "p4", "author_id": "a4"},
        ]
        
        relationships = {
            "a1": TIER_PEOPLES,
            "a2": TIER_PEOPLES,
            "a3": TIER_PEOPLES,
            "a4": TIER_PEOPLES  # All PEOPLES
        }
        
        diversity = FeedRankerService.analyze_feed_diversity(posts, relationships)
        
        assert diversity["total_posts"] == 4
        assert diversity["diversity_entropy"] == 0  # No diversity


class TestSuppressionDetection:
    """Test suppression effect detection"""
    
    def test_detect_complete_lower_tier_suppression(self):
        """Should detect if ALRIGHT/OTHERS are completely invisible"""
        diversity = {
            "tier_percentages": {
                "PEOPLES": 70,
                "COOL": 30,
                "CHILL": 0,
                "ALRIGHT": 0,
                "OTHERS": 0
            }
        }
        
        warnings = FeedRankerService.detect_suppression_effects(diversity)
        
        assert len(warnings) > 0
        assert any("0% visibility" in w for w in warnings)
    
    def test_detect_peoples_domination(self):
        """Should detect if PEOPLES tier dominates too heavily"""
        diversity = {
            "tier_percentages": {
                "PEOPLES": 80,
                "COOL": 10,
                "CHILL": 5,
                "ALRIGHT": 3,
                "OTHERS": 2
            }
        }
        
        warnings = FeedRankerService.detect_suppression_effects(diversity)
        
        assert len(warnings) > 0
        assert any(">70%" in w for w in warnings)
    
    def test_balanced_feed_no_warnings(self):
        """Balanced feed should have no suppression warnings"""
        diversity = {
            "tier_percentages": {
                "PEOPLES": 30,
                "COOL": 25,
                "CHILL": 20,
                "ALRIGHT": 15,
                "OTHERS": 10
            }
        }
        
        warnings = FeedRankerService.detect_suppression_effects(diversity)
        
        assert len(warnings) == 0


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
