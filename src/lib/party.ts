import { useEffect, useSyncExternalStore } from 'react';

/**
 * Пасхалка «party mode»: набрать «rofl» на клавиатуре или 5 раз кликнуть по логотипу в шапке.
 * На несколько секунд меняет акцентные цвета местами и выкручивает эквалайзеры.
 */
const DURATION = 4500;
const listeners = new Set<() => void>();
let active = false;
let timer: number | undefined;

const emit = () => listeners.forEach((l) => l());

export function triggerParty() {
  active = true;
  document.documentElement.classList.add('is-party');
  emit();
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    active = false;
    document.documentElement.classList.remove('is-party');
    emit();
  }, DURATION);
}

export const isParty = () => active;

export function useParty() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => active,
    () => false,
  );
}

/** Слушает клавиатуру: «rofl» (и то же в русской раскладке — «кщад»). */
export function usePartyShortcut() {
  useEffect(() => {
    let buffer = '';
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable="true"]')) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-4);
      if (buffer === 'rofl' || buffer === 'кщад') {
        buffer = '';
        triggerParty();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/** Возвращает обработчик клика: 5 кликов за 2 секунды запускают пасхалку. */
export function createClickCounter(count = 5, windowMs = 2000) {
  let clicks: number[] = [];
  return () => {
    const now = performance.now();
    clicks = [...clicks.filter((t) => now - t < windowMs), now];
    if (clicks.length >= count) {
      clicks = [];
      triggerParty();
    }
  };
}
