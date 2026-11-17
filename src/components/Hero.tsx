import { useRef, useState, type PointerEvent } from 'react';
import { ArrowDown } from 'lucide-react';
import { LedCanvas } from './LedCanvas';
import { LiveLogo } from './LiveLogo';
import { RollText, SplitWords } from './SplitText';
import { site } from '../data/site';
import { useInView } from '../hooks/useInView';
import { useFinePointer, useReducedMotion } from '../hooks/useMediaQuery';
import { addEnergy, createSignal } from '../lib/signal';
import './Hero.css';

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [signal] = useState(createSignal);
  const inView = useInView(heroRef);
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const last = useRef({ x: 0, y: 0, t: 0 });
  const parallaxRaf = useRef(0);

  const locate = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, w: rect.width, h: rect.height };
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (reduced) return;
    const { x, y, w, h } = locate(e);
    const now = performance.now();
    const p = last.current;
    const dt = Math.max(16, now - p.t);
    const speed = Math.hypot(x - p.x, y - p.y) / dt; // px/ms
    last.current = { x, y, t: now };

    signal.x = x;
    signal.y = y;
    signal.u = x / w;
    signal.inside = true;
    addEnergy(signal, Math.min(0.25, speed * 0.05), now);

    const el = e.currentTarget;
    cancelAnimationFrame(parallaxRaf.current);
    parallaxRaf.current = requestAnimationFrame(() => {
      el.style.setProperty('--px', (x / w - 0.5).toFixed(3));
      el.style.setProperty('--py', (y / h - 0.5).toFixed(3));
    });
  };

  const onPointerLeave = () => {
    signal.inside = false;
  };

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (reduced || (e.target as HTMLElement).closest('a, button')) return;
    const { x, y } = locate(e);
    const now = performance.now();
    signal.dropAt = now;
    signal.dropX = x;
    signal.dropY = y;
    addEnergy(signal, 0.8, now);
  };

  const animate = !reduced;

  return (
    <section
      id="top"
      ref={heroRef}
      className="hero"
      aria-labelledby="hero-title"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
    >
      <LedCanvas signal={signal} active={inView} animate={animate} />

      <div className="container hero__inner">
        <h1 id="hero-title" className="hero__title">
          <LiveLogo signal={signal} active={inView} animate={animate} className="hero__logo" />
        </h1>

        <p className="hero__tagline display">
          <SplitWords text={site.tagline} />
        </p>

        <div className="hero__actions">
          <a className="button button--primary" href="#releases">
            <RollText text="Релизы" />
          </a>
          <a className="button button--ghost" href="#contact">
            <RollText text="Отправить демо" />
          </a>
        </div>
      </div>

      {animate && (
        <p className="hero__hint" aria-hidden="true">
          <span className="hero__hint-dot" />
          {fine ? 'кликни в любом месте — будет дроп' : 'тапни по экрану — будет дроп'}
        </p>
      )}

      <a className="hero__scroll" href="#about" aria-label="Перейти к разделу «О лейбле»">
        <svg className="hero__scroll-ring" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <path id="hero-ring" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
          </defs>
          <text>
            <textPath href="#hero-ring" textLength="236" lengthAdjust="spacing">
              листай вниз · листай вниз · листай вниз ·
            </textPath>
          </text>
        </svg>
        <ArrowDown aria-hidden="true" />
      </a>
    </section>
  );
}
