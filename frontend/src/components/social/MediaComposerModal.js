import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Video, Link2, Loader2, Smile } from 'lucide-react';
import MediaUploader from './MediaUploader';
import LinkPreviewCard from './LinkPreviewCard';
import EmojiPicker from '../emoji/EmojiPicker.jsx';
import './MediaComposerModal.css';

const MediaComposerModal = ({ isOpen, onClose, onSubmit, initialText = '' }) => {
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
        setLinkMeta(data);
        setShowLinkInput(false);
      }
    } catch (error) {
      console.error('Failed to fetch link preview:', error);
      alert('Failed to fetch link preview');
    } finally {
      setIsFetchingLink(false);
    }
  };

  const handleRemoveLink = () => {
    setLinkUrl('');
    setLinkMeta(null);
  };

  const handlePost = async () => {
    if (!text.trim() && media.length === 0 && !linkMeta) {
      alert('Please add some content to your post');
      return;
    }

    setIsPosting(true);
    try {
      await onSubmit({
        text: text.trim(),
        media,
        link_url: linkMeta?.url || null,
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

          {/* Link Preview */}
          {linkMeta && (
            <LinkPreviewCard linkMeta={linkMeta} onRemove={handleRemoveLink} />
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
                <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '8px' }}>
                  <EmojiPicker
                    onEmojiSelect={(emoji) => {
                      // Insert emoji at cursor position
                      const textarea = textareaRef.current;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const newText = text.substring(0, start) + emoji + text.substring(end);
                        setText(newText);
                        // Set cursor after emoji
                        setTimeout(() => {
                          textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
                          textarea.focus();
                        }, 0);
                      }
                      setShowEmojiPicker(false);
                    }}
                    onClose={() => setShowEmojiPicker(false)}
                    position="bottom"
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
