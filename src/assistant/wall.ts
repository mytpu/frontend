import type { DriftItem } from '@/shared/ui/DriftWall';

import palette from './wall.json';

/* Плитки стены помощника: бумажные сгибы, без фотографий и внешних запросов.
   Палитра — зелёная бумага «Оригами», лежит рядом в wall.json. */

const tile = ({ base, fold, edge }: { base: string; fold: string; edge: number }) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120">` +
      `<rect width="160" height="120" fill="${base}"/>` +
      `<path d="M0 ${edge} L160 0 L160 120 L0 120 Z" fill="${fold}" opacity="0.55"/>` +
      `<path d="M0 ${edge} L160 0" stroke="${fold}" stroke-width="2" opacity="0.9"/>` +
      `</svg>`,
  )}`;

export const WALL: DriftItem[] = palette.plates.map((plate) => ({ image: tile(plate) }));
