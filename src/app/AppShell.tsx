import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { api } from '@/api/client';
import { useAsync } from '@/shared/lib/useAsync';
import { useTheme } from '@/shared/theme/useTheme';
import { Icon } from '@/shared/ui/Icon';
import { Logo } from '@/shared/ui/Logo';

import { AskBar } from './AskBar';
import { CommandPalette } from './CommandPalette';
import type { PaletteItem } from './CommandPalette';
import { NotificationsDrawer } from './NotificationsDrawer';
import { NAV } from './nav';
import { ShellContext } from './shellContext';

import './AppShell.css';

export function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  const student = useAsync(api.student);
  const notifications = useAsync(api.notifications);
  const services = useAsync(api.services);
  const actions = useAsync(api.quickActions);
  const { mode, toggle } = useTheme();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const unread = useMemo(() => {
    if (notifications.state.status !== 'ready') return null;
    return notifications.state.data.filter((item) => item.unread && !readIds.includes(item.id)).length;
  }, [notifications.state, readIds]);

  const paletteItems = useMemo<PaletteItem[]>(() => {
    const pages: PaletteItem[] = NAV.map((item) => ({
      id: `page-${item.to}`,
      title: item.label,
      group: 'Разделы',
      to: item.to,
    }));

    const serviceItems: PaletteItem[] =
      services.state.status === 'ready'
        ? services.state.data.map((service) => ({
            id: `service-${service.id}`,
            title: service.title,
            group: 'Сервисы',
            hint: service.subtitle,
            to: '/services',
          }))
        : [];

    const askItems: PaletteItem[] =
      actions.state.status === 'ready'
        ? actions.state.data.map((action) => ({
            id: `ask-${action.id}`,
            title: action.title,
            group: 'Спросить помощника',
            hint: action.prompt,
            to: `/assistant?q=${encodeURIComponent(action.prompt)}`,
          }))
        : [];

    return [...pages, ...serviceItems, ...askItems];
  }, [services.state, actions.state]);

  const shell = useMemo(
    () => ({
      openPalette: () => setPaletteOpen(true),
      openNotifications: () => setDrawerOpen(true),
      unread,
    }),
    [unread],
  );

  const me = student.state.status === 'ready' ? student.state.data : null;

  return (
    <ShellContext.Provider value={shell}>
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

          <button className="rail__search" type="button" onClick={() => setPaletteOpen(true)}>
            <Icon name="search" size={18} />
            <span>Поиск</span>
            <kbd className="kbd">Ctrl K</kbd>
          </button>

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

        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={paletteItems} />

        <NotificationsDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          items={notifications.state.status === 'ready' ? notifications.state.data : []}
          readIds={readIds}
          onReadAll={() =>
            setReadIds(
              notifications.state.status === 'ready'
                ? notifications.state.data.map((item) => item.id)
                : [],
            )
          }
          loading={notifications.state.status === 'loading'}
          error={notifications.state.status === 'error' ? notifications.state.message : null}
        />
      </div>
    </ShellContext.Provider>
  );
}
