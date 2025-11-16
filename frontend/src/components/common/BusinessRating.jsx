import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

/**
 * BusinessRating - Display average rating for a business
 * Phase 7.1: Professional Reputation Layer
 */

const BusinessRating = ({ businessProfileId, showReviewCount = false, size = 'md' }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessProfileId) {
      fetchRatingStats();
    }
  }, [businessProfileId]);

  const fetchRatingStats = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/reviews/stats/${businessProfileId}`
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch rating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats || stats.total_reviews === 0) {
    return null;
  }

  const sizeClasses = {
    sm: { star: 'w-3 h-3', text: 'text-xs' },
    md: { star: 'w-4 h-4', text: 'text-sm' },
    lg: { star: 'w-5 h-5', text: 'text-base' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Star className={`${currentSize.star} fill-yellow-500 text-yellow-500`} />
        <span className={`${currentSize.text} font-semibold text-foreground`}>
          {stats.average_rating.toFixed(1)}
        </span>
      </div>
      {showReviewCount && (
        <span className={`${currentSize.text} text-muted-foreground`}>
          ({stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default BusinessRating;
