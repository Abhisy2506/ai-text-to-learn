import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import './unsavedChangesModal.css';

export default function UnsavedChangesModal({
  title = 'Course Generation in Progress',
  description = 'Lessons are currently being generated. If you leave now, the remaining lessons will not be generated.',
  confirmText = 'Leave Anyway',
  cancelText = 'Stay & Continue',
} = {}) {
  const { showUnsavedModal, onCancelLeave, onConfirmLeave } = useCourse();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancelLeave?.();
      }
    };

    if (showUnsavedModal) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUnsavedModal, onCancelLeave]);

  if (!showUnsavedModal) return null;

  return createPortal(
    <div className="unsaved-modal-overlay" onClick={onCancelLeave}>
      <div
        className="unsaved-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-modal-title"
      >
        <div className="unsaved-modal-icon-wrapper">
          <AlertTriangle className="unsaved-modal-icon" />
        </div>

        <h3 id="unsaved-modal-title" className="unsaved-modal-title">
          {title}
        </h3>
        <p className="unsaved-modal-description">{description}</p>

        <div className="unsaved-modal-actions">
          <button
            type="button"
            className="unsaved-modal-btn unsaved-modal-btn-cancel"
            onClick={onCancelLeave}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="unsaved-modal-btn unsaved-modal-btn-confirm"
            onClick={onConfirmLeave}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
