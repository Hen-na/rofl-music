import { Fragment, type CSSProperties } from 'react';

/** Текст, разбитый на буквы (для волн и подпрыгиваний). Экранным чтецам отдаётся цельная строка. */
export function SplitChars({ text, className = '' }: { text: string; className?: string }) {
  return (
    <>
      <span className="visually-hidden">{text}</span>
      <span className={`chars ${className}`} aria-hidden="true">
        {Array.from(text).map((ch, i) => (
          <span key={i} className="char" style={{ '--ci': i } as CSSProperties}>
            {ch === ' ' ? '\u00a0' : ch}
          </span>
        ))}
      </span>
    </>
  );
}

/** Текст, разбитый на слова с маской — для появления заголовков. */
export function SplitWords({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="word">
            <span style={{ '--wi': i } as CSSProperties}>{word}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}

/** «Перекатывающийся» текст для кнопок и ссылок. */
export function RollText({ text }: { text: string }) {
  return (
    <span className="roll">
      <span className="roll__a">{text}</span>
      <span className="roll__b" aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
