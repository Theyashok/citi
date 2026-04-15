import { useState, useEffect } from 'react';

/**
 * useDebounce hook
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in ms
 * @returns {any} - Debounced value
 */
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
