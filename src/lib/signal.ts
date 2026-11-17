/**
 * Общий «сигнал» первого экрана: курсор, его энергия и «дроп» по клику.
 * Мутабельный объект без React-состояния — его читают анимационные циклы логотипа и LED-поля.
 */
export interface HeroSignal {
  /** координаты курсора относительно первого экрана, px */
  x: number;
  y: number;
  /** доля ширины экрана 0..1 */
  u: number;
  inside: boolean;
  energy: number;
  energyAt: number;
  dropAt: number;
  dropX: number;
  dropY: number;
}

export function createSignal(): HeroSignal {
  return { x: 0, y: 0, u: 0.5, inside: false, energy: 0, energyAt: 0, dropAt: -1e9, dropX: 0, dropY: 0 };
}

const ENERGY_DECAY_MS = 600;

/** Текущая энергия с учётом затухания. */
export function energyOf(s: HeroSignal, now: number) {
  return s.energy * Math.exp(-(now - s.energyAt) / ENERGY_DECAY_MS);
}

export function addEnergy(s: HeroSignal, amount: number, now: number) {
  s.energy = Math.min(1.2, energyOf(s, now) + amount);
  s.energyAt = now;
}
