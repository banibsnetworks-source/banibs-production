import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import './LinkPreviewCard.css';

const LinkPreviewCard = ({ linkMeta, onRemove }) => {
  if (!linkMeta) return null;

  return (
    <div className="link-preview-card">
      <button className="link-remove-btn" onClick={onRemove}>
        <X size={16} />
      </button>

      {linkMeta.image && (
        <div className="link-image-container">
          <img src={linkMeta.image} alt={linkMeta.title} className="link-image" />
        </div>
      )}

      <div className="link-content">
        <div className="link-site">
          <ExternalLink size={14} />
          <span>{linkMeta.site}</span>
        </div>
        <h3 className="link-title">{linkMeta.title}</h3>
        {linkMeta.description && (
          <p className="link-description">{linkMeta.description}</p>
        )}
      </div>
    </div>
  );
};

export default LinkPreviewCard;
