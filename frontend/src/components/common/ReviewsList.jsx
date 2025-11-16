import React, { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';

/**
 * ReviewsList - Display list of reviews for a business
 * Phase 7.1: Professional Reputation Layer
 */

const ReviewsList = ({ businessProfileId, limit = 10 }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (businessProfileId) {
      fetchReviews();
    }
  }, [businessProfileId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/reviews/business/${businessProfileId}?page=${page}&limit=${limit}`
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setTotalPages(data.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const getCategoryLabel = (category) => {
    const labels = {
      general: 'General Experience',
      service: 'Service Quality',
      employer: 'As an Employer',
      product: 'Product/Offering'
    };
    return labels[category] || category;
  };

  if (loading && page === 1) {
    return <div className="text-sm text-muted-foreground">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-border pb-4 last:border-0">
          <div className="flex items-start gap-3">
            {/* Reviewer Avatar */}
            {review.reviewer_avatar ? (
              <img
                src={review.reviewer_avatar}
                alt={review.reviewer_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
            )}

            <div className="flex-1">
              {/* Reviewer Info */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-foreground">
                    {review.reviewer_name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {renderStars(review.rating)}
              </div>

              {/* Category Badge */}
              <span className="inline-block px-2 py-1 text-xs bg-muted text-muted-foreground rounded mb-2">
                {getCategoryLabel(review.category)}
              </span>

              {/* Review Text */}
              {review.review_text && (
                <p className="text-sm text-foreground whitespace-pre-line">
                  {review.review_text}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-border rounded-lg bg-card text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 border border-border rounded-lg bg-card text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
