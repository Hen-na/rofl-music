import type { Release } from '../types';

// ЗАГЛУШКА: все релизы ниже — условные. Замените реальными данными.
// Обложки кладите в public/covers/ (желательно webp, ~800×800) и указывайте cover: '/covers/имя.webp'.
export const releases: Release[] = [
  { id: 'release-01', title: 'Релиз 01', artist: 'Артист 01', type: 'Сингл', year: '—' },
  { id: 'release-02', title: 'Релиз 02', artist: 'Артист 02', type: 'EP', year: '—' },
  { id: 'release-03', title: 'Релиз 03', artist: 'Артист 03', type: 'Сингл', year: '—' },
  { id: 'release-04', title: 'Релиз 04', artist: 'Артист 04', type: 'Альбом', year: '—' },
];
