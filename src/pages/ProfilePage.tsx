import { useState } from 'react';

import { api } from '@/api/client';
import type { AccessApp, Student } from '@/api/types';
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
  const student = useAsync(api.student);
  const apps = useAsync(api.accessApps);
  const { mode, setMode } = useTheme();
  const [exitOpen, setExitOpen] = useState(false);

  return (
    <>
      <PageHeader eyebrow="Данные из личного кабинета · пока демонстрационные" title="Профиль" />

      {student.state.status === 'loading' ? <Skeleton lines={4} /> : null}
      {student.state.status === 'error' ? (
        <ErrorBlock message={student.state.message} onRetry={student.reload} />
      ) : null}
      {student.state.status === 'ready' ? <StudentCard student={student.state.data} /> : null}

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

      <Dialog open={exitOpen} onClose={() => setExitOpen(false)} title="Выход">
        <p className="dialog-text">
          Выйти пока не из чего: сессии и входа через ТПУ ещё нет, а демонстрационные данные лежат в браузере.
        </p>
        <p className="dialog-text">
          Когда появится identity, здесь будет обычный выход с отзывом сессии на сервере.
        </p>
        <div className="dialog-actions">
          <button className="btn btn--contrast" type="button" onClick={() => setExitOpen(false)} autoFocus>
            Понятно
          </button>
        </div>
      </Dialog>
    </>
  );
}

function StudentCard({ student }: { student: Student }) {
  return (
    <section className="me">
      <span className="me__avatar" aria-hidden="true">
        {student.initials}
      </span>

      <div className="me__text">
        <p className="me__name">
          {student.name}
          <Chip tone="demo">демо</Chip>
        </p>
        <p className="me__meta">
          {student.group} · {student.course} курс
        </p>
        <p className="me__meta">{student.institute}</p>
        <p className="me__meta">{student.program}</p>
      </div>

    </section>
  );
}
