import React from 'react';
import { renderTextWithEmojis, getEmojiImageUrl } from '../../utils/renderEmojis';

/**
 * Component to render post text with inline emoji images
 * Replaces [emoji:ID] placeholders with <img> tags
 */
const PostTextWithEmojis = ({ text, className = '' }) => {
  if (!text) return null;
  
  const parts = renderTextWithEmojis(text);
  
  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index}>{part.content}</span>;
        } else if (part.type === 'emoji') {
          const imageUrl = getEmojiImageUrl(part.id);
          if (!imageUrl) {
            // Fallback: show placeholder if image URL can't be determined
            return <span key={index}>{part.placeholder}</span>;
          }
          return (
            <img
              key={index}
              src={imageUrl}
              alt={part.id}
              className="inline-block align-middle mx-1"
              style={{
                width: '40px',
                height: '40px',
                objectFit: 'contain',
                verticalAlign: 'middle'
              }}
              onError={(e) => {
                // Fallback if image fails to load
                console.warn('Failed to load emoji image:', imageUrl);
                e.target.style.display = 'none';
              }}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

export default PostTextWithEmojis;
