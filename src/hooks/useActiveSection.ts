import { useEffect, useState } from 'react';

/** id секции, которая сейчас пересекает середину экрана ('' — первый экран). */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('');
  const key = ids.join('|');

  useEffect(() => {
    const visible = new Set<string>();
    const order = key.split('|');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
        setActive(order.find((id) => visible.has(id)) ?? '');
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    order.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [key]);

  return active;
}
