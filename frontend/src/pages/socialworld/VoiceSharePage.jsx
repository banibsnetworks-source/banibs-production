import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import { Mic, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * BANIBS VoiceShare - Audio clips & podcasts
 * Placeholder for Phase 2
 */
const VoiceSharePage = () => {
  const navigate = useNavigate();

  return (
    <FullWidthLayout>
      <div className="socialworld-placeholder" data-theme="dark">
        <button className="back-button" onClick={() => navigate('/socialworld')}>
          <ArrowLeft size={20} />
          <span>Back to Social World</span>
        </button>
        
        <div className="placeholder-content">
          <div className="placeholder-icon-wrapper bg-gradient-to-br from-yellow-500 to-orange-500">
            <Mic size={64} />
          </div>
          <h1 className="placeholder-title">VoiceShare</h1>
          <p className="placeholder-description">
            Share your voice. Record audio clips, create podcasts,
            and connect through the power of spoken word.
          </p>
          <div className="coming-soon-badge">
            Coming Soon in Phase 2
          </div>
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default VoiceSharePage;