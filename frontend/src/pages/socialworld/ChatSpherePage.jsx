import React from 'react';
import { useNavigate } from 'react-router-dom';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import { ArrowLeft } from 'lucide-react';
import { MessagesPage } from '../social/messages/MessagesPage';

/**
 * BANIBS ChatSphere - Direct messaging system
 * Integrates existing Messages functionality into Social World
 */
const ChatSpherePage = () => {
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
        {/* Integrate existing Messages component */}
        <MessagesPage />
      </div>
    </FullWidthLayout>
  );
};

export default ChatSpherePage;