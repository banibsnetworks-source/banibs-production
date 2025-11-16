import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Video, Link2, Loader2, Smile } from 'lucide-react';
import MediaUploader from './MediaUploader';
import LinkPreviewCard from './LinkPreviewCard';
import EmojiPicker from '../emoji/EmojiPicker.jsx';
import { applySkinTone } from '../../utils/emojiToneUtils';
import { useAuth } from '../../contexts/AuthContext';
import './MediaComposerModal.css';

const MediaComposerModal = ({ isOpen, onClose, onSubmit, initialText = '' }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [media, setMedia] = useState([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkMeta, setLinkMeta] = useState(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isFetchingLink, setIsFetchingLink] = useState(false);
  const linkInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Set initial text when modal opens with emoji
  React.useEffect(() => {
    if (isOpen && initialText) {
      setText(initialText);
    }
  }, [isOpen, initialText]);

  const handleAddLink = async () => {
    if (!linkUrl.trim()) return;

    setIsFetchingLink(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/media/link/preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({ url: linkUrl })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Link preview fetched successfully:', data);
        setLinkMeta(data);
      } else {
        // Log when preview fetch fails but don't block the post
        const errorData = await response.text();
        console.warn('⚠️ Link preview fetch failed:', response.status, errorData);
      }
      // Always hide input and keep the URL (even if preview failed)
      setShowLinkInput(false);
    } catch (error) {
      console.error('❌ Failed to fetch link preview:', error);
      // Keep the URL even if preview fails - hide input
      setShowLinkInput(false);
    } finally {
      setIsFetchingLink(false);
    }
  };

  const handleRemoveLink = () => {
    setLinkUrl('');
    setLinkMeta(null);
  };

  const handlePost = async () => {
    // Require at least one of: text, media, or link
    if (!text.trim() && media.length === 0 && !linkMeta && !linkUrl) {
      alert('Please add some content to your post (text, image, or link)');
      return;
    }

    setIsPosting(true);
    try {
      await onSubmit({
        text: text.trim() || "", // Send empty string if no text (media-only or link-only posts)
        media,
        link_url: linkMeta?.url || linkUrl || null,
        link_meta: linkMeta
      });

      // Reset form
      setText('');
      setMedia([]);
      setLinkUrl('');
      setLinkMeta(null);
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="media-composer-overlay" onClick={onClose}>
      <div className="media-composer-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="composer-header">
          <h2>Create Post</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Text Area */}
        <div className="composer-body">
          <textarea
            ref={textareaRef}
            className="composer-textarea"
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            rows={5}
          />

          {/* Media Uploader */}
          <MediaUploader media={media} setMedia={setMedia} />

          {/* Link Preview - Rich preview when metadata exists */}
          {linkMeta && (
            <LinkPreviewCard linkMeta={linkMeta} onRemove={handleRemoveLink} />
          )}

          {/* Link Preview Fallback - Show URL when no metadata but URL exists */}
          {!linkMeta && linkUrl && !showLinkInput && (
            <div className="mt-3 relative border border-border rounded-lg overflow-hidden bg-muted">
              <button
                onClick={handleRemoveLink}
                className="absolute top-2 right-2 z-10 p-1.5 bg-background/90 hover:bg-background rounded-full border border-border transition-colors"
                title="Remove link"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🔗</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Link Added</p>
                    <p className="text-sm text-foreground font-medium truncate">{linkUrl}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                  Preview unavailable - link will be posted as clickable URL
                </p>
              </div>
            </div>
          )}

          {/* Link Input */}
          {showLinkInput && (
            <div className="link-input-container">
              <input
                ref={linkInputRef}
                type="url"
                className="link-input"
                placeholder="Paste link URL..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddLink();
                  }
                }}
              />
              <button
                className="link-add-btn"
                onClick={handleAddLink}
                disabled={isFetchingLink}
              >
                {isFetchingLink ? <Loader2 size={16} className="spinner" /> : 'Add'}
              </button>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="composer-toolbar">
          <div className="toolbar-actions">
            <button
              className="toolbar-btn"
              onClick={() => document.getElementById('media-file-input').click()}
              disabled={media.length >= 4}
              title="Add Images"
            >
              <ImageIcon size={20} />
            </button>
            <button
              className="toolbar-btn"
              onClick={() => document.getElementById('media-file-input').click()}
              disabled={media.length >= 1 && media[0]?.type === 'video'}
              title="Add Video"
            >
              <Video size={20} />
            </button>
            <button
              className="toolbar-btn"
              onClick={() => {
                setShowLinkInput(!showLinkInput);
                setTimeout(() => linkInputRef.current?.focus(), 100);
              }}
              disabled={!!linkMeta}
              title="Add Link"
            >
              <Link2 size={20} />
            </button>
            <div className="relative">
              <button
                className="toolbar-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Add Emoji"
              >
                <Smile size={20} />
              </button>
              {showEmojiPicker && (
                <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '8px', zIndex: 1000 }}>
                  <EmojiPicker
                    onSelect={(emoji) => {
                      // Apply user's skin tone for unicode emojis
                      let emojiChar = '';
                      if (emoji.type === 'unicode') {
                        const userSkinTone = user?.emoji_identity?.skinTone || 'tone4';
                        const supportsSkinTone = emoji.supportsSkinTone !== undefined ? emoji.supportsSkinTone : false;
                        emojiChar = supportsSkinTone 
                          ? applySkinTone(emoji.char, userSkinTone, true)
                          : emoji.char;
                      }
                      
                      // Insert emoji at cursor position
                      const textarea = textareaRef.current;
                      if (textarea && emojiChar) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const newText = text.substring(0, start) + emojiChar + text.substring(end);
                        setText(newText);
                        // Set cursor after emoji
                        setTimeout(() => {
                          textarea.selectionStart = textarea.selectionEnd = start + emojiChar.length;
                          textarea.focus();
                        }, 0);
                      }
                      setShowEmojiPicker(false);
                    }}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="toolbar-right">
            <span className="char-count">{text.length}/1000</span>
            <button
              className="post-btn"
              onClick={handlePost}
              disabled={isPosting || (!text.trim() && media.length === 0 && !linkMeta)}
            >
              {isPosting ? (
                <><Loader2 size={16} className="spinner" /> Posting...</>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaComposerModal;
