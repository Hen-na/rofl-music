import type { CSSProperties } from 'react';
import './DotField.css';

interface DotFieldProps {
  /** wave — две волны как в dots.jpg; band — горизонтальная полоса; cover — пятно для обложек */
  variant?: 'wave' | 'band' | 'cover';
  /** Сдвиг пятна для variant="cover", 0–100 */
  focus?: { x: number; y: number };
  subtle?: boolean;
  className?: string;
}

/** Декоративный точечный «LED»-паттерн бренда. Чистый CSS, скрыт от скринридеров. */
export function DotField({ variant = 'wave', focus, subtle = false, className = '' }: DotFieldProps) {
  const style = focus
    ? ({ '--focus-x': `${focus.x}%`, '--focus-y': `${focus.y}%` } as CSSProperties)
    : undefined;

  return (
    <div
      className={`dotfield dotfield--${variant}${subtle ? ' dotfield--subtle' : ''} ${className}`}
      style={style}
      aria-hidden="true"
    >
      <div className="dotfield__shape">
        <div className="dotfield__grid" />
      </div>
    </div>
  );
}
