import type { Plugin, ViteDevServer } from 'vite';

/** На локальном стенде сессия проверяется до вызова прокси помощника. */
export function protectAssistant(identity: string, origin: string): Plugin {
  function install(server: Pick<ViteDevServer, 'middlewares'>) {
    server.middlewares.use(async (request, response, next) => {
      if (request.url !== '/api/ai/chat' && request.url !== '/api/ai/chat/stream') {
        next();
        return;
      }

      const fail = (status: number, message: string) => {
        response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify({ message }));
      };
      if (request.headers.origin && request.headers.origin !== origin) {
        fail(403, 'Этот источник запроса не разрешён');
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
