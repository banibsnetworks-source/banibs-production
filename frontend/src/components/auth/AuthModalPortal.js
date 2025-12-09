import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import AuthModal from '../AuthModal';

/**
 * AuthModalPortal
 * Renders AuthModal in a React Portal at document.body level
 * This prevents any parent container from clipping or interfering with the modal
 */
const AuthModalPortal = ({ isOpen, onClose, onSuccess, defaultTab = 'signin' }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !isOpen) return null;

  return ReactDOM.createPortal(
    <AuthModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      defaultTab={defaultTab}
    />,
    document.body
  );
};

export default AuthModalPortal;
