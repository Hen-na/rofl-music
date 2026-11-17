import { useRef, type CSSProperties, type PointerEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Section } from './Section';
import { DotField } from './DotField';
import { releases } from '../data/releases';
import { useFinePointer, useReducedMotion } from '../hooks/useMediaQuery';
import type { Release } from '../types';
import './Releases.css';

/** Позиции «пятна» точек в обложках-заглушках, чтобы карточки отличались */
const COVER_FOCUS = [
  { x: 25, y: 30 },
  { x: 75, y: 25 },
  { x: 40, y: 80 },
  { x: 80, y: 70 },
];

/** Наклон, с которым пластинка «падает» в ящик */
const DROP_TILT = [-7, 5, -4, 8];

function ReleaseCard({ release, index, tilt }: { release: Release; index: number; tilt: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = stageRef.current;
    if (!tilt || !el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-py * 14).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(px * 16).toFixed(2)}deg`);
    el.style.setProperty('--mx', px.toFixed(3));
    el.style.setProperty('--my', py.toFixed(3));
  };

  const onLeave = () => {
    const el = stageRef.current;
    if (!el) return;
    ['--rx', '--ry', '--mx', '--my'].forEach((p) => el.style.removeProperty(p));
  };

  return (
    <article className="release" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div ref={stageRef} className="release__stage">
        <span className="release__disc" aria-hidden="true">
          <span className="release__label">{String(index + 1).padStart(2, '0')}</span>
        </span>
        <div className="release__sleeve">
          <div className="release__cover">
            {release.cover ? (
              <img src={release.cover} alt="" width={800} height={800} loading="lazy" decoding="async" />
            ) : (
              <DotField variant="cover" focus={COVER_FOCUS[index % COVER_FOCUS.length]} />
            )}
          </div>
          <span className="release__type">{release.type}</span>
        </div>
      </div>
      <div className="release__info">
        <h3 className="release__title display">
          {release.href ? (
            <a className="release__link" href={release.href} target="_blank" rel="noreferrer">
              {release.title}
              <ArrowUpRight aria-hidden="true" />
            </a>
          ) : (
            release.title
          )}
        </h3>
        <p className="release__meta">
          {release.artist} · {release.year}
        </p>
      </div>
    </article>
  );
}

export function Releases() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  return (
    <Section id="releases" index="03" eyebrow="каталог" title="релизы">
      <ul className="releases">
        {releases.map((release, i) => (
          <motion.li
            key={release.id}
            className="releases__item"
            style={{ '--n': i } as CSSProperties}
            initial={reduced ? false : { opacity: 0, y: 140, rotate: DROP_TILT[i % DROP_TILT.length] }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, margin: '0px 0px -12% 0px' }}
            transition={{ type: 'spring', stiffness: 110, damping: 15, mass: 0.9, delay: (i % 2) * 0.12 }}
          >
            <ReleaseCard release={release} index={i} tilt={fine && !reduced} />
          </motion.li>
        ))}
      </ul>
    </Section>
  );
}
