import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus } from 'lucide-react';
import { peoplesApi } from '../../services/phase83Api';

/**
 * Phase 8.3 - Add to My Peoples Button
 * Culturally-aligned "Follow" system for BANIBS Connect
 */
const AddToPeoplesButton = ({ targetUserId, accentColor = '#3B82F6', className = '', onStatusChange }) => {
  const [isInPeoples, setIsInPeoples] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPeoplesStatus();
  }, [targetUserId]);

  const loadPeoplesStatus = async () => {
    try {
      setIsLoading(true);
      const stats = await peoplesApi.getPeoplesStats(targetUserId);
      setIsInPeoples(stats.is_in_my_peoples);
    } catch (error) {
      console.error('Failed to load peoples status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePeoples = async () => {
    console.log('[AddToPeoples] Button clicked. Current state:', {
      isInPeoples,
      targetUserId,
      isProcessing
    });
    
    setIsProcessing(true);
    
    try {
      if (isInPeoples) {
        console.log('[AddToPeoples] Removing from peoples...');
        const result = await peoplesApi.removeFromPeoples(targetUserId);
        console.log('[AddToPeoples] Remove result:', result);
        setIsInPeoples(false);
      } else {
        console.log('[AddToPeoples] Adding to peoples...');
        const result = await peoplesApi.addToPeoples(targetUserId);
        console.log('[AddToPeoples] Add result:', result);
        setIsInPeoples(true);
      }
      
      console.log('[AddToPeoples] State updated. New isInPeoples:', !isInPeoples);
      
      // Notify parent component of status change
      if (onStatusChange) {
        onStatusChange(!isInPeoples);
      }
    } catch (error) {
      console.error('[AddToPeoples] Error:', error);
      alert(error.message || 'Failed to update peoples status');
    } finally {
      setIsProcessing(false);
      console.log('[AddToPeoples] Processing complete');
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-2 text-white rounded-full transition-all opacity-50 ${className}`}
        style={{ backgroundColor: accentColor }}
      >
        <span className="text-sm">Loading...</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleTogglePeoples}
      disabled={isProcessing}
      className={`flex items-center gap-2 px-4 py-2 text-white rounded-full transition-all shadow-lg hover:shadow-xl ${className} ${
        isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
      }`}
      style={{ backgroundColor: accentColor }}
    >
      {isInPeoples ? (
        <>
          <UserMinus className="w-4 h-4" />
          <span className="text-sm font-medium">Remove from My Peoples</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span className="text-sm font-medium">Add to My Peoples</span>
        </>
      )}
    </button>
  );
};

export default AddToPeoplesButton;
