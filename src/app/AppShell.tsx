import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '@/shared/theme/ThemeProvider';
import './AppShell.css';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  soon?: boolean;
}

const NAV: NavItem[] = [
  { to: '/', label: 'Главная', end: true },
  { to: '/assistant', label: 'Помощник' },
  { to: '/services', label: 'Сервисы', soon: true },
  { to: '/profile', label: 'Профиль', soon: true },
];

export function AppShell() {
  const { mode, toggle } = useTheme();

  return (
    <div className="shell">
      <aside className="shell__side">
        <div className="shell__brand">
          <Logo />
          <b>Мой ТПУ</b>
        </div>

        <nav className="shell__nav">
          {NAV.map((item) =>
            item.soon ? (
              <span key={item.to} className="shell__item shell__item--soon">
                {item.label}
                <small>скоро</small>
              </span>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `shell__item${isActive ? ' shell__item--on' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <NavLink to="/assistant" className="shell__ask">
          <b>Спросить помощника</b>
          <small>Ctrl + K</small>
        </NavLink>

        <div className="shell__me">
          <div className="shell__ava">АК</div>
          <div>
            <b>Анна Ковалёва</b>
            <small>8К31 · студент</small>
          </div>
        </div>

        <button className="shell__theme" onClick={toggle}>
          {mode === 'light' ? 'Тёмная тема' : 'Светлая тема'}
        </button>
      </aside>

      <main className="shell__content">
        <Outlet />
      </main>
    </div>
  );
}

function Logo() {
  return (
    <div className="shell__logo" aria-hidden="true">
      <i /><i className="g" /><i />
      <i className="g" /><i className="g" /><i className="g" />
      <i /><i className="g" /><i />
    </div>
  );
}
