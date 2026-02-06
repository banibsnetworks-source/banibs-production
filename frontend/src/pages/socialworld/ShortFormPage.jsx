import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PulsePageOriginal from '../shortform/ShortFormPage';

/**
 * BANIBS Pulse - Integrated into Social World
 * CANONICAL NAME: Pulse (locked)
 * Short-form vertical video platform
 */
const PulsePage = () => {
  const navigate = useNavigate();

  return (
    <div className="socialworld-pulse-wrapper" data-theme="dark">
      <div className="socialworld-pulse-header">
        <button className="back-button" onClick={() => navigate('/socialworld')}>
          <ArrowLeft size={20} />
          <span>Back to Social World</span>
        </button>
      </div>
      {/* Integrate existing Pulse component */}
      <PulsePageOriginal />
    </div>
  );
};

export default PulsePage;
