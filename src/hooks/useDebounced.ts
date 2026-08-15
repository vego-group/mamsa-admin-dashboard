'use client';

import { useEffect, useState } from 'react';

/**
 * Trails `value` by `delay`, so a field the user is still typing into fires one request
 * instead of one per keystroke. The input stays controlled by the immediate value —
 * only the query reads the debounced one, which keeps typing responsive.
 */
export function useDebounced<T>(value: T, delay = 300): T {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return settled;
}
