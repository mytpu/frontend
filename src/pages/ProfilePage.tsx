import { useState } from 'react';

import { api } from '@/api/client';
import type { AccessApp } from '@/api/types';
import { initials, logout, useViewer, type Viewer } from '@/auth/session';
import { useAsync } from '@/shared/lib/useAsync';
import { useTheme } from '@/shared/theme/useTheme';
import { Chip, ErrorBlock, Skeleton } from '@/shared/ui/Card';
import { Dialog } from '@/shared/ui/Dialog';
import { Icon } from '@/shared/ui/Icon';
import { PageHeader } from '@/shared/ui/PageHeader';

import './profile.css';

const ACCESS_TONE: Record<AccessApp['status'], 'ok' | 'info' | 'neutral'> = {
  подключено: 'ok',
  'по запросу': 'info',
  'нет доступа': 'neutral',
};

export function ProfilePage() {
  const student = useViewer();
  const apps = useAsync(api.accessApps);
  const { mode, setMode } = useTheme();
  const [exitOpen, setExitOpen] = useState(false);
  const [exitBusy, setExitBusy] = useState(false);
  const [exitError, setExitError] = useState('');

  async function confirmLogout() {
    setExitBusy(true);
    setExitError('');
    try {
      await logout();
    } catch (error) {
      setExitError(error instanceof Error ? error.message : 'Не удалось выйти');
      setExitBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Профиль" />
      <StudentCard student={student} />

      <section className="section">
        <h2 className="section__title">Тема</h2>
        <div className="theme-pick" role="group" aria-label="Тема оформления">
          <button
            className={`theme-card${mode === 'light' ? ' theme-card--on' : ''}`}
            type="button"
            aria-pressed={mode === 'light'}
            onClick={() => setMode('light')}
          >
            <span className="theme-card__preview theme-card__preview--light" aria-hidden="true" />
            <span className="theme-card__name">Светлая</span>
            <span className="theme-card__hint">цвета «Оригами», по умолчанию</span>
          </button>
          <button
            className={`theme-card${mode === 'graphite' ? ' theme-card--on' : ''}`}
            type="button"
            aria-pressed={mode === 'graphite'}
            onClick={() => setMode('graphite')}
          >
            <span className="theme-card__preview theme-card__preview--graphite" aria-hidden="true" />
            <span className="theme-card__name">Графит</span>
            <span className="theme-card__hint">тёмная, для вечера</span>
          </button>
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Приложения с доступом</h2>
        {apps.state.status === 'loading' ? <Skeleton lines={3} /> : null}
        {apps.state.status === 'error' ? <ErrorBlock message={apps.state.message} onRetry={apps.reload} /> : null}
        {apps.state.status === 'ready' ? (
          <ul className="apps">
            {apps.state.data.map((app) => (
              <li key={app.id} className="apps__row">
                <span className="apps__icon" aria-hidden="true">
                  <Icon name="lock" size={16} />
                </span>
                <span className="apps__body">
                  <span className="apps__title">{app.title}</span>
                  <span className="apps__scope">{app.scope}</span>
                </span>
                <Chip tone={ACCESS_TONE[app.status]}>{app.status}</Chip>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="section">
        <h2 className="section__title">Сессия</h2>
        <div className="session">

          <button className="btn btn--outline" type="button" onClick={() => setExitOpen(true)}>
            <Icon name="power" size={16} />
            Выйти
          </button>
        </div>
      </section>

      <Dialog open={exitOpen} onClose={() => { if (!exitBusy) setExitOpen(false); }} title="Выход">
        <p className="dialog-text">Завершить текущую сессию?</p>
        {exitError ? <p role="alert">{exitError}</p> : null}
        <div className="dialog-actions">
          <button className="btn btn--contrast" type="button" disabled={exitBusy} onClick={() => void confirmLogout()} autoFocus>
            Выйти
          </button>
        </div>
      </Dialog>
    </>
  );
}

function StudentCard({ student }: { student: Viewer }) {
  return (
    <section className="me">
      <span className="me__avatar" aria-hidden="true">
        {initials(student.name)}
      </span>

      <div className="me__text">
        <p className="me__name">
          {student.name}
        </p>
        {student.email ? <p className="me__meta">{student.email}</p> : null}
      </div>

    </section>
  );
}
