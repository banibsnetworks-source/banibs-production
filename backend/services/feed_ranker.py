"""
Feed Ranker Service - Phase C Circle Trust Order
Implements trust-weighted feed ranking algorithm

SHADOW MODE ONLY - No user-facing changes
Runs in parallel to collect data for minimum 2 weeks

Founder-Approved Trust Weights:
- PEOPLES: +100
- COOL: +60
- CHILL: +40
- ALRIGHT: +20
- OTHERS: +10
- SAFE MODE: Near-zero (visibility suppressed)
- BLOCKED: Not visible (excluded)
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)


# Founder-Approved Trust Tier Weights
TRUST_TIER_WEIGHTS = {
    "PEOPLES": 100,
    "COOL": 60,
    "CHILL": 40,
    "ALRIGHT": 20,
    "OTHERS": 10,
    "OTHERS_SAFE_MODE": 0.1,  # Near-zero (visibility suppressed)
    "BLOCKED": -1000,  # Not visible (will be filtered out)
}


class FeedRankerService:
    """Service for trust-weighted feed ranking (SHADOW MODE)"""
    
    @staticmethod
    def get_trust_weight(tier: str) -> float:
        """
        Get trust weight for a tier.
        
        Founder-approved weights for baseline shadow mode testing.
        
        Args:
            tier: Trust tier
        
        Returns:
            Weight value (higher = higher priority in feed)
        """
        return TRUST_TIER_WEIGHTS.get(tier, TRUST_TIER_WEIGHTS["OTHERS"])
    
    @staticmethod
    def calculate_post_score(
        post: Dict[str, Any],
        viewer_tier: str,
        base_relevance_score: float = 50.0,
        recency_score: float = 30.0,
        engagement_score: float = 20.0
    ) -> Dict[str, Any]:
        """
        Calculate trust-weighted score for a post.
        
        Scoring formula (Founder-approved baseline):
        post_score = (
            base_relevance_score +
            (trust_weight * 0.4) +
            (recency_score * 0.3) +
            (engagement_score * 0.3)
        )
        
        Args:
            post: Post document with metadata
            viewer_tier: Trust tier between viewer and post author
            base_relevance_score: Base relevance (0-100)
            recency_score: Recency score (0-100)
            engagement_score: Engagement score (0-100)
        
        Returns:
            Dictionary with score breakdown and total
        """
        # Get trust weight
        trust_weight = FeedRankerService.get_trust_weight(viewer_tier)
        
        # Calculate weighted components
        trust_component = trust_weight * 0.4
        recency_component = recency_score * 0.3
        engagement_component = engagement_score * 0.3
        
        # Total score
        total_score = (
            base_relevance_score +
            trust_component +
            recency_component +
            engagement_component
        )
        
        return {
            "total_score": total_score,
            "trust_weight": trust_weight,
            "trust_component": trust_component,
            "recency_component": recency_component,
            "engagement_component": engagement_component,
            "base_relevance_score": base_relevance_score,
            "viewer_tier": viewer_tier
        }
    
    @staticmethod
    def rank_feed_by_trust(
        posts: List[Dict[str, Any]],
        viewer_id: str,
        viewer_relationships: Dict[str, str]
    ) -> List[Dict[str, Any]]:
        """
        Rank feed posts by trust-weighted scoring.
        
        SHADOW MODE: This does NOT modify the actual feed order.
        Used only for comparison logging.
        
        Args:
            posts: List of post documents (in chronological order)
            viewer_id: ID of viewing user
            viewer_relationships: Map of {author_id: trust_tier}
        
        Returns:
            List of posts with trust-weighted ranking scores (sorted by score)
        """
        ranked_posts = []
        
        for post in posts:
            author_id = post.get("author_id", "")
            
            # Get viewer's trust tier with author
            viewer_tier = viewer_relationships.get(author_id, "OTHERS")
            
            # Skip BLOCKED users (not visible)
            trust_weight = FeedRankerService.get_trust_weight(viewer_tier)
            if trust_weight < 0:
                continue  # BLOCKED posts are excluded
            
            # Calculate scores
            # Base relevance: can be enhanced with ML/content analysis later
            base_relevance = 50.0
            
            # Recency score: newer posts score higher
            created_at = post.get("created_at")
            recency_score = FeedRankerService.calculate_recency_score(created_at)
            
            # Engagement score: likes, comments, shares
            engagement_score = FeedRankerService.calculate_engagement_score(post)
            
            # Calculate total trust-weighted score
            score_breakdown = FeedRankerService.calculate_post_score(
                post=post,
                viewer_tier=viewer_tier,
                base_relevance_score=base_relevance,
                recency_score=recency_score,
                engagement_score=engagement_score
            )
            
            # Add score to post (for logging)
            post_copy = post.copy()
            post_copy["trust_score"] = score_breakdown
            ranked_posts.append(post_copy)
        
        # Sort by trust-weighted score (descending)
        ranked_posts.sort(key=lambda p: p["trust_score"]["total_score"], reverse=True)
        
        return ranked_posts
    
    @staticmethod
    def calculate_recency_score(created_at: Optional[datetime]) -> float:
        """
        Calculate recency score for a post (0-100).
        
        Newer posts score higher. Exponential decay over time.
        
        Args:
            created_at: Post creation timestamp
        
        Returns:
            Recency score (0-100)
        """
        if not created_at:
            return 50.0  # Default mid-score
        
        now = datetime.now(timezone.utc)
        age_seconds = (now - created_at).total_seconds()
        
        # Exponential decay: score decreases as post ages
        # Posts older than 7 days get very low scores
        if age_seconds <= 0:
            return 100.0
        
        # 1 hour = 100 points, 24 hours = ~80 points, 7 days = ~20 points
        decay_factor = 3600  # 1 hour in seconds
        score = 100.0 * (decay_factor / (decay_factor + age_seconds))
        
        return max(0.0, min(100.0, score))
    
    @staticmethod
    def calculate_engagement_score(post: Dict[str, Any]) -> float:
        """
        Calculate engagement score for a post (0-100).
        
        Based on likes, comments, shares, views.
        
        Args:
            post: Post document
        
        Returns:
            Engagement score (0-100)
        """
        likes = post.get("like_count", 0)
        comments = post.get("comment_count", 0)
        shares = post.get("share_count", 0)
        views = post.get("view_count", 0)
        
        # Weighted engagement calculation
        # Comments are worth more than likes
        engagement_points = (
            (comments * 10) +
            (likes * 2) +
            (shares * 5) +
            (views * 0.1)
        )
        
        # Normalize to 0-100 scale (logarithmic to prevent outliers)
        import math
        if engagement_points <= 0:
            return 0.0
        
        # Log scale: 10 points = 50 score, 100 points = 75 score, 1000 points = 100 score
        score = 50.0 + (15.0 * math.log10(engagement_points))
        
        return max(0.0, min(100.0, score))
    
    @staticmethod
    def calculate_rank_delta(
        chronological_order: List[str],
        trust_ranked_order: List[str]
    ) -> Dict[str, int]:
        """
        Calculate rank position change for each post.
        
        Args:
            chronological_order: List of post IDs in chronological order
            trust_ranked_order: List of post IDs in trust-ranked order
        
        Returns:
            Dictionary of {post_id: delta} where delta = chrono_rank - trust_rank
            Positive delta = moved UP in trust ranking
            Negative delta = moved DOWN in trust ranking
        """
        chrono_positions = {post_id: idx for idx, post_id in enumerate(chronological_order)}
        trust_positions = {post_id: idx for idx, post_id in enumerate(trust_ranked_order)}
        
        deltas = {}
        for post_id in chronological_order:
            chrono_rank = chrono_positions.get(post_id, -1)
            trust_rank = trust_positions.get(post_id, -1)
            
            if chrono_rank >= 0 and trust_rank >= 0:
                # Positive delta = moved up in trust ranking
                deltas[post_id] = chrono_rank - trust_rank
        
        return deltas
    
    @staticmethod
    def analyze_feed_diversity(
        posts: List[Dict[str, Any]],
        viewer_relationships: Dict[str, str]
    ) -> Dict[str, Any]:
        """
        Analyze content diversity in feed by trust tier.
        
        Used to detect if lower-tier content is being suppressed.
        
        Args:
            posts: List of posts
            viewer_relationships: Map of {author_id: trust_tier}
        
        Returns:
            Diversity metrics
        """
        tier_counts = {
            "PEOPLES": 0,
            "COOL": 0,
            "CHILL": 0,
            "ALRIGHT": 0,
            "OTHERS": 0,
            "OTHERS_SAFE_MODE": 0,
            "BLOCKED": 0,
        }
        
        total_posts = len(posts)
        
        for post in posts:
            author_id = post.get("author_id", "")
            tier = viewer_relationships.get(author_id, "OTHERS")
            if tier in tier_counts:
                tier_counts[tier] += 1
        
        # Calculate percentages
        tier_percentages = {
            tier: (count / total_posts * 100) if total_posts > 0 else 0
            for tier, count in tier_counts.items()
        }
        
        # Diversity score (Shannon entropy)
        import math
        entropy = 0.0
        for count in tier_counts.values():
            if count > 0:
                p = count / total_posts
                entropy -= p * math.log2(p)
        
        return {
            "tier_counts": tier_counts,
            "tier_percentages": tier_percentages,
            "total_posts": total_posts,
            "diversity_entropy": entropy,
            "notes": []
        }
    
    @staticmethod
    def detect_suppression_effects(
        diversity_analysis: Dict[str, Any]
    ) -> List[str]:
        """
        Detect if lower-tier content is being unintentionally suppressed.
        
        Args:
            diversity_analysis: Output from analyze_feed_diversity
        
        Returns:
            List of warning messages
        """
        warnings = []
        
        tier_percentages = diversity_analysis.get("tier_percentages", {})
        
        # Check if ALRIGHT/OTHERS are completely invisible
        if tier_percentages.get("ALRIGHT", 0) == 0 and tier_percentages.get("OTHERS", 0) == 0:
            warnings.append("⚠️ ALRIGHT and OTHERS tiers have 0% visibility - possible over-suppression")
        
        # Check if PEOPLES dominates too heavily (>70%)
        if tier_percentages.get("PEOPLES", 0) > 70:
            warnings.append("⚠️ PEOPLES tier dominates feed (>70%) - diversity concern")
        
        # Check if lower tiers are severely underrepresented
        lower_tier_total = (
            tier_percentages.get("CHILL", 0) +
            tier_percentages.get("ALRIGHT", 0) +
            tier_percentages.get("OTHERS", 0)
        )
        if lower_tier_total < 10:
            warnings.append("⚠️ Lower tiers (CHILL/ALRIGHT/OTHERS) represent <10% of feed - diversity concern")
        
        return warnings


# Convenience functions
def rank_feed_by_trust(
    posts: List[Dict[str, Any]],
    viewer_id: str,
    viewer_relationships: Dict[str, str]
) -> List[Dict[str, Any]]:
    """Rank feed posts by trust (shadow mode)"""
    return FeedRankerService.rank_feed_by_trust(posts, viewer_id, viewer_relationships)


def calculate_rank_delta(
    chronological_order: List[str],
    trust_ranked_order: List[str]
) -> Dict[str, int]:
    """Calculate rank position changes"""
    return FeedRankerService.calculate_rank_delta(chronological_order, trust_ranked_order)
