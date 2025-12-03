import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import { Radio, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * BANIBS LiveCircle - Live streaming platform
 * Placeholder for Phase 2
 */
const LiveCirclePage = () => {
  const navigate = useNavigate();

  return (
    <FullWidthLayout>
      <div className="socialworld-placeholder" data-theme="dark">
        <button className="back-button" onClick={() => navigate('/socialworld')}>
          <ArrowLeft size={20} />
          <span>Back to Social World</span>
        </button>
        
        <div className="placeholder-content">
          <div className="placeholder-icon-wrapper bg-gradient-to-br from-red-500 to-orange-500">
            <Radio size={64} />
          </div>
          <h1 className="placeholder-title">LiveCircle</h1>
          <p className="placeholder-description">
            Go live with your community. Stream events, share experiences,
            and connect in real-time with your audience.
          </p>
          <div className="coming-soon-badge">
            Coming Soon in Phase 2
          </div>
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default LiveCirclePage;