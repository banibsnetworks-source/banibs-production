import React from 'react';
import { useNavigate } from 'react-router-dom';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import { ArrowLeft } from 'lucide-react';
import GroupsPage from '../portal/social/GroupsPage';

/**
 * BANIBS Circles - Groups & Communities
 * Integrates existing Groups functionality into Social World
 */
const CirclesPage = () => {
  const navigate = useNavigate();

  return (
    <FullWidthLayout>
      <div className="socialworld-integrated-page" data-theme="dark">
        <div className="integrated-header">
          <button className="back-button" onClick={() => navigate('/socialworld')}>
            <ArrowLeft size={20} />
            <span>Back to Social World</span>
          </button>
        </div>
        {/* Integrate existing Groups component */}
        <GroupsPage />
      </div>
    </FullWidthLayout>
  );
};

export default CirclesPage;