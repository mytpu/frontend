import { useEffect, type ReactNode } from 'react';

import { useAsync } from '@/shared/lib/useAsync';
import { Logo } from '@/shared/ui/Logo';

import { loadViewer, SESSION_EXPIRED, ViewerContext } from './session';

import './signin.css';

export function SessionGate({ children }: { children: ReactNode }) {
  const { state, reload } = useAsync(loadViewer);
  const failedLogin = new URLSearchParams(window.location.search).has('login_error');

  useEffect(() => {
    const recheckRestoredPage = (event: PageTransitionEvent) => { if (event.persisted) reload(); };
    window.addEventListener(SESSION_EXPIRED, reload);
    window.addEventListener('pageshow', recheckRestoredPage);
    return () => {
      window.removeEventListener(SESSION_EXPIRED, reload);
      window.removeEventListener('pageshow', recheckRestoredPage);
    };
  }, [reload]);

  if (state.status === 'ready' && state.data) {
    return <ViewerContext.Provider value={state.data}>{children}</ViewerContext.Provider>;
  }

  return (
    <main className="signin">
      <section className="signin__card">
        <Logo withText />
        <h1>Вход в «Мой ТПУ»</h1>
        {state.status === 'loading' ? <p role="status">Проверяем сессию…</p> : null}
        {state.status === 'error' ? (
          <>
            <p role="alert">{state.message}</p>
            <button type="button" className="btn btn--contrast" onClick={reload}>Повторить</button>
          </>
        ) : null}
        {state.status === 'ready' ? (
          <>
            {failedLogin ? <p role="alert">Вход не завершён. Попробуйте снова.</p> : null}
            <a className="btn btn--contrast" href="/api/auth/start">Войти через ТПУ</a>
          </>
        ) : null}
      </section>
    </main>
  );
}
