import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * BANIBS Notes - Short written thoughts and reflections
 * CANONICAL NAME: Notes (locked)
 * Placeholder for Phase 2
 */
const NotesPage = () => {
  const navigate = useNavigate();

  return (
    <FullWidthLayout>
      <div className="socialworld-placeholder" data-theme="dark">
        <button className="back-button" onClick={() => navigate('/socialworld')}>
          <ArrowLeft size={20} />
          <span>Back to Social World</span>
        </button>
        
        <div className="placeholder-content">
          <div className="placeholder-icon-wrapper bg-gradient-to-br from-blue-500 to-indigo-500">
            <FileText size={64} />
          </div>
          <h1 className="placeholder-title">Notes</h1>
          <p className="placeholder-description">
            Share your reflections, thoughts, and short-form text content.
            Express yourself through the written word.
          </p>
          <div className="coming-soon-badge">
            Coming Soon
          </div>
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default NotesPage;
