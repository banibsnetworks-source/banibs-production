import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import { Image, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * BANIBS Frames - Image-forward visual storytelling
 * CANONICAL NAME: Frames (locked)
 * Placeholder for Phase 2
 */
const FramesPage = () => {
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
          <h1 className="placeholder-title">Frames</h1>
          <p className="placeholder-description">
            Share your visual stories through beautiful image-forward posts.
            Connect with friends and discover inspiring content.
          </p>
          <div className="coming-soon-badge">
            Coming Soon
          </div>
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default FramesPage;
