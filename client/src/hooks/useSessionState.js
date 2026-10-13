import { useState, useEffect } from 'react';

/**
 * React state with sessionStorage.
 * @param {string} key - The sessionStorage key.
 * @param {any} defaultValue - Initial fallback value.
 */
export default function useSessionState(key, defaultValue = null) {
  const [state, setState] = useState(() => {
    try {
      const saved = sessionStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (err) {
      console.warn(`Error reading sessionStorage key "${key}":`, err);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      if (state !== null && state !== undefined) {
        sessionStorage.setItem(key, JSON.stringify(state));
      } else {
        sessionStorage.removeItem(key);
      }
    } catch (err) {
      console.warn(`Error writing sessionStorage key "${key}":`, err);
    }
  }, [key, state]);

  return [state, setState];
}