import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, MapPin, Calendar } from 'lucide-react';
import './BusinessBoardPostCard.css';

const CATEGORY_LABELS = {
  'hiring': '💼 Hiring',
  'partnership': '🤝 Partnership',
  'funding': '💰 Funding',
  'event': '📅 Event',
  'service': '⚙️ Service',
  'announcement': '📢 Announcement',
  'collaboration': '🔗 Collaboration',
  'opportunity': '✨ Opportunity'
};

const BusinessBoardPostCard = ({ post }) => {
  const navigate = useNavigate();

  const formatTimestamp = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  return (
    <div 
      className=\"board-post-card\"
      style={{'--accent-color': post.business.accent_color}}
    >
      {/* Header with Business Info */}
      <div 
        className=\"post-header\"
        onClick={() => navigate(`/portal/business/${post.business.id}`)}
        style={{ cursor: 'pointer' }}
      >
        {/* Logo */}
        <div className=\"business-logo\">
          {post.business.logo ? (
            <img
              src={`${process.env.REACT_APP_BACKEND_URL}${post.business.logo}`}
              alt={post.business.name}
            />
          ) : (
            <div 
              className=\"logo-placeholder\"
              style={{background: post.business.accent_color}}
            >
              {post.business.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Business Info */}
        <div className=\"business-info\">
          <h3>{post.business.name}</h3>
          <div className=\"post-meta\">
            <span className=\"category-badge\">
              {CATEGORY_LABELS[post.category] || post.category}
            </span>
            <span className=\"separator\">•</span>
            <span className=\"timestamp\">{formatTimestamp(post.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className=\"post-content\">
        <p>{post.text}</p>

        {/* Media Grid */}
        {post.media && post.media.length > 0 && (
          <div className={`media-grid media-grid-${post.media.length}`}>
            {post.media.map((item, index) => (
              <div key={index} className=\"media-item\">
                {item.type === 'image' ? (
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}${item.url}`}
                    alt={`Post media ${index + 1}`}
                  />
                ) : (
                  <video
                    src={`${process.env.REACT_APP_BACKEND_URL}${item.url}`}
                    controls
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Link Preview */}
        {post.link_meta && (
          <a
            href={post.link_meta.url}
            target=\"_blank\"
            rel=\"noopener noreferrer\"
            className=\"link-preview\"
          >
            {post.link_meta.image && (
              <div className=\"link-image\">
                <img src={post.link_meta.image} alt={post.link_meta.title} />
              </div>
            )}
            <div className=\"link-content\">
              <p className=\"link-site\">{post.link_meta.site}</p>
              <h4>{post.link_meta.title}</h4>
              {post.link_meta.description && (
                <p className=\"link-description\">{post.link_meta.description}</p>
              )}
            </div>
            <ExternalLink size={16} className=\"external-icon\" />
          </a>
        )}
      </div>

      {/* Footer Action */}
      <div className=\"post-footer\">
        <button
          className=\"view-profile-btn\"
          onClick={() => navigate(`/portal/business/${post.business.id}`)}
        >
          View Business Profile
        </button>
      </div>
    </div>
  );
};

export default BusinessBoardPostCard;
