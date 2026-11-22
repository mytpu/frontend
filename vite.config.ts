import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { createLogger, defineConfig, loadEnv } from 'vite';
import type { ProxyOptions } from 'vite';
import { protectAssistant } from './tools/protect-assistant.ts';
import { SCHEDULE_SEARCH_ENDPOINT } from './src/api/schedule.ts';

/* Браузер ходит в свой origin, ключ шлюза остаётся на сервере: прокси доклеивает заголовок
   из .env.local (файл с суффиксом .local в git не попадает). Значения без префикса VITE_
   в клиентский бандл не попадают вообще. */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.ASSISTANT_URL;
  const key = env.ASSISTANT_KEY;
  const assistantChecksSession = Boolean(target) && env.ASSISTANT_SESSION_AUTH === 'true';
  const identity = env.IDENTITY_URL || 'http://127.0.0.1:8084';
  const origin = env.AUTH_WEB_ORIGIN || 'http://localhost:5173';
  const logger = createLogger();
  const logError = logger.error.bind(logger);
  logger.error = (message, options) => logError(
    message.replace(/(\/api\/auth\/[^\s?]*)\?[^\s]*/g, '$1'),
    options,
  );

  function assistantProxy(checkSession: boolean): ProxyOptions {
    return {
      target,
      changeOrigin: true,
      headers: key ? { 'X-Assistant-Key': key } : {},
      configure: (proxy) => {
        proxy.on('proxyReq', (request, incoming) => {
          request.removeHeader('cookie');
          request.removeHeader('authorization');
          request.removeHeader('x-assistant-require-session');
          if (checkSession) {
            request.setHeader('X-Assistant-Require-Session', '1');
            const authorization = incoming.headers.authorization;
            const cookies = incoming.headers.cookie?.split(';').map((value) => value.trim())
              .filter((value) => value.startsWith('__Host-mytpu_session='));
            if (authorization) request.setHeader('Authorization', authorization);
            else if (cookies?.length === 1) request.setHeader('Cookie', cookies[0]);
          }
          if (key) request.setHeader('X-Assistant-Key', key);
          else request.removeHeader('x-assistant-key');
        });
      },
    };
  }

  return {
    plugins: [react(), protectAssistant(identity, origin, Boolean(target))],
    customLogger: logger,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      strictPort: true,
      proxy: {
        '/api/auth': { target: identity, changeOrigin: true },
        ...(target ? {
          '^/api/ai/chat(?:/stream)?$': assistantProxy(assistantChecksSession),
          [`^${SCHEDULE_SEARCH_ENDPOINT}(?:\\?|$)`]: {
            ...assistantProxy(true),
            proxyTimeout: 22_000,
          },
        } : {}),
      },
    },
  };
});
