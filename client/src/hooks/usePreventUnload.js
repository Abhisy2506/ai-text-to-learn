import { useEffect } from 'react';

/**
 * Prevents accidental tab close or reload when background work is running.
 */
export default function usePreventUnload(isWorkInProgress, abortControllerRef) {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isWorkInProgress) {
        if (abortControllerRef?.current) {
          abortControllerRef.current.abort();
        }
        event.preventDefault();
        event.returnValue = '';
        return '';
      }
    };

    if (isWorkInProgress) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isWorkInProgress, abortControllerRef]);
}