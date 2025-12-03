import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import { Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * BANIBS Connections - Social feed from your network
 * Placeholder for Phase 2
 */
const ConnectionsPage = () => {
  const navigate = useNavigate();

  return (
    <FullWidthLayout>
      <div className="socialworld-placeholder" data-theme="dark">
        <button className="back-button" onClick={() => navigate('/socialworld')}>
          <ArrowLeft size={20} />
          <span>Back to Social World</span>
        </button>
        
        <div className="placeholder-content">
          <div className="placeholder-icon-wrapper bg-gradient-to-br from-cyan-500 to-blue-500">
            <Users size={64} />
          </div>
          <h1 className="placeholder-title">Connections Feed</h1>
          <p className="placeholder-description">
            See what's happening in your network. Updates, posts, and activities
            from people you're connected with.
          </p>
          <div className="coming-soon-badge">
            Coming Soon in Phase 2
          </div>
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default ConnectionsPage;