import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';

import '@/design/tokens.css';
import '@/design/base.css';

const root = document.getElementById('root');
if (!root) throw new Error('Не найден #root в index.html');

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

