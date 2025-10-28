import React, { useState } from 'react';
import { opportunitiesAPI } from '../../services/api';

const AdminOpportunityCard = ({ opportunity, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');

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
      onUpdate();
    } catch (err) {
      setError(`Failed to ${action}`);
      console.error(err);
    } finally {
      setLoading(false);
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
      day: 'numeric'
    });
  };

  return (
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

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-2 bg-red-900/50 border border-red-500 rounded text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!opportunity.approved && (
          <>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              ✅ Approve
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              ❌ Reject
            </button>
          </>
        )}
        
        {opportunity.approved && !opportunity.featured && (
          <button
            onClick={handleFeature}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-[0_0_10px_rgba(255,215,0,0.5)]"
          >
            ⭐ Feature
          </button>
        )}

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
  );
};

export default AdminOpportunityCard;
