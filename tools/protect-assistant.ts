import type { Plugin, ViteDevServer } from 'vite';

import { SCHEDULE_CALENDAR_ENDPOINT, SCHEDULE_SEARCH_ENDPOINT } from '../src/api/schedule.ts';

/** На локальном стенде сессия проверяется до вызова прокси помощника. */
export function protectAssistant(identity: string, origin: string, scheduleConfigured: boolean): Plugin {
  function install(server: Pick<ViteDevServer, 'middlewares'>) {
    server.middlewares.use(async (request, response, next) => {
      const path = request.url?.split('?')[0];
      const schedule = path === SCHEDULE_SEARCH_ENDPOINT || path === SCHEDULE_CALENDAR_ENDPOINT;
      if (!schedule && path !== '/api/ai/chat' && path !== '/api/ai/chat/stream') {
        next();
        return;
      }

      const fail = (status: number, message: string, error?: string) => {
        response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify({ error, message }));
      };
      if (request.headers.origin && request.headers.origin !== origin) {
        fail(403, 'Этот источник запроса не разрешён', schedule ? 'origin_forbidden' : undefined);
        return;
      }
      // Для расписания проверка сессии обязательна в самом assistant.
      if (schedule) {
        if (scheduleConfigured) next();
        else fail(503, 'Поиск расписания недоступен', 'schedule_unavailable');
        return;
      }

      const headers = new Headers();
      if (request.headers.cookie) headers.set('Cookie', request.headers.cookie);
      if (request.headers.authorization) headers.set('Authorization', request.headers.authorization);
      try {
        const check = await fetch(new URL('/api/auth/session', identity), {
          headers,
          redirect: 'error',
          signal: AbortSignal.timeout(10_000),
        });
        await check.body?.cancel();
        if (check.ok) {
          next();
          return;
        }
        if (check.status === 401) {
          fail(401, 'Войдите через ТПУ');
          return;
        }
      } catch {
        // Недоступная проверка сессии закрывает доступ к помощнику.
      }
      fail(503, 'Не удалось проверить сессию');
    });
  }
  return {
    name: 'mytpu-assistant-session',
    configureServer: install,
    configurePreviewServer: install,
  };
}
