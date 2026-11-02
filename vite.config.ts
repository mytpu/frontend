import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

/* Браузер ходит в свой origin, ключ шлюза остаётся на сервере: прокси доклеивает заголовок
   из .env.local (файл с суффиксом .local в git не попадает). Значения без префикса VITE_
   в клиентский бандл не попадают вообще. */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.ASSISTANT_URL;
  const key = env.ASSISTANT_KEY;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: target
        ? {
            '/api/ai': {
              target,
              changeOrigin: true,
              headers: key ? { 'X-Assistant-Key': key } : {},
            },
          }
        : undefined,
    },
  };
});
