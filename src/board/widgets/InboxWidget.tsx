import { api } from '@/api/client';
import type { InboxItem, InboxSource } from '@/api/types';
import { useAsync } from '@/shared/lib/useAsync';
import { Icon } from '@/shared/ui/Icon';

import { WidgetFrame } from '../WidgetFrame';
import { rowsFor } from '../boardStore';
import type { WidgetSize } from '../boardStore';


const SOURCE: Record<InboxSource, { label: string; icon: 'mail' | 'book' | 'help' }> = {
  mail: { label: 'Почта', icon: 'mail' },
  moodle: { label: 'Moodle', icon: 'book' },
  help: { label: 'Заявки', icon: 'help' },
};

export function InboxWidget({ size }: { size: WidgetSize }) {
  const result = useAsync(api.inbox);
  const limit = rowsFor(size);

  return (
    <WidgetFrame
      title="Почта и курсы"
      size={size}
      result={result}
      emptyText="Новых писем и сообщений нет"
      isEmpty={(data: InboxItem[]) => data.length === 0}
      action={{ label: 'Все сервисы', to: '/services' }}
    >
      {(items) => (
        <ul className="rows">
          {items.slice(0, limit).map((item) => (
            <li key={item.id} className={`row${item.unread ? ' row--unread' : ''}`}>
              <span className="row__icon" aria-hidden="true">
                <Icon name={SOURCE[item.source].icon} size={16} />
              </span>
              <span className="row__body">
                <span className="row__title">{item.who}</span>
                <span className="row__meta">{item.text}</span>
              </span>
              <span className="row__side row__side--time">{item.time}</span>
            </li>
          ))}
        </ul>
      )}
    </WidgetFrame>
  );
}
