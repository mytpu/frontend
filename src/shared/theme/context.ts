import { createContext } from 'react';

/* В продукте две темы: светлая и графит. Остальные режимы макета — только в FigCraft. */
export type ThemeMode = 'light' | 'graphite';

export interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
