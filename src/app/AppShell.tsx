import { NavLink, Outlet } from 'react-router-dom';

import { api } from '@/api/client';
import { useAsync } from '@/shared/lib/useAsync';
import { useTheme } from '@/shared/theme/useTheme';
import { Icon } from '@/shared/ui/Icon';
import { Logo } from '@/shared/ui/Logo';

import { AskBar } from './AskBar';
import { NAV } from './nav';

import './AppShell.css';

export function AppShell() {
  const student = useAsync(api.student);
  const { mode, toggle } = useTheme();

  const me = student.state.status === 'ready' ? student.state.data : null;

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Перейти к содержимому
      </a>

      <aside className="rail">
        <div className="rail__logo">
          <Logo withText />
        </div>

        <nav className="rail__nav" aria-label="Основная навигация">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="rail__spacer" />

        <button className="rail__theme" type="button" onClick={toggle}>
          <Icon name={mode === 'light' ? 'moon' : 'sun'} size={18} />
          <span>{mode === 'light' ? 'Графит' : 'Светлая'}</span>
        </button>

        <NavLink className="rail__me" to="/profile">
          <span className="avatar" aria-hidden="true">
            {me ? me.initials : '—'}
          </span>
          <span className="rail__who">
            <span className="rail__name">{me ? me.name : 'Загрузка…'}</span>
            <span className="rail__group">{me ? `${me.group} · студент` : ''}</span>
          </span>
        </NavLink>
      </aside>

      <main className="shell__main" id="main">
        <Outlet />
      </main>

      <AskBar />
    </div>
  );
}
