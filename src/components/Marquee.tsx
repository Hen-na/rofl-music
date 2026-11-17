import { useEffect, useRef, type CSSProperties } from 'react';
import { useInView } from '../hooks/useInView';
import { useFinePointer, useReducedMotion } from '../hooks/useMediaQuery';
import { isParty } from '../lib/party';
import './Marquee.css';

interface MarqueeProps {
  items: readonly string[];
  tone?: 'red' | 'outline' | 'teal';
  /** наклон ленты, градусы */
  tilt?: number;
  reverse?: boolean;
  /** базовая скорость, px/с */
  speed?: number;
}

/** Мини-эквалайзер из логотипа как разделитель. */
function Bars() {
  return (
    <svg className="marquee__bars" viewBox="0 0 239 231" aria-hidden="true">
      {[
        [0, 9],
        [64, 12],
        [127, 6],
        [191, 8],
      ].map(([x, rows]) => (
        <rect key={x} x={x} y={231 - rows * 19} width="48" height={rows * 19} rx="6" />
      ))}
    </svg>
  );
}

/**
 * Наклонная бегущая строка. На устройствах с мышью скорость и направление зависят от прокрутки,
 * при наведении лента плавно останавливается. Декоративная — скрыта от экранных чтецов.
 */
export function Marquee({ items, tone = 'red', tilt = -3, reverse = false, speed = 70 }: MarqueeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const inView = useInView(wrapRef, { rootMargin: '120px 0px' });

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!inView || !wrap || !track) return;
    const band = track.parentElement!;

    const group = track.firstElementChild as HTMLElement;
    let width = group.offsetWidth;
    const ro = new ResizeObserver(() => (width = group.offsetWidth));
    ro.observe(group);

    let hover = false;
    const enter = () => (hover = fine);
    const leave = () => (hover = false);
    wrap.addEventListener('pointerenter', enter);
    wrap.addEventListener('pointerleave', leave);

    const baseDir = reverse ? 1 : -1;
    let x = Number(track.dataset.x ?? -width / 2);
    let scrollDir = 1;
    let boost = 0;
    let velocity = baseDir * speed;
    let lastScroll = window.scrollY;
    let last = performance.now();
    let raf = 0;
    let drag: { id: number; x: number } | null = null;
    const manual = fine;
    let pending = 0;

    const render = () => {
      if (width > 0) x = ((x % width) + width) % width - width;
      track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
      track.dataset.x = String(x);
    };
    const wheel = (event: WheelEvent) => {
      if (!manual || event.ctrlKey) return;
      event.preventDefault();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      velocity = 0;
      if (reduced) {
        x -= delta * scale;
        render();
      } else {
        pending -= delta * scale;
      }
    };
    const down = (event: PointerEvent) => {
      const mouse = event.pointerType === 'mouse' && manual && event.button === 0;
      const touch = event.pointerType === 'touch' && event.isPrimary;
      if (!mouse && !touch) return;
      drag = { id: event.pointerId, x: event.clientX };
      velocity = 0;
      band.setPointerCapture(event.pointerId);
      band.classList.add('is-dragging');
      if (mouse) event.preventDefault();
    };
    const move = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const delta = event.clientX - drag.x;
      drag.x = event.clientX;
      velocity = 0;
      if (reduced) {
        x += delta;
        render();
      } else {
        pending += delta;
      }
    };
    const end = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      drag = null;
      band.classList.remove('is-dragging');
      if (band.hasPointerCapture(event.pointerId)) band.releasePointerCapture(event.pointerId);
    };
    band.addEventListener('wheel', wheel, { passive: false });
    band.addEventListener('pointerdown', down);
    band.addEventListener('pointermove', move);
    band.addEventListener('pointerup', end);
    band.addEventListener('pointercancel', end);
    band.addEventListener('lostpointercapture', end);

    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const sy = window.scrollY;
      const ds = sy - lastScroll;
      lastScroll = sy;
      if (fine && Math.abs(ds) > 0.5) scrollDir = ds > 0 ? 1 : -1;
      boost = fine ? boost * 0.9 + Math.min(80, Math.abs(ds)) * 0.1 : 0;

      const target = hover || drag || Math.abs(pending) > 0.1 ? 0 : baseDir * scrollDir * (speed + boost * 40) * (isParty() ? 4 : 1);
      velocity += (target - velocity) * (1 - Math.exp(-5 * dt));
      x += velocity * dt;
      const step = pending * (1 - Math.exp(-14 * dt));
      x += step;
      pending -= step;
      if (Math.abs(pending) < 0.01) {
        x += pending;
        pending = 0;
      }
      render();
      raf = requestAnimationFrame(tick);
    };
    if (reduced) render();
    else raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener('pointerenter', enter);
      wrap.removeEventListener('pointerleave', leave);
      band.removeEventListener('wheel', wheel);
      band.removeEventListener('pointerdown', down);
      band.removeEventListener('pointermove', move);
      band.removeEventListener('pointerup', end);
      band.removeEventListener('pointercancel', end);
      band.removeEventListener('lostpointercapture', end);
      band.classList.remove('is-dragging');
    };
  }, [reduced, inView, reverse, speed, fine, tone]);

  const repeated = [...items, ...items, ...items];

  return (
    <div
      ref={wrapRef}
      className={`marquee marquee--${tone}`}
      style={{ '--tilt': `${tilt}deg` } as CSSProperties}
      aria-hidden="true"
    >
      <div className="marquee__band">
        <div ref={trackRef} className="marquee__track">
          {[0, 1].map((copy) => (
            <div key={copy} className="marquee__group">
              {repeated.map((item, i) => (
                <span key={i} className="marquee__item">
                  <span className="marquee__text">{item}</span>
                  <Bars />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
