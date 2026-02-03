/**
 * BANIBS Emoji Picker
 * 
 * Professional emoji picker using emoji-picker-react
 * - Full emoji set with all categories
 * - Search functionality
 * - Skin tone support
 * - Recent emojis
 * - Clean, professional UI matching BANIBS design
 */

import React, { useEffect, useRef } from 'react';
import EmojiPickerReact, { Theme, EmojiStyle, SkinTones } from 'emoji-picker-react';

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

  const handleEmojiClick = (emojiData) => {
    // emojiData contains { emoji: '😀', names: [...], unified: '1f600' }
    // We use the native unicode emoji directly
    if (emojiData && emojiData.emoji) {
      onSelect({
        char: emojiData.emoji,
        native: emojiData.emoji,
        emoji: emojiData.emoji,
        id: emojiData.unified,
        names: emojiData.names,
        supportsSkinTone: false // emoji-picker-react handles skin tones internally
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="emoji-picker-container"
    >
      <EmojiPickerReact
        onEmojiClick={handleEmojiClick}
        theme={Theme.DARK}
        emojiStyle={EmojiStyle.NATIVE}
        skinTonesDisabled={false}
        defaultSkinTone={SkinTones.MEDIUM_DARK}
        searchPlaceHolder="Search emojis..."
        width={320}
        height={400}
        previewConfig={{
          showPreview: false
        }}
        lazyLoadEmojis={true}
        autoFocusSearch={true}
      />

      <style>{`
        .emoji-picker-container {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        
        .emoji-picker-container .EmojiPickerReact {
          --epr-bg-color: #111217 !important;
          --epr-category-label-bg-color: #111217 !important;
          --epr-search-input-bg-color: rgba(255, 255, 255, 0.1) !important;
          --epr-picker-border-color: rgba(255, 255, 255, 0.1) !important;
          --epr-search-border-color: rgba(255, 255, 255, 0.15) !important;
          --epr-text-color: #f7f7f7 !important;
          --epr-category-icon-active-color: #c8a857 !important;
          --epr-highlight-color: rgba(200, 168, 87, 0.2) !important;
          --epr-hover-bg-color: rgba(255, 255, 255, 0.1) !important;
          --epr-focus-bg-color: rgba(200, 168, 87, 0.2) !important;
          --epr-search-input-text-color: #f7f7f7 !important;
          --epr-search-input-placeholder-color: rgba(255, 255, 255, 0.4) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
        }
        
        .emoji-picker-container .EmojiPickerReact .epr-search-container input {
          border-radius: 8px !important;
        }
        
        .emoji-picker-container .EmojiPickerReact .epr-search-container input:focus {
          border-color: rgba(200, 168, 87, 0.5) !important;
          box-shadow: 0 0 0 2px rgba(200, 168, 87, 0.2) !important;
        }
        
        .emoji-picker-container .EmojiPickerReact .epr-emoji-category-label {
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          color: rgba(255, 255, 255, 0.5) !important;
        }
        
        .emoji-picker-container .EmojiPickerReact button.epr-emoji {
          border-radius: 6px !important;
        }
        
        .emoji-picker-container .EmojiPickerReact button.epr-emoji:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }
        
        .emoji-picker-container .EmojiPickerReact .epr-body::-webkit-scrollbar {
          width: 8px !important;
        }
        
        .emoji-picker-container .EmojiPickerReact .epr-body::-webkit-scrollbar-track {
          background: transparent !important;
        }
        
        .emoji-picker-container .EmojiPickerReact .epr-body::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15) !important;
          border-radius: 4px !important;
        }
        
        .emoji-picker-container .EmojiPickerReact .epr-body::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25) !important;
        }
      `}</style>
    </div>
  );
};

export default EmojiPicker;
