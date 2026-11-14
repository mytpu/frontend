import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type { AppNotification } from '@/api/types';
import { Icon } from '@/shared/ui/Icon';
import { Dialog } from '@/shared/ui/Dialog';

import './drawer.css';

const SERVICE_LABEL: Record<AppNotification['service'], string> = {
  lk: 'Личный кабинет',
  rasp: 'Расписание',
  moodle: 'Moodle',
  mail: 'Почта',
  help: 'Заявки',
  docs: 'Инструкции',
};

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
  items: AppNotification[];
  readIds: string[];
  onReadAll: () => void;
  loading: boolean;
  error: string | null;
}

/** Шторка уведомлений справа: модальный диалог с закрытием щелчком мимо (`closedby="any"`). */
export function NotificationsDrawer({
  open,
  onClose,
  items,
  readIds,
  onReadAll,
  loading,
  error,
}: NotificationsDrawerProps) {
  const [onlyUnread, setOnlyUnread] = useState(false);
  const unread = useMemo(
    () => items.filter((item) => item.unread && !readIds.includes(item.id)),
    [items, readIds],
  );
  const visible = onlyUnread ? unread : items;

  return (
    <Dialog open={open} onClose={onClose} title="Уведомления" variant="side" lightDismiss>
      <div className="drawer__bar">
        <button
          className={`drawer__filter${onlyUnread ? ' drawer__filter--on' : ''}`}
          type="button"
          aria-pressed={onlyUnread}
          onClick={() => setOnlyUnread((value) => !value)}
        >
          Только новые{unread.length > 0 ? ` · ${unread.length}` : ''}
        </button>
        <button className="drawer__read" type="button" onClick={onReadAll} disabled={unread.length === 0}>
          Прочитать все
        </button>
      </div>

      {loading ? <p className="drawer__hint">Загружаем уведомления…</p> : null}
      {error ? <p className="drawer__hint drawer__hint--danger">{error}</p> : null}

      {!loading && !error && visible.length === 0 ? (
        <p className="drawer__hint">{onlyUnread ? 'Новых уведомлений нет' : 'Уведомлений нет'}</p>
      ) : null}

      <ul className="drawer__list">
        {visible.map((item) => {
          const isUnread = item.unread && !readIds.includes(item.id);
          return (
            <li key={item.id} className={`note${isUnread ? ' note--unread' : ''}`}>
              <span className="note__icon" aria-hidden="true">
                <Icon name={iconFor(item.service)} size={16} />
              </span>
              <div className="note__body">
                <p className="note__head">
                  <span className="note__title">{item.title}</span>
                  <span className="note__time">{item.time}</span>
                </p>
                <p className="note__text">{item.text}</p>
                <p className="note__service">{SERVICE_LABEL[item.service]}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="drawer__footer">
        Уведомления собираются из сервисов ТПУ. <Link to="/services" onClick={onClose}>Настроить сервисы</Link>
      </p>
    </Dialog>
  );
}

function iconFor(service: AppNotification['service']) {
  switch (service) {
    case 'moodle':
      return 'book';
    case 'mail':
      return 'mail';
    case 'help':
      return 'help';
    case 'rasp':
      return 'calendar';
    case 'docs':
      return 'docs';
    default:
      return 'user';
  }
}
