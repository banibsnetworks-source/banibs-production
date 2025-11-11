import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * ReportPostModal - Phase 8.3.1
 * Modal for users to report inappropriate posts
 */
const ReportPostModal = ({ postId, onClose, onReported }) => {
  const [reasonCode, setReasonCode] = useState('spam');
  const [reasonText, setReasonText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const reasons = [
    { code: 'spam', label: 'Spam or Scam' },
    { code: 'abuse', label: 'Harassment or Abuse' },
    { code: 'misinfo', label: 'Misinformation' },
    { code: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/posts/${postId}/report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            reason_code: reasonCode,
            reason_text: reasonText.trim() || null
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit report');
      }

      const result = await response.json();
      
      // Call success callback
      if (onReported) {
        onReported(result);
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-yellow-500" size={20} />
            <h2 className="text-lg font-semibold text-white">Report Post</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Why are you reporting this post?
            </label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all"
            >
              {reasons.map((reason) => (
                <option key={reason.code} value={reason.code}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="Please provide any additional context..."
              maxLength={500}
              rows={3}
              className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-500 border border-gray-700 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {reasonText.length}/500 characters
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-xs text-blue-300">
              Your report will be reviewed by our moderation team. Thank you for helping keep BANIBS safe.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportPostModal;
