import { createContext, useContext } from 'react';

/* Общие действия каркаса: их вызывают шапка страницы и плавающая строка,
   а сами окна живут в AppShell — чтобы палитра была одна на всё приложение. */

export interface ShellContextValue {
  openPalette: () => void;
}

export const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell(): ShellContextValue {
  const value = useContext(ShellContext);
  if (!value) throw new Error('useShell можно вызывать только внутри <AppShell>');
  return value;
}
