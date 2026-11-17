import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, useVelocity } from 'motion/react';
import { Section } from './Section';
import { DotField } from './DotField';
import { Equalizer } from './Equalizer';
import { SplitChars } from './SplitText';
import { artists } from '../data/artists';
import { useFinePointer, useReducedMotion } from '../hooks/useMediaQuery';
import './Artists.css';

/** Где «светится» точечный портрет-заглушка, пока нет фото */
const PREVIEW_FOCUS = [
  { x: 30, y: 35 },
  { x: 70, y: 30 },
  { x: 45, y: 70 },
  { x: 65, y: 65 },
];

const pad = (n: number) => String(n + 1).padStart(2, '0');

export function Artists() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);
  const [shown, setShown] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // превью едет за курсором на пружине и наклоняется от скорости - как карточка в руке
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 280, damping: 26, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 280, damping: 26, mass: 0.6 });
  const velocity = useVelocity(sx);
  const rotate = useTransform(velocity, [-1600, 1600], [-14, 14], { clamp: true });

  const place = (e: PointerEvent<HTMLDivElement>, jump = false) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    if (jump || reduced) {
      x.jump(px);
      y.jump(py);
      sx.jump(px);
      sy.jump(py);
    } else {
      x.set(px);
      y.set(py);
    }
  };

  const activate = (i: number) => {
    setHovered(i);
    setShown(i);
  };

  const preview = artists[shown];

  return (
    <Section id="artists" index="02" eyebrow="ростер" title="наши артисты" layout="right">
      <div
        ref={wrapRef}
        className="artists-wrap"
        onPointerEnter={fine ? (e) => place(e, true) : undefined}
        onPointerMove={fine ? (e) => place(e) : undefined}
        onPointerLeave={() => setHovered(null)}
      >
        <ol className="artists">
          {artists.map((artist, i) => {
            const isActive = fine ? hovered === i : selected === i;
            const content = (
              <>
                <span className="artists__index" aria-hidden="true">
                  {pad(i)}
                </span>
                <span className="artists__name display">
                  <SplitChars text={artist.name} />
                </span>
                <span className="artists__genre">{artist.genre}</span>
                <Equalizer className="artists__meter" />
                {artist.href && <ArrowUpRight className="artists__arrow" aria-hidden="true" />}
              </>
            );

            return (
              <li
                key={artist.id}
                className={`artists__item rise${isActive ? ' is-active' : ''}`}
                style={{ '--d': `${i * 90}ms` } as CSSProperties}
                onPointerEnter={fine ? () => activate(i) : undefined}
                onClick={!fine ? () => setSelected((current) => current === i ? null : i) : undefined}
              >
                {artist.href ? (
                  <a
                    className="artists__row"
                    href={artist.href}
                    target="_blank"
                    rel="noreferrer"
                    onFocus={() => activate(i)}
                    onBlur={() => setHovered(null)}
                  >
                    {content}
                  </a>
                ) : (
                  <button
                    type="button"
                    className="artists__row"
                    aria-pressed={!fine ? isActive : undefined}
                    onFocus={fine ? () => activate(i) : undefined}
                    onBlur={fine ? () => setHovered(null) : undefined}
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ol>

        {fine && preview && (
          <motion.div
            className={`artist-preview${hovered !== null ? ' is-on' : ''}`}
            style={{ x: sx, y: sy, rotate: reduced ? 0 : rotate }}
            aria-hidden="true"
          >
            <div key={preview.id} className="artist-preview__card">
              {preview.image ? (
                <img src={preview.image} alt="" width={480} height={600} decoding="async" />
              ) : (
                <>
                  <DotField variant="cover" focus={PREVIEW_FOCUS[shown % PREVIEW_FOCUS.length]} />
                  <span className="artist-preview__no">{pad(shown)}</span>
                </>
              )}
              <span className="artist-preview__name">{preview.name}</span>
            </div>
          </motion.div>
        )}
      </div>
    </Section>
  );
}
