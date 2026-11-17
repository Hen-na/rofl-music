import type { CSSProperties } from 'react';
import './Equalizer.css';

/** Высоты столбиков (в «сегментах») повторяют знак из логотипа */
const COLUMNS = [9, 12, 6, 8];

export function Equalizer({ className = '' }: { className?: string }) {
  return (
    <div className={`eq ${className}`} aria-hidden="true">
      {COLUMNS.map((rows, i) => (
        <span key={i} className="eq__col" style={{ '--rows': rows, '--i': i } as CSSProperties} />
      ))}
    </div>
  );
}
