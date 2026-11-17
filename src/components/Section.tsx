import { useRef, type ReactNode } from 'react';
import { SplitWords } from './SplitText';
import { useInView } from '../hooks/useInView';
import './Section.css';

interface SectionProps {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
  /** композиция шапки: left - слева, right - справа, giant - заголовок на всю ширину */
  layout?: 'left' | 'right' | 'giant';
}

/** Общая обёртка секции: якорь, шапка с заголовком, появление при прокрутке. */
export function Section({ id, index, eyebrow, title, children, className = '', layout = 'left' }: SectionProps) {
  const titleId = `${id}-title`;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, rootMargin: '0px 0px -15% 0px' });

  return (
    <section
      id={id}
      ref={ref}
      className={`section section--${layout}${inView ? ' is-in' : ''} ${className}`}
      aria-labelledby={titleId}
    >
      <span className="section__numeral" aria-hidden="true">
        {index}
      </span>
      <div className="container">
        <header className="section__head">
          <p className="section__meta rise">
            <span className="section__index" aria-hidden="true">
              {index}
            </span>
            <span className="eyebrow">{eyebrow}</span>
          </p>
          <h2 id={titleId} className="section__title display">
            <SplitWords text={title} />
          </h2>
        </header>
        {children}
      </div>
    </section>
  );
}
