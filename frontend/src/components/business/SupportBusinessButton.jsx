import React, { useState, useEffect } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { businessSupportApi } from '../../services/phase83Api';

/**
 * Phase 8.3 - Support This Business Button
 * Show support for Black-owned businesses
 */
const SupportBusinessButton = ({ businessId, accentColor = '#3B82F6', className = '', onStatusChange }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [supportersCount, setSupportersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadSupportStatus();
  }, [businessId]);

  const loadSupportStatus = async () => {
    try {
      setIsLoading(true);
      const stats = await businessSupportApi.getBusinessSupportStats(businessId);
      setIsSupported(stats.is_supported);
      setSupportersCount(stats.supporters_count);
    } catch (error) {
      console.error('Failed to load support status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSupport = async () => {
    console.log('[SupportBusiness] Button clicked. Current state:', {
      isSupported,
      businessId,
      supportersCount,
      isProcessing
    });
    
    setIsProcessing(true);
    
    try {
      if (isSupported) {
        console.log('[SupportBusiness] Removing support...');
        const result = await businessSupportApi.unsupportBusiness(businessId);
        console.log('[SupportBusiness] Remove result:', result);
        setIsSupported(false);
        setSupportersCount(prev => Math.max(0, prev - 1));
      } else {
        console.log('[SupportBusiness] Adding support...');
        const result = await businessSupportApi.supportBusiness(businessId);
        console.log('[SupportBusiness] Add result:', result);
        setIsSupported(true);
        setSupportersCount(prev => prev + 1);
      }
      
      console.log('[SupportBusiness] State updated. New state:', {
        isSupported: !isSupported,
        supportersCount
      });
      
      // Notify parent component of status change
      if (onStatusChange) {
        onStatusChange(!isSupported);
      }
    } catch (error) {
      console.error('[SupportBusiness] Error:', error);
      alert(error.message || 'Failed to update support status');
    } finally {
      setIsProcessing(false);
      console.log('[SupportBusiness] Processing complete');
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
      onClick={handleToggleSupport}
      disabled={isProcessing}
      className={`flex items-center gap-2 px-4 py-2 text-white rounded-full transition-all shadow-lg hover:shadow-xl ${className} ${
        isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
      }`}
      style={{ backgroundColor: accentColor }}
      title={`${supportersCount} ${supportersCount === 1 ? 'supporter' : 'supporters'}`}
    >
      {isSupported ? (
        <>
          <Heart className="w-4 h-4 fill-current" />
          <span className="text-sm font-medium">Supporting ({supportersCount})</span>
        </>
      ) : (
        <>
          <Heart className="w-4 h-4" />
          <span className="text-sm font-medium">Support This Business</span>
        </>
      )}
    </button>
  );
};

export default SupportBusinessButton;
