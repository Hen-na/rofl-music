import { useEffect, useRef } from 'react';
import { energyOf, type HeroSignal } from '../lib/signal';
import { useParty } from '../lib/party';
import './LedCanvas.css';

/**
 * Интерактивная LED-матрица первого экрана (Canvas 2D, без WebGL).
 * Волны повторяют dots.jpg: две диагональные полосы и тёмная середина под логотипом.
 * Курсор работает как «линза», клик запускает кольцевую волну «дропа».
 * Цикл крутится только пока экран виден; при reduced motion рисуется один статичный кадр.
 */
const LEVELS = 7;
const TAU = Math.PI * 2;

const smooth = (a: number, b: number, v: number) => {
  const x = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

interface LedCanvasProps {
  signal: HeroSignal;
  active: boolean;
  animate: boolean;
}

export function LedCanvas({ signal, active, animate }: LedCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const party = useParty();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let W = 0;
    let H = 0;
    let step = 10;
    let cols = 0;
    let rows = 0;
    const color = getComputedStyle(canvas).getPropertyValue('--dot-color').trim() || '#01d1b7';
    const buckets: number[][] = Array.from({ length: LEVELS }, () => []);
    let colCenter = new Float32Array(0);
    let colWave = new Float32Array(0);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      step = W < 600 ? 12 : 10;
      cols = Math.ceil(W / step) + 1;
      rows = Math.ceil(H / step) + 1;
      colCenter = new Float32Array(cols);
      colWave = new Float32Array(cols);
    };

    const draw = (now: number) => {
      const t = animate ? now / 1000 : 12;
      const speed = party ? 3 : 1;
      for (const b of buckets) b.length = 0;

      for (let i = 0; i < cols; i++) {
        const u = (i * step) / W;
        colCenter[i] = 0.52 + 0.14 * (u - 0.5) + 0.05 * Math.sin(u * 3.1 + t * 0.35 * speed);
        colWave[i] = u * 0.55 + 0.05 * Math.sin(u * 5 - t * 0.5 * speed);
      }

      const live = animate && signal.inside;
      const energy = animate ? energyOf(signal, now) : 0;
      const lensR = Math.max(W, H) * (0.13 + energy * 0.08);
      const lensR2 = lensR * lensR;
      const dropAge = (now - signal.dropAt) / 1000;
      const ringOn = animate && dropAge < 1.5;
      const ringR = dropAge * Math.max(W, H) * 0.85;
      const ringFade = 1 - dropAge / 1.5;
      const phaseT = t * 0.22 * speed;

      for (let j = 0; j < rows; j++) {
        const y = j * step;
        const v = y / H;
        for (let i = 0; i < cols; i++) {
          const x = i * step;
          const d = Math.abs(v - colCenter[i]);
          const wave = 0.5 + 0.5 * Math.sin((v * 1.2 - colWave[i]) * TAU * 1.5 - phaseT);
          let k = smooth(0.1, 0.34, d) * (0.25 + 0.75 * wave);

          if (live) {
            const dx = x - signal.x;
            const dy = y - signal.y;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < lensR2 * 4) k += Math.exp(-dist2 / lensR2) * (0.55 + energy * 0.6);
          }
          if (ringOn) {
            const dx = x - signal.dropX;
            const dy = y - signal.dropY;
            const dd = Math.sqrt(dx * dx + dy * dy) - ringR;
            if (dd > -120 && dd < 120) k += Math.exp(-(dd * dd) / 1800) * ringFade;
          }

          const q = k >= 1 ? LEVELS - 1 : (k * LEVELS) | 0;
          buckets[q].push(x, y);
        }
      }

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = color;
      for (let q = 0; q < LEVELS; q++) {
        const pts = buckets[q];
        if (!pts.length) continue;
        const f = q / (LEVELS - 1);
        const size = step * (0.22 + 0.52 * f);
        const off = (step - size) / 2;
        ctx.globalAlpha = 0.07 + 0.9 * f * f;
        ctx.beginPath();
        for (let p = 0; p < pts.length; p += 2) ctx.rect(pts[p] + off, pts[p + 1] + off, size, size);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    resize();
    draw(performance.now());

    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(canvas);

    if (!animate || !active) return () => ro.disconnect();

    const interval = 1000 / (W < 600 ? 24 : 30);
    let last = 0;
    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < interval) return;
      last = now;
      draw(now);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [signal, active, animate, party]);

  return <canvas ref={ref} className="led-canvas" aria-hidden="true" />;
}
