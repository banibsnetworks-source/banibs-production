import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import { Image, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * BANIBS Moments - Photo feed & stories
 * Placeholder for Phase 2
 */
const MomentsPage = () => {
  const navigate = useNavigate();

  return (
    <FullWidthLayout>
      <div className="socialworld-placeholder" data-theme="dark">
        <button className="back-button" onClick={() => navigate('/socialworld')}>
          <ArrowLeft size={20} />
          <span>Back to Social World</span>
        </button>
        
        <div className="placeholder-content">
          <div className="placeholder-icon-wrapper bg-gradient-to-br from-purple-500 to-pink-500">
            <Image size={64} />
          </div>
          <h1 className="placeholder-title">Moments</h1>
          <p className="placeholder-description">
            Share your life's moments through photos and visual stories.
            Connect with friends and discover inspiring content.
          </p>
          <div className="coming-soon-badge">
            Coming Soon in Phase 2
          </div>
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default MomentsPage;