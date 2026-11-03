import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { ThemeContext } from './context';
import type { ThemeContextValue, ThemeMode } from './context';

const STORAGE_KEY = 'mytpu-theme';
const DEFAULT_MODE: ThemeMode = 'light';

function isMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'graphite';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isMode(saved) ? saved : DEFAULT_MODE;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((current) => (current === 'light' ? 'graphite' : 'light'));
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ mode, setMode, toggle }), [mode, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
