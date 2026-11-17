import { useEffect, useState, type RefObject } from 'react';

interface Options {
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
}

/** Виден ли элемент. Используется, чтобы запускать и останавливать анимации. */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { once = false, rootMargin = '0px', threshold = 0 }: Options = {},
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, rootMargin, threshold]);

  return inView;
}
