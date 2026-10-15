import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Lock } from 'lucide-react';
import './loginModal.css';

export default function LoginModal({ isOpen, onClose }) {
  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="login-modal-overlay" onClick={onClose}>
      <div 
        className="login-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="login-modal-icon-wrapper">
          <Lock className="login-modal-icon" />
        </div>

        <h3 className="login-modal-title">Authentication Required</h3>
        <p className="login-modal-description">
          Please log in first to generate custom AI courses and chat with our assistant.
        </p>

        <div className="login-modal-actions">
          <button 
            type="button"
            className="login-modal-btn login-modal-btn-cancel" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button"
            className="login-modal-btn login-modal-btn-primary" 
            onClick={() => loginWithRedirect()}
          >
            Log In
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}