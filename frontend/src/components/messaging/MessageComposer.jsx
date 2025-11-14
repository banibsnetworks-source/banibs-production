import React, { useState, useRef } from 'react';
import { Send, Smile, Paperclip, Mic, Phone, Video } from 'lucide-react';
import EmojiPicker from '../emoji/EmojiPicker.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { applySkinTone } from '../../utils/emojiToneUtils';
import PostTextWithEmojis from '../social/PostTextWithEmojis';

export function MessageComposer({ 
  onSend, 
  onAttachFile, 
  onStartVoice, 
  onStartCall,
  disabled = false,
  placeholder = 'Type a message...'
}) {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  const handleSend = () => {
    if (!messageText.trim() || disabled) return;
    onSend(messageText);
    setMessageText('');
    if (inputRef.current) {
      inputRef.current.textContent = '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="flex items-end space-x-2">
        {/* Emoji Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            title="Add emoji"
            disabled={disabled}
          >
            <Smile size={20} />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 z-50">
              <EmojiPicker
                onSelect={(emoji) => {
                  let emojiContent = '';
                  
                  if (emoji.type === 'unicode') {
                    const userSkinTone = user?.emoji_identity?.skinTone || 'tone4';
                    const supportsSkinTone = emoji.supportsSkinTone !== undefined ? emoji.supportsSkinTone : false;
                    emojiContent = supportsSkinTone 
                      ? applySkinTone(emoji.char, userSkinTone, true)
                      : emoji.char;
                  } else if (emoji.type === 'image') {
                    emojiContent = `[emoji:${emoji.id}]`;
                  }
                  
                  if (emojiContent) {
                    setMessageText(prev => prev + emojiContent);
                  }
                  setShowEmojiPicker(false);
                }}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
        </div>

        {/* Message Input Area */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-background text-foreground rounded-lg px-3 py-2 text-sm border border-input focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all min-h-[40px] max-h-[120px] resize-none"
            style={{
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          />
        </div>

        {/* Action Buttons */}
        {onAttachFile && (
          <button
            type="button"
            onClick={onAttachFile}
            disabled={disabled}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>
        )}

        {onStartVoice && (
          <button
            type="button"
            onClick={onStartVoice}
            disabled={disabled}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
            title="Voice message"
          >
            <Mic size={20} />
          </button>
        )}

        {onStartCall && (
          <>
            <button
              type="button"
              onClick={() => onStartCall('audio')}
              disabled={disabled}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
              title="Audio call"
            >
              <Phone size={20} />
            </button>
            <button
              type="button"
              onClick={() => onStartCall('video')}
              disabled={disabled}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
              title="Video call"
            >
              <Video size={20} />
            </button>
          </>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!messageText.trim() || disabled}
          className="p-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Send message"
        >
          <Send size={20} />
        </button>
      </div>
      
      {/* Inline style for placeholder */}
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          position: absolute;
        }
      `}</style>
    </div>
  );
}
