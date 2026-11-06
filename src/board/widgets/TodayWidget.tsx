import { api } from '@/api/client';
import type { TodayData } from '@/api/types';
import { useAsync } from '@/shared/lib/useAsync';
import { Chip } from '@/shared/ui/Card';

import { WidgetFrame } from '../WidgetFrame';
import { rowsFor } from '../boardStore';
import type { WidgetSize } from '../boardStore';


function pairState(id: string, nowPairId: string | null): 'past' | 'now' | 'next' {
  if (id === nowPairId) return 'now';
  return nowPairId && id > nowPairId ? 'next' : 'past';
}

export function TodayWidget({ size }: { size: WidgetSize }) {
  const result = useAsync(api.today);
  const limit = rowsFor(size);

  return (
    <WidgetFrame
      title="Сегодня"
      size={size}
      result={result}
      emptyText="На сегодня пар нет"
      isEmpty={(data: TodayData) => data.pairs.length === 0}
      action={{ label: 'Вся неделя', to: '/schedule' }}
    >
      {(data) => {
        const current = data.pairs.find((pair) => pair.id === data.nowPairId) ?? null;

        return (
          <>
            {current ? (
              <div className="now">
                <div className="now__row">
                  <span className="now__label">
                    Сейчас · {current.start}–{current.end}
                  </span>
                  {data.minsLeft !== null ? <span className="now__left">осталось {data.minsLeft} мин</span> : null}
                </div>
                <p className="now__subject">{current.subject}</p>
                <p className="now__meta">
                  {current.kind} · корпус {current.building}, ауд. {current.room}
                  {current.teacher ? ` · ${current.teacher}` : ''}
                </p>
              </div>
            ) : null}

            <ul className="pairs">
              {data.pairs.slice(0, limit).map((pair) => {
                const state = pairState(pair.id, data.nowPairId);
                return (
                  <li key={pair.id} className={`pair pair--${state}`}>
                    <span className="pair__time">{pair.start}</span>
                    <span className="pair__body">
                      <span className="pair__subject">{pair.subject}</span>
                      <span className="pair__meta">
                        {pair.kind} · ауд. {pair.room}
                      </span>
                    </span>
                    {state === 'now' ? <Chip tone="ok">идёт</Chip> : null}
                    {state === 'past' ? <Chip tone="neutral">прошла</Chip> : null}
                  </li>
                );
              })}
            </ul>

            {data.gap ? <p className="widget__foot">{data.gap}</p> : null}
          </>
        );
      }}
    </WidgetFrame>
  );
}
