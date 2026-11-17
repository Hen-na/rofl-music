import { useSyncExternalStore } from 'react';

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
export const FINE_POINTER = '(hover: hover) and (pointer: fine)';

export function matches(query: string) {
  return typeof window !== 'undefined' && window.matchMedia(query).matches;
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMediaQuery(REDUCED_MOTION);
export const useFinePointer = () => useMediaQuery(FINE_POINTER);
