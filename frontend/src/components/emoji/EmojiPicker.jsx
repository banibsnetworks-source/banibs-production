/**
 * BANIBS Emoji Picker
 * 
 * Professional emoji picker using emoji-mart
 * - Full emoji set with all categories
 * - Search functionality
 * - Skin tone support
 * - Recent emojis
 * - Clean, professional UI
 */

import React, { useEffect, useRef } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { X } from 'lucide-react';

const EmojiPicker = ({ onSelect, onClose }) => {
  const containerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    // Close on Escape key
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleEmojiSelect = (emoji) => {
    // emoji-mart returns { native: '😀', shortcodes: ':grinning:', ... }
    // We want to use the native unicode character
    if (emoji && emoji.native) {
      onSelect({
        char: emoji.native,
        native: emoji.native,
        emoji: emoji.native,
        id: emoji.id,
        shortcodes: emoji.shortcodes,
        supportsSkinTone: emoji.skin !== undefined
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
      style={{ maxWidth: '352px' }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        aria-label="Close emoji picker"
      >
        <X size={14} />
      </button>

      {/* Emoji Mart Picker */}
      <Picker
        data={data}
        onEmojiSelect={handleEmojiSelect}
        theme="dark"
        set="native"
        skinTonePosition="search"
        previewPosition="none"
        searchPosition="sticky"
        navPosition="bottom"
        perLine={9}
        emojiSize={28}
        emojiButtonSize={36}
        maxFrequentRows={2}
        icons="outline"
        categories={[
          'frequent',
          'people',
          'nature',
          'foods',
          'activity',
          'places',
          'objects',
          'symbols',
          'flags'
        ]}
        locale="en"
        autoFocus={true}
      />

      <style>{`
        em-emoji-picker {
          --em-rgb-background: 17, 18, 23;
          --em-rgb-input: 39, 39, 42;
          --em-rgb-color: 250, 250, 250;
          --em-rgb-accent: 200, 168, 87;
          --border-radius: 12px;
          width: 100%;
          max-height: 400px;
        }
        
        em-emoji-picker .search input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        
        em-emoji-picker .search input:focus {
          border-color: rgba(200, 168, 87, 0.5);
          outline: none;
        }
        
        em-emoji-picker button[data-emoji-skin] {
          border-radius: 6px;
        }
        
        em-emoji-picker button:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        em-emoji-picker .category-name {
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default EmojiPicker;
