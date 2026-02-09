import React, { useState, useRef, useEffect } from 'react';
import { Share2, Link2, Check } from 'lucide-react';

/**
 * ShareButton - Platform-Neutral Share Component
 * 
 * NEO Share Feature v1 - BANIBS Content Sharing
 * 
 * Design Philosophy:
 * - Platform-neutral: No Facebook/Twitter/Instagram buttons or logos
 * - BANIBS is the source: Users decide where to share links
 * - Privacy-aware: Only generates links for content the viewer can see
 * 
 * Behavior:
 * - Click "Share" → reveals "Copy link" option
 * - Copy link → copies canonical URL to clipboard
 * - Shows subtle "Link copied" confirmation
 * - Mobile: Can optionally invoke native share sheet (still generic)
 */
const ShareButton = ({ 
  contentType = 'post', // 'post' | 'frame' | 'foundation'
  contentId,
  contentTitle,
  className = '',
  compact = false,
  showLabel = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Generate canonical URL for the content
  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    
    switch (contentType) {
      case 'post':
        return `${baseUrl}/portal/social/post/${contentId}`;
      case 'frame':
        return `${baseUrl}/socialworld/frames/${contentId}`;
      case 'foundation':
        // Handle both main foundation page and sub-pages
        if (contentId === 'foundation' || contentId === 'main') {
          return `${baseUrl}/foundation`;
        }
        return `${baseUrl}/foundation/${contentId}`;
      default:
        return `${baseUrl}/portal/social/post/${contentId}`;
    }
  };

  // Handle copy link action
  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          setIsOpen(false);
        }, 2000);
      } catch {
        console.error('Fallback copy failed');
      }
      document.body.removeChild(textArea);
    }
  };

  // Handle native share (mobile)
  const handleNativeShare = async () => {
    const shareUrl = getShareUrl();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: contentTitle || 'BANIBS Content',
          text: 'Check this out on BANIBS',
          url: shareUrl,
        });
        setIsOpen(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Check if native share is available
  const hasNativeShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <div className={`relative ${className}`}>
      {/* Share Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
          isOpen
            ? 'text-amber-500 bg-amber-500/10'
            : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
        } ${compact ? 'px-2' : 'flex-1'}`}
        aria-label="Share"
        aria-expanded={isOpen}
        aria-haspopup="true"
        data-testid="share-button"
      >
        <Share2 size={18} />
        {showLabel && <span className="hidden sm:inline">Share</span>}
      </button>

      {/* Share Dropdown */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 min-w-[180px] bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="menu"
          data-testid="share-dropdown"
        >
          {/* Copy Link Option */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-card-foreground hover:bg-muted transition-colors"
            role="menuitem"
            data-testid="copy-link-button"
          >
            {copied ? (
              <>
                <Check size={18} className="text-green-500" />
                <span className="text-green-500 font-medium">Link copied</span>
              </>
            ) : (
              <>
                <Link2 size={18} className="text-muted-foreground" />
                <span>Copy link</span>
              </>
            )}
          </button>

          {/* Native Share Option (mobile only) */}
          {hasNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-card-foreground hover:bg-muted transition-colors border-t border-border/50"
              role="menuitem"
              data-testid="native-share-button"
            >
              <Share2 size={18} className="text-muted-foreground" />
              <span>Share via...</span>
            </button>
          )}
        </div>
      )}

      {/* Toast Notification (shown when copied) */}
      {copied && (
        <div 
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-900 text-white text-sm rounded-full shadow-lg flex items-center gap-2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300"
          role="status"
          aria-live="polite"
        >
          <Check size={16} className="text-green-400" />
          <span>Link copied</span>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
