import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * ReviewForm - Create/Edit business review
 * Phase 7.1: Professional Reputation Layer
 */

const ReviewForm = ({ businessProfileId, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    checkExistingReview();
  }, [businessProfileId]);

  const checkExistingReview = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/reviews/check/${businessProfileId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data) {
          setExistingReview(data);
          setRating(data.rating);
          setReviewText(data.review_text || '');
          setCategory(data.category);
        }
      }
    } catch (error) {
      console.error('Failed to check existing review:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/reviews`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            business_profile_id: businessProfileId,
            rating,
            review_text: reviewText.trim() || null,
            category
          })
        }
      );

      if (response.ok) {
        if (onSuccess) onSuccess();
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to submit review');
      }
    } catch (err) {
      setError('Failed to submit review');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {existingReview ? 'Update Your Review' : 'Write a Review'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Your Rating *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Review Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="general">General Experience</option>
            <option value="service">Service Quality</option>
            <option value="employer">As an Employer</option>
            <option value="product">Product/Offering</option>
          </select>
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Your Experience (Optional)
          </label>
          <textarea
            rows={4}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            maxLength={1000}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            placeholder="Share your experience with this business..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            {reviewText.length}/1000 characters
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-muted"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
