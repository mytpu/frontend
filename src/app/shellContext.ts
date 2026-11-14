import { createContext, useContext } from 'react';

/* Общие действия каркаса: их вызывают шапка страницы и плавающая строка,
   а сами окна живут в AppShell — чтобы палитра и шторка были одни на всё приложение. */

export interface ShellContextValue {
  openPalette: () => void;
  openNotifications: () => void;
  /** Непрочитанных уведомлений; `null`, пока список не загружен. */
  unread: number | null;
}

export const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell(): ShellContextValue {
  const value = useContext(ShellContext);
  if (!value) throw new Error('useShell можно вызывать только внутри <AppShell>');
  return value;
}
