import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ShortFormPageOriginal from '../shortform/ShortFormPage';

/**
 * BANIBS ShortForm - Integrated into Social World
 * Wraps the existing ShortForm page with Social World navigation
 */
const ShortFormPage = () => {
  const navigate = useNavigate();

  return (
    <div className="socialworld-shortform-wrapper" data-theme="dark">
      <div className="socialworld-shortform-header">
        <button className="back-button" onClick={() => navigate('/socialworld')}>
          <ArrowLeft size={20} />
          <span>Back to Social World</span>
        </button>
      </div>
      {/* Integrate existing ShortForm component */}
      <ShortFormPageOriginal />
    </div>
  );
};

export default ShortFormPage;
