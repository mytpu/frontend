import { api } from '@/api/client';
import type { Request, RequestStatus } from '@/api/types';
import { useAsync } from '@/shared/lib/useAsync';
import { Chip } from '@/shared/ui/Card';
import type { ChipTone } from '@/shared/ui/Card';

import { WidgetFrame } from '../WidgetFrame';
import { rowsFor } from '../boardStore';
import type { WidgetSize } from '../boardStore';


const TONE: Record<RequestStatus, ChipTone> = {
  'в работе': 'warn',
  'ждёт ответа': 'info',
  решено: 'ok',
};

export function RequestsWidget({ size }: { size: WidgetSize }) {
  const result = useAsync(api.requests);
  const limit = rowsFor(size);

  return (
    <WidgetFrame
      title="Заявки"
      size={size}
      result={result}
      emptyText="Открытых заявок нет"
      isEmpty={(data: Request[]) => data.length === 0}
    >
      {(items) => (
        <ul className="rows">
          {items.slice(0, limit).map((item) => (
            <li key={item.id} className="row">
              <span className="row__body">
                <span className="row__title">
                  № {item.number} · {item.title}
                </span>
                <span className="row__meta">
                  {item.place} · обновлено {item.updated}
                </span>
              </span>
              <span className="row__side">
                <Chip tone={TONE[item.status]}>{item.status}</Chip>
              </span>
            </li>
          ))}
        </ul>
      )}
    </WidgetFrame>
  );
}
