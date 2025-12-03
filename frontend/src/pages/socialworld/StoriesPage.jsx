import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * BANIBS Stories - Daily highlights & ephemeral content
 * Placeholder for Phase 2
 */
const StoriesPage = () => {
  const navigate = useNavigate();

  return (
    <FullWidthLayout>
      <div className="socialworld-placeholder" data-theme="dark">
        <button className="back-button" onClick={() => navigate('/socialworld')}>
          <ArrowLeft size={20} />
          <span>Back to Social World</span>
        </button>
        
        <div className="placeholder-content">
          <div className="placeholder-icon-wrapper bg-gradient-to-br from-blue-500 to-purple-500">
            <BookOpen size={64} />
          </div>
          <h1 className="placeholder-title">Stories</h1>
          <p className="placeholder-description">
            Share your daily highlights with stories that disappear after 24 hours.
            Stay connected with what's happening now.
          </p>
          <div className="coming-soon-badge">
            Coming Soon in Phase 2
          </div>
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default StoriesPage;