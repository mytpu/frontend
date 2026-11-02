import { useEffect, useState } from 'react';
import { getHomeSummary } from '../api/mock';
import type { HomeSummary } from '../api/types';
import { TodayWidget } from './widgets/TodayWidget';
import type { WidgetConfig } from './types';
import './Board.css';

const WIDGETS: WidgetConfig[] = [
  { id: 'w-today',     kind: 'today',     size: 'L' },
  { id: 'w-deadlines', kind: 'deadlines', size: 'M' },
  { id: 'w-grades',    kind: 'grades',    size: 'S' },
  { id: 'w-event',     kind: 'event',     size: 'S' },
  { id: 'w-inbox',     kind: 'inbox',     size: 'M' },
  { id: 'w-tickets',   kind: 'tickets',   size: 'M' },
];

export function Board() {
  const [data, setData] = useState<HomeSummary | null>(null);

  useEffect(() => {
    getHomeSummary().then(setData);
  }, []);

  if (!data) return <div className="board">Загрузка…</div>;

  return (
    <div className="board">
      {WIDGETS.map((w) => (
        <section key={w.id} className={`board__cell board__cell--${w.size}`}>
          {w.kind === 'today' && (
            <TodayWidget lessons={data.lessons} todayLabel={data.todayLabel} />
          )}
          {w.kind !== 'today' && (
            <div className="board__placeholder">
              {w.kind} · {w.size}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
