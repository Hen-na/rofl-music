import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { Section } from './Section';
import { DotField } from './DotField';
import { RollText, SplitChars } from './SplitText';
import { site, socialLinks } from '../data/site';
import './Contact.css';

export function Contact() {
  const { email, note } = site.contact;
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <Section id="contact" index="04" eyebrow="контакты" title="остаёмся на связи" layout="giant" className="contact">
      <DotField variant="band" subtle className="contact__dots" />
      <div className="contact__grid">
        <p className="contact__note rise">{note}</p>

        <div className="contact__mail rise" style={{ '--d': '120ms' } as CSSProperties}>
          <a className="contact__email display" href={`mailto:${email}`}>
            <SplitChars text={email} />
          </a>
          <button type="button" className={`contact__copy${copied ? ' is-done' : ''}`} onClick={copy}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            <span>{copied ? 'скопировано' : 'скопировать адрес'}</span>
          </button>
          <span className="visually-hidden" role="status">
            {copied ? 'Адрес скопирован в буфер обмена' : ''}
          </span>
        </div>

        <ul className="contact__socials" aria-label="Мы в соцсетях">
          {socialLinks.map((link, i) => (
            <li key={link.label} className="rise" style={{ '--d': `${240 + i * 70}ms`, '--i': i } as CSSProperties}>
              <a className="contact__social" href={link.href} target="_blank" rel="noreferrer">
                <RollText text={link.label} />
                <ArrowUpRight aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
