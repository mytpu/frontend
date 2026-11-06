import { api } from '@/api/client';
import type { Deadline } from '@/api/types';
import { useAsync } from '@/shared/lib/useAsync';
import { Chip } from '@/shared/ui/Card';

import { WidgetFrame } from '../WidgetFrame';
import { rowsFor } from '../boardStore';
import type { WidgetSize } from '../boardStore';


export function DeadlinesWidget({ size }: { size: WidgetSize }) {
  const result = useAsync(api.deadlines);
  const limit = rowsFor(size);

  return (
    <WidgetFrame
      title="Дедлайны"
      size={size}
      result={result}
      emptyText="Дедлайнов нет — все задания закрыты"
      isEmpty={(data: Deadline[]) => data.length === 0}
      action={{ label: 'Moodle', to: '/services' }}
    >
      {(items) => (
        <ul className="rows">
          {items.slice(0, limit).map((item) => (
            <li key={item.id} className="row">
              <span className="row__body">
                <span className="row__title">{item.title}</span>
                <span className="row__meta">
                  {item.subject} · {item.source}
                </span>
              </span>
              <span className="row__side">
                <Chip tone={item.tone === 'warn' ? 'warn' : 'neutral'}>{item.due}</Chip>
              </span>
            </li>
          ))}
        </ul>
      )}
    </WidgetFrame>
  );
}
