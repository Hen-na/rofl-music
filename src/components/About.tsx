import { useRef, type CSSProperties } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { Section } from './Section';
import { DotField } from './DotField';
import { site } from '../data/site';
import { useReducedMotion } from '../hooks/useMediaQuery';
import './About.css';

function Point({ text, index, progress, still }: { text: string; index: number; progress: MotionValue<number>; still: boolean }) {
  const dir = index % 2 === 0 ? 1 : -1;
  const x = useTransform(progress, [0, 1], [`${-8 * dir}%`, `${8 * dir}%`]);

  return (
    <li className="about__point display" style={{ '--i': index } as CSSProperties}>
      <motion.span className="about__point-text" style={still ? undefined : { x }}>
        {text}
      </motion.span>
    </li>
  );
}

export function About() {
  const { title, paragraphs, points } = site.about;
  const pointsRef = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: pointsRef, offset: ['start end', 'end start'] });

  return (
    <Section id="about" index="01" eyebrow="о лейбле" title={title} className="about">
      <DotField variant="band" subtle className="about__dots" />
      <div className="about__text">
        {paragraphs.map((text, i) => (
          <p key={text} className="rise" style={{ '--d': `${200 + i * 120}ms` } as CSSProperties}>
            {text}
          </p>
        ))}
      </div>
      <ul ref={pointsRef} className="about__points" aria-label="Направления">
        {points.map((point, i) => (
          <Point key={point} text={point} index={i} progress={scrollYProgress} still={reduced} />
        ))}
      </ul>
    </Section>
  );
}
