import { useEffect } from 'react';
import { API_BASE } from '../services/api';

/**
 * Prevents accidental tab close or reload while course generation is running,
 * and notifies the backend to mark remaining lessons as stopped if the user departs.
 */
export default function usePreventUnload(isWorkInProgress, abortControllerRef, activeCourseId) {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isWorkInProgress) {
        event.preventDefault();
        event.returnValue = '';
        return '';
      }
    };

    const handlePageHide = () => {
      if (isWorkInProgress) {
        if (abortControllerRef?.current) {
          abortControllerRef.current.abort();
        }

        if (activeCourseId) {
          const stopUrl = `${API_BASE}/lessons/course/${activeCourseId}/stop`;
          if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon(stopUrl);
          } else {
            fetch(stopUrl, {
              method: 'POST',
              keepalive: true,
            }).catch(() => {});
          }
        }
      }
    };

    if (isWorkInProgress) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('pagehide', handlePageHide);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isWorkInProgress, abortControllerRef, activeCourseId]);
}