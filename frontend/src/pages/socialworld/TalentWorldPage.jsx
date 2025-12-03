import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * BANIBS TalentWorld - Creator hub & monetization tools
 * Placeholder for Phase 2
 */
const TalentWorldPage = () => {
  const navigate = useNavigate();

  return (
    <FullWidthLayout>
      <div className="socialworld-placeholder" data-theme="dark">
        <button className="back-button" onClick={() => navigate('/socialworld')}>
          <ArrowLeft size={20} />
          <span>Back to Social World</span>
        </button>
        
        <div className="placeholder-content">
          <div className="placeholder-icon-wrapper bg-gradient-to-br from-amber-500 to-yellow-500">
            <Sparkles size={64} />
          </div>
          <h1 className="placeholder-title">TalentWorld</h1>
          <p className="placeholder-description">
            Your creator hub. Access tools, analytics, and monetization features
            to grow your influence and earn from your content.
          </p>
          <div className="coming-soon-badge">
            Coming Soon in Phase 2
          </div>
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default TalentWorldPage;