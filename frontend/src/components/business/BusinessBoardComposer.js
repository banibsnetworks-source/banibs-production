import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import MediaUploader from '../social/MediaUploader';
import LinkPreviewCard from '../social/LinkPreviewCard';
import './BusinessBoardComposer.css';

const CATEGORIES = [
  { value: 'hiring', label: 'Hiring', desc: 'Job opportunities' },
  { value: 'partnership', label: 'Partnership', desc: 'Business partnerships' },
  { value: 'funding', label: 'Funding', desc: 'Investment opportunities' },
  { value: 'event', label: 'Event', desc: 'Business events' },
  { value: 'service', label: 'Service', desc: 'Services offered' },
  { value: 'announcement', label: 'Announcement', desc: 'Company news' },
  { value: 'collaboration', label: 'Collaboration', desc: 'Project collaboration' },
  { value: 'opportunity', label: 'Opportunity', desc: 'General opportunities' }
];

const BusinessBoardComposer = ({ isOpen, onClose, onPostCreated }) => {
  const [category, setCategory] = useState('hiring');
  const [text, setText] = useState('');
  const [media, setMedia] = useState([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkMeta, setLinkMeta] = useState(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const handleAddLink = async () => {
    if (!linkUrl.trim()) return;

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
    }
  };

  const handlePost = async () => {
    if (!text.trim()) {
      alert('Please add some text to your post');
      return;
    }

    setIsPosting(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/business/board`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            category,
            text: text.trim(),
            media,
            link_url: linkMeta?.url || null,
            link_meta: linkMeta
          })
        }
      );

      if (response.ok) {
        const newPost = await response.json();
        onPostCreated(newPost);
        setText('');
        setMedia([]);
        setLinkUrl('');
        setLinkMeta(null);
        onClose();
      } else {
        alert('Failed to create post');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className=\"board-composer-overlay\" onClick={onClose}>
      <div className=\"board-composer-modal\" onClick={(e) => e.stopPropagation()}>
        <div className=\"composer-header\">
          <h2>Create Board Post</h2>
          <button className=\"close-btn\" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className=\"composer-body\">
          {/* Category Selection */}
          <div className=\"category-section\">
            <label>Category</label>
            <div className=\"category-grid\">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type=\"button\"
                  className={`category-option ${category === cat.value ? 'selected' : ''}`}
                  onClick={() => setCategory(cat.value)}
                >
                  <span className=\"category-label\">{cat.label}</span>
                  <span className=\"category-desc\">{cat.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <textarea
            className=\"composer-textarea\"
            placeholder=\"Share your opportunity, announcement, or business need...\"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            rows={6}
          />

          {/* Media Uploader */}
          <MediaUploader media={media} setMedia={setMedia} />

          {/* Link Preview */}
          {linkMeta && (
            <LinkPreviewCard 
              linkMeta={linkMeta} 
              onRemove={() => setLinkMeta(null)} 
            />
          )}

          {/* Link Input */}
          {showLinkInput && (
            <div className=\"link-input-container\">
              <input
                type=\"url\"
                className=\"link-input\"
                placeholder=\"Paste link URL...\"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
              />
              <button className=\"link-add-btn\" onClick={handleAddLink}>
                Add
              </button>
            </div>
          )}
        </div>

        <div className=\"composer-footer\">
          <div className=\"footer-actions\">
            <button
              type=\"button\"
              onClick={() => setShowLinkInput(!showLinkInput)}
              disabled={!!linkMeta}
              className=\"action-btn\"
            >
              Add Link
            </button>
          </div>

          <div className=\"footer-right\">
            <span className=\"char-count\">{text.length}/2000</span>
            <button
              className=\"post-btn\"
              onClick={handlePost}
              disabled={isPosting || !text.trim()}
            >
              {isPosting ? (
                <><Loader2 size={16} className=\"spinner\" /> Posting...</>
              ) : (
                'Post to Board'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessBoardComposer;
