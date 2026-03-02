import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Video, Link2, Loader2, Smile, Send } from 'lucide-react';
import MediaUploader from './MediaUploader';
import LinkPreviewCard from './LinkPreviewCard';
import QuotedPostCard from './QuotedPostCard';
import EmojiPicker from '../emoji/EmojiPicker.jsx';
import CircleTargetSelector from './CircleTargetSelector';
import { applySkinTone } from '../../utils/emojiToneUtils';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';

/**
 * MediaComposerModal - Polished UI v2
 * Full composer modal with improved UX
 * 
 * UI Improvements:
 * - Better placeholder/guiding copy
 * - Clear disabled state with "why" message
 * - Premium Post button styling
 * - Clean visual hierarchy
 * - No layout shift
 * - Quote post support
 * - Circle-based visibility targeting (V1)
 */
const MediaComposerModal = ({ isOpen, onClose, onSubmit, initialText = '', quotedPost = null, onClearQuote }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [media, setMedia] = useState([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkMeta, setLinkMeta] = useState(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isFetchingLink, setIsFetchingLink] = useState(false);
  
  // Circle visibility state
  const [targetType, setTargetType] = useState('GLOBAL');
  const [targetCircleId, setTargetCircleId] = useState(null);
  const [minTierToView, setMinTierToView] = useState('OTHERS');
  
  const linkInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Set initial text when modal opens with emoji
  React.useEffect(() => {
    if (isOpen && initialText) {
      setText(initialText);
    }
  }, [isOpen, initialText]);

  // Focus textarea when modal opens
  React.useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

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
      }
      setShowLinkInput(false);
    } catch (error) {
      console.error('Failed to fetch link preview:', error);
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
    if (!canPost) return;

    setIsPosting(true);
    try {
      // Include focalY and fitMode with each media item
      const mediaWithFocalPoints = media.map(item => ({
        url: item.url,
        type: item.type,
        focalY: item.focalY ?? 0.5,
        fitMode: item.fitMode ?? 'cover'
      }));
      
      // Build post data with circle visibility fields
      const postData = {
        text: text.trim() || "",
        media: mediaWithFocalPoints,
        link_url: linkMeta?.url || linkUrl || null,
        link_meta: linkMeta,
        quoted_post_id: quotedPost?.id || null,
        target_type: targetType,
        min_tier_to_view: minTierToView
      };
      
      // Only include target_circle_id if posting to a circle
      if (targetType === 'CIRCLE' && targetCircleId) {
        postData.target_circle_id = targetCircleId;
      }
      
      await onSubmit(postData);

      // Reset form
      setText('');
      setMedia([]);
      setLinkUrl('');
      setLinkMeta(null);
      setTargetType('GLOBAL');
      setTargetCircleId(null);
      setMinTierToView('OTHERS');
      if (onClearQuote) onClearQuote();
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  // Determine if post button should be enabled
  const canPost = text.trim() || media.length > 0 || linkMeta || linkUrl || quotedPost;
  
  // Get disabled reason for button hint
  const getDisabledReason = () => {
    if (isPosting) return 'Posting...';
    if (!canPost) return 'Add text, photo, or link to post';
    return '';
  };

  const displayName = user?.name || user?.display_name || 'User';

  // Handle circle target change
  const handleTargetChange = ({ target_type, target_circle_id, min_tier_to_view }) => {
    setTargetType(target_type);
    setTargetCircleId(target_circle_id);
    setMinTierToView(min_tier_to_view);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Create Post</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Author Info + Circle Target */}
        <div className="px-5 py-3 border-b border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <ProfileAvatar 
              name={displayName}
              avatarUrl={user?.profile?.avatar_url || user?.avatar_url}
              size="sm"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">{displayName}</p>
            </div>
          </div>
          {/* Circle Target Selector */}
          <CircleTargetSelector
            targetType={targetType}
            targetCircleId={targetCircleId}
            minTierToView={minTierToView}
            onTargetChange={handleTargetChange}
          />
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent text-card-foreground text-base leading-relaxed resize-none focus:outline-none placeholder:text-muted-foreground/60 min-h-[120px]"
            placeholder="What's happening in your world? Share a thought, story, or update with the community..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            rows={5}
          />

          {/* Media Uploader */}
          <MediaUploader media={media} setMedia={setMedia} />

          {/* Quoted Post Preview */}
          {quotedPost && (
            <div className="mt-4">
              <QuotedPostCard 
                quotedPost={{
                  id: quotedPost.id,
                  author_name: quotedPost.author?.display_name || 'Unknown',
                  author_avatar: quotedPost.author?.avatar_url,
                  text: quotedPost.text,
                  media_url: quotedPost.media?.[0]?.url || quotedPost.media_urls?.[0],
                  created_at: quotedPost.created_at
                }}
                isPreview={true}
                onRemove={onClearQuote}
              />
            </div>
          )}

          {/* Link Preview - Rich */}
          {linkMeta && (
            <div className="mt-4">
              <LinkPreviewCard linkMeta={linkMeta} onRemove={handleRemoveLink} />
            </div>
          )}

          {/* Link Preview - Fallback (URL only) */}
          {!linkMeta && linkUrl && !showLinkInput && (
            <div className="mt-4 relative border border-border rounded-xl overflow-hidden bg-muted/50">
              <button
                onClick={handleRemoveLink}
                className="absolute top-3 right-3 z-10 p-1.5 bg-background/90 hover:bg-background rounded-full border border-border transition-colors"
                title="Remove link"
              >
                <X size={14} className="text-muted-foreground" />
              </button>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Link2 size={20} className="text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Link attached</p>
                    <p className="text-sm text-card-foreground truncate">{linkUrl}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Link Input Field */}
          {showLinkInput && (
            <div className="mt-4 flex gap-2 p-3 bg-muted/50 rounded-xl">
              <input
                ref={linkInputRef}
                type="url"
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                placeholder="Paste a link URL..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
              />
              <button
                className="px-4 py-2 bg-amber-500 text-gray-900 font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleAddLink}
                disabled={isFetchingLink || !linkUrl.trim()}
              >
                {isFetchingLink ? <Loader2 size={16} className="animate-spin" /> : 'Add'}
              </button>
            </div>
          )}
        </div>

        {/* Footer Toolbar */}
        <div className="px-5 py-3 border-t border-border bg-muted/30">
          {/* Toolbar Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Photo */}
              <button
                className="p-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-green-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => document.getElementById('media-file-input')?.click()}
                disabled={media.length >= 4}
                title={media.length >= 4 ? 'Maximum 4 images' : 'Add Photo'}
              >
                <ImageIcon size={20} />
              </button>

              {/* Video */}
              <button
                className="p-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => document.getElementById('media-file-input')?.click()}
                disabled={media.length >= 1 && media[0]?.type === 'video'}
                title="Add Video"
              >
                <Video size={20} />
              </button>

              {/* Link */}
              <button
                className="p-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-purple-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => {
                  setShowLinkInput(!showLinkInput);
                  setTimeout(() => linkInputRef.current?.focus(), 100);
                }}
                disabled={!!linkMeta || !!linkUrl}
                title={linkMeta || linkUrl ? 'Link already added' : 'Add Link'}
              >
                <Link2 size={20} />
              </button>

              {/* Emoji */}
              <div className="relative">
                <button
                  className="p-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-amber-500 transition-colors"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Add Emoji"
                >
                  <Smile size={20} />
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 z-50">
                    <EmojiPicker
                      onSelect={(emoji) => {
                        // Get the unicode character from the emoji object
                        // Priority: emoji.char (native unicode), then emoji.native, then emoji.emoji
                        let emojiChar = emoji.char || emoji.native || emoji.emoji || '';
                        
                        // Apply skin tone if supported
                        if (emojiChar && emoji.supportsSkinTone) {
                          const userSkinTone = user?.emoji_identity?.skinTone || 'tone4';
                          emojiChar = applySkinTone(emojiChar, userSkinTone, true);
                        }
                        
                        // Insert at cursor position
                        if (textareaRef.current && emojiChar) {
                          const start = textareaRef.current.selectionStart;
                          const end = textareaRef.current.selectionEnd;
                          const newText = text.substring(0, start) + emojiChar + text.substring(end);
                          setText(newText);
                          setTimeout(() => {
                            if (textareaRef.current) {
                              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + emojiChar.length;
                              textareaRef.current.focus();
                            }
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

            {/* Right side: Character count + Post button */}
            <div className="flex items-center gap-4">
              {/* Character count */}
              <span className={`text-xs tabular-nums ${text.length > 900 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                {text.length}/1000
              </span>

              {/* Post Button with disabled state hint */}
              <div className="relative group">
                <button
                  className="px-5 py-2.5 bg-amber-500 text-gray-900 font-semibold rounded-xl hover:bg-amber-600 active:bg-amber-700 transition-all disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                  onClick={handlePost}
                  disabled={isPosting || !canPost}
                  data-testid="composer-post-btn"
                >
                  {isPosting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Post</span>
                    </>
                  )}
                </button>
                
                {/* Disabled state tooltip */}
                {!canPost && !isPosting && (
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-foreground text-background text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {getDisabledReason()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaComposerModal;
