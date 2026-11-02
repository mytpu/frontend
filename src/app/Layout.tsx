import type { ReactNode } from 'react';
import './Layout.css';

export type NavKey = 'home' | 'assistant';

interface LayoutProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  children: ReactNode;
}

export function Layout({ active, onNavigate, children }: LayoutProps) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">Мой ТПУ</div>

        <nav className="nav">
          <button
            className={active === 'home' ? 'nav__item nav__item--on' : 'nav__item'}
            onClick={() => onNavigate('home')}
          >
            Главная
          </button>
          <button
            className={active === 'assistant' ? 'nav__item nav__item--on' : 'nav__item'}
            onClick={() => onNavigate('assistant')}
          >
            Помощник
          </button>
        </nav>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
