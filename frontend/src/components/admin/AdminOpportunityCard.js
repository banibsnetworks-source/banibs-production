import React, { useState } from 'react';
import { opportunitiesAPI, moderationLogsAPI } from '../../services/api';

const AdminOpportunityCard = ({ opportunity, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const handleAction = async (actionType) => {
    setAction(actionType);
    setShowNotesModal(true);
  };

  const confirmAction = async () => {
    setLoading(true);
    setError('');
    try {
      if (action === 'approve') {
        await opportunitiesAPI.approve(opportunity.id, notes || null);
      } else if (action === 'reject') {
        await opportunitiesAPI.reject(opportunity.id, notes || null);
      } else if (action === 'feature') {
        await opportunitiesAPI.feature(opportunity.id, notes || null);
      }
      setShowNotesModal(false);
      setNotes('');
      
      // Phase 3.3 - Show toast notification about email
      alert(`✅ ${action.charAt(0).toUpperCase() + action.slice(1)} successful! An email notification has been sent to the contributor.`);
      
      onUpdate();
    } catch (err) {
      setError(`Failed to ${action}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Phase 3.2 - Load moderation logs
  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await moderationLogsAPI.getLogsForOpportunity(opportunity.id);
      setLogs(response.data);
      setShowLogsModal(true);
    } catch (err) {
      console.error('Error loading logs:', err);
      alert('Failed to load moderation logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  const getStatusBadge = () => {
    if (opportunity.featured) {
      return (
        <span className="px-3 py-1 bg-[#FFD700] text-black text-xs font-bold rounded-full">
          ⭐ FEATURED
        </span>
      );
    }
    if (opportunity.approved) {
      return (
        <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
          ✅ APPROVED
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-yellow-600 text-white text-xs font-bold rounded-full">
        ⏳ PENDING
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="bg-black border-2 border-[#FFD700] rounded-lg p-6 hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">
              {opportunity.title}
            </h3>
            <p className="text-[#FFD700] text-sm font-medium">
              {opportunity.orgName}
            </p>
            {/* Phase 3.1 - Show contributor display name and verified badge */}
            {(opportunity.contributor_display_name || opportunity.contributor_email) && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-400 text-xs">
                  By: {opportunity.contributor_display_name || opportunity.contributor_email}
                </p>
                {opportunity.contributor_verified && (
                  <span className="inline-flex items-center px-2 py-0.5 bg-[#FFD700] text-black text-xs font-bold rounded">
                    ✓ Verified
                  </span>
                )}
              </div>
            )}
          </div>
          {getStatusBadge()}
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-[#FFD700]">Type:</span>
            <span className="capitalize">{opportunity.type}</span>
          </div>
          
          {opportunity.location && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-[#FFD700]">Location:</span>
              <span>{opportunity.location}</span>
            </div>
          )}
          
          {opportunity.deadline && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-[#FFD700]">Deadline:</span>
              <span>{formatDate(opportunity.deadline)}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-[#FFD700]">Submitted:</span>
            <span>{formatDate(opportunity.createdAt)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {opportunity.description}
        </p>

        {/* Image */}
        {opportunity.imageUrl && (
          <div className="mb-4">
            <img 
              src={opportunity.imageUrl} 
              alt={opportunity.title}
              className="w-full h-40 object-cover rounded-lg border border-[#FFD700]/30"
            />
          </div>
        )}

        {/* Moderation Notes */}
        {opportunity.moderation_notes && (
          <div className="mb-4 p-3 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg">
            <p className="text-xs text-[#FFD700] mb-1">Moderation Notes:</p>
            <p className="text-sm text-gray-300">{opportunity.moderation_notes}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-2 bg-red-900/50 border border-red-500 rounded text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          {!opportunity.approved && (
            <>
              <button
                onClick={() => handleAction('approve')}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                ❌ Reject
              </button>
            </>
          )}
          
          {opportunity.approved && !opportunity.featured && (
            <button
              onClick={() => handleAction('feature')}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-[0_0_10px_rgba(255,215,0,0.5)]"
            >
              ⭐ Feature
            </button>
          )}

          {/* Phase 3.2 - View Logs Button */}
          <button
            onClick={loadLogs}
            disabled={loadingLogs}
            className="px-4 py-2 bg-[#1a1a1a] border border-[#FFD700] text-[#FFD700] font-bold rounded-lg hover:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all text-sm disabled:opacity-50"
          >
            📋 History
          </button>

          {opportunity.link && (
            <a
              href={opportunity.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#1a1a1a] border border-[#FFD700] text-[#FFD700] font-bold rounded-lg hover:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all text-sm"
            >
              🔗 View Link
            </a>
          )}
        </div>
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black border-2 border-[#FFD700] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4 capitalize">
              {action} Opportunity
            </h3>
            <p className="text-gray-300 text-sm mb-2">
              Add optional notes for this moderation action:
            </p>
            <p className="text-[#FFD700] text-xs mb-4">
              ⚠️ This action will send an email notification to the contributor.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all resize-none mb-4"
              placeholder="Optional: Add reason or feedback..."
            />
            <div className="flex gap-3">
              <button
                onClick={confirmAction}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Confirm ${action}`}
              </button>
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setNotes('');
                }}
                disabled={loading}
                className="px-4 py-2 bg-[#1a1a1a] border border-[#FFD700] text-[#FFD700] font-bold rounded-lg hover:bg-[#2a2a2a] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3.2 - Moderation Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black border-2 border-[#FFD700] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                Moderation History
              </h3>
              <button
                onClick={() => setShowLogsModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No moderation history yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          log.action_type === 'approve' ? 'bg-green-600 text-white' :
                          log.action_type === 'reject' ? 'bg-red-600 text-white' :
                          'bg-[#FFD700] text-black'
                        }`}>
                          {log.action_type.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-400">
                          by {log.moderator_email || log.moderator_user_id}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    {log.note && (
                      <p className="text-sm text-gray-300 mt-2 pl-2 border-l-2 border-[#FFD700]/30">
                        {log.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowLogsModal(false)}
                className="px-4 py-2 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminOpportunityCard;
