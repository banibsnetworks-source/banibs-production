import React from 'react';
import SocialLayout from '../../components/social/SocialLayout';
import { Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SocialDiscoverPeoplePage = () => {
  return (
    <SocialLayout>
      <div className="empty-state-v2 showcase-clean-bg page-enter" data-mode="social">
        <div className="empty-state-icon">
          <Users size={80} className="text-primary-v2" strokeWidth={1.5} />
        </div>
        <h1 className="empty-state-title">
          Discover People
        </h1>
        <p className="empty-state-description">
          Find and connect with people in the BANIBS community.
        </p>
        <span className="toggle-v2 active">
          Coming Soon
        </span>
      </div>
    </SocialLayout>
  );
};

export default SocialDiscoverPeoplePage;
