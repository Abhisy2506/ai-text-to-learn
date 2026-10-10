import { createPortal } from 'react-dom';
import { useEffect } from 'react';

export default function DeleteCourse({ isOpen, onClose, onConfirm }) {

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
    <div className="delete-modal-overlay" onClick={onClose}>
      <div className="delete-modal-content" onClick={(e)=>{e.stopPropagation()}}>
        <h3 className="delete-modal-title">Delete chat?</h3>
        <p className="delete-modal-desc">
          This will delete prompts, responses from your Apps activity, plus any content that you created.
        </p>
        <div className="delete-modal-actions">
          <button className="delete-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="delete-confirm-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}