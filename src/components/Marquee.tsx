import { useEffect, useRef, type CSSProperties } from 'react';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useMediaQuery';
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
 * Наклонная бегущая строка. Скорость и направление зависят от прокрутки,
 * при наведении лента плавно останавливается. Декоративная — скрыта от экранных чтецов.
 */
export function Marquee({ items, tone = 'red', tilt = -3, reverse = false, speed = 70 }: MarqueeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(wrapRef, { rootMargin: '120px 0px' });

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (reduced || !inView || !wrap || !track) return;

    const group = track.firstElementChild as HTMLElement;
    let width = group.offsetWidth;
    const ro = new ResizeObserver(() => (width = group.offsetWidth));
    ro.observe(group);

    let hover = false;
    const enter = () => (hover = true);
    const leave = () => (hover = false);
    wrap.addEventListener('pointerenter', enter);
    wrap.addEventListener('pointerleave', leave);

    const baseDir = reverse ? 1 : -1;
    let x = Number(track.dataset.x ?? -width / 2);
    let scrollDir = 1;
    let boost = 0;
    let velocity = speed;
    let lastScroll = window.scrollY;
    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const sy = window.scrollY;
      const ds = sy - lastScroll;
      lastScroll = sy;
      if (ds !== 0) scrollDir = ds > 0 ? 1 : -1;
      boost = boost * 0.9 + Math.min(80, Math.abs(ds)) * 0.1;

      const target = hover ? 0 : (speed + boost * 40) * (isParty() ? 4 : 1);
      velocity += (target - velocity) * 0.08;
      x += baseDir * scrollDir * velocity * dt;
      if (width > 0) x = ((x % width) + width) % width - width;
      track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
      track.dataset.x = String(x);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener('pointerenter', enter);
      wrap.removeEventListener('pointerleave', leave);
    };
  }, [reduced, inView, reverse, speed]);

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
