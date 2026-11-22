import { createContext, useContext } from 'react';

export interface Viewer {
  id: string;
  name: string;
  email: string;
}

export const ViewerContext = createContext<Viewer | null>(null);
export const SESSION_EXPIRED = 'mytpu:session-expired';

export function useViewer(): Viewer {
  const viewer = useContext(ViewerContext);
  if (!viewer) throw new Error('Отсутствует пользовательская сессия');
  return viewer;
}

export function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export async function loadViewer(): Promise<Viewer | null> {
  const response = await fetch('/api/auth/me', { headers: { Accept: 'application/json' } });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Не удалось проверить сессию');
  return response.json() as Promise<Viewer>;
}

export async function logout(): Promise<void> {
  const response = await fetch('/api/auth/logout', { method: 'POST' });
  if (!response.ok) throw new Error('Не удалось завершить сессию. Попробуйте снова.');
  const { redirect } = (await response.json()) as { redirect: string };
  window.location.assign(redirect);
}
