import { useEffect, useRef } from 'react';
import raw from '../assets/brand/logo-rofl.svg?raw';
import { site } from '../data/site';
import { isParty } from '../lib/party';
import { energyOf, type HeroSignal } from '../lib/signal';
import './LiveLogo.css';

/**
 * «Живой» логотип: тот же logo-rofl.svg, но полоски эквалайзера — отдельные LED-сегменты.
 * Буквы ROFL и «music» берутся прямо из оригинального файла, геометрия сегментов совпадает 1:1.
 * В покое (reduced motion / вне экрана) логотип выглядит в точности как оригинал.
 */
const PATHS = Array.from(raw.matchAll(/<path d="([^"]+)"/g), (m) => m[1]);
const MUSIC_D = PATHS[0] ?? '';
const WORD_D = PATHS[1] ?? '';

const COLUMNS = [
  { x: 0, rows: 9 },
  { x: 64, rows: 12 },
  { x: 127, rows: 6 },
  { x: 191, rows: 8 },
];
const SEG_STEP = 19;
const SEG_BOTTOM = 209;
const FPS = 24; // ступенчатое «LED»-обновление и экономия процессора
const BOOT_MS = 1100;
const BEAT_S = 0.5; // 120 BPM

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

interface LiveLogoProps {
  signal?: HeroSignal;
  /** логотип на экране - можно анимировать */
  active?: boolean;
  /** false - статичный оригинал (reduced motion) */
  animate?: boolean;
  className?: string;
}

export function LiveLogo({ signal, active = true, animate = true, className = '' }: LiveLogoProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const segRefs = useRef<SVGRectElement[][]>(COLUMNS.map(() => []));
  const booted = useRef(false);

  useEffect(() => {
    const cols = segRefs.current;
    const paint = (ci: number, lit: number, peak: number) => {
      cols[ci].forEach((rect, k) => {
        const state = k < lit ? 'on' : k === peak ? 'peak' : 'off';
        if (rect.dataset.s !== state) rect.dataset.s = state;
      });
    };
    const full = () => COLUMNS.forEach((c, ci) => paint(ci, c.rows, -1));

    if (!animate) {
      full();
      return;
    }
    if (!active) {
      if (booted.current) full();
      return;
    }

    const start = performance.now();
    const bootStart = booted.current ? start - BOOT_MS * 2 : start;
    const peaks = COLUMNS.map((c) => c.rows - 1);
    const hold = COLUMNS.map(() => 0);
    let lastDrop = signal?.dropAt ?? 0;
    let last = 0;
    let raf = 0;

    const thump = () =>
      svgRef.current?.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.035) rotate(-0.6deg)' }, { transform: 'scale(1)' }],
        { duration: 340, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 1000 / FPS) return;
      last = now;

      const t = (now - start) / 1000;
      const boot = (now - bootStart) / BOOT_MS;
      if (boot >= 1) booted.current = true;

      if (signal && signal.dropAt !== lastDrop) {
        lastDrop = signal.dropAt;
        thump();
      }

      const energy = signal ? energyOf(signal, now) : 0;
      const dropAge = signal ? (now - signal.dropAt) / 1000 : 99;
      const drop = dropAge < 0.7 ? 1 - dropAge / 0.7 : 0;
      const party = isParty();
      const kick = Math.exp(-((t % BEAT_S) / BEAT_S) * 6);

      COLUMNS.forEach((c, ci) => {
        let level: number;
        if (boot < 1) {
          // загрузка «пульта»: колонки заполняются снизу вверх одна за другой
          level = clamp01(boot * 1.7 - ci * 0.17);
        } else {
          const groove =
            0.5 + 0.28 * Math.sin(t * (2.3 + ci * 0.9) + ci * 1.7) + 0.16 * Math.sin(t * (5.1 - ci * 0.6) + ci);
          const near = signal?.inside ? clamp01(1 - Math.abs(signal.u * 4 - (ci + 0.5)) / 1.6) : 0;
          const live =
            0.2 + groove * 0.45 + kick * 0.22 + energy * (0.3 + near * 0.6) + drop + (party ? 0.35 + kick * 0.5 : 0);
          const blend = clamp01((boot - 1) * 2.5);
          level = 1 - blend + live * blend;
        }

        const lit = Math.round(clamp01(level) * c.rows);
        if (lit - 1 >= peaks[ci]) {
          peaks[ci] = lit - 1;
          hold[ci] = 6;
        } else if (hold[ci] > 0) {
          hold[ci] -= 1;
        } else {
          peaks[ci] = Math.max(lit - 1, peaks[ci] - 1);
        }
        paint(ci, lit, peaks[ci] >= lit ? peaks[ci] : -1);
      });
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, animate, signal]);

  return (
    <svg
      ref={svgRef}
      className={`live-logo${animate ? ' live-logo--intro' : ''} ${className}`}
      viewBox="0 0 887 231"
      fill="#DD0E30"
      role="img"
      aria-label={site.name}
    >
      <g className="live-logo__eq">
        {COLUMNS.map((c, ci) =>
          Array.from({ length: c.rows }, (_, k) => (
            <rect
              key={`${ci}-${k}`}
              ref={(el) => {
                if (el) segRefs.current[ci][k] = el;
              }}
              className="live-logo__seg"
              data-s={animate ? 'off' : 'on'}
              x={c.x}
              y={SEG_BOTTOM - SEG_STEP * k}
              width="48"
              height="12"
              rx="5"
            />
          )),
        )}
      </g>
      <rect className="live-logo__bar" x="282" y="13" width="11" height="218" rx="5" />
      <g className="live-logo__word">
        <path d={WORD_D} />
      </g>
      <path className="live-logo__music" d={MUSIC_D} />
    </svg>
  );
}
