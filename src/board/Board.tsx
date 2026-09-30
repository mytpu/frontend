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
  return (
    <div className="board">
      {WIDGETS.map((w) => (
        <section key={w.id} className={`board__cell board__cell--${w.size}`}>
          <div className="board__placeholder">
            {w.kind} · {w.size}
          </div>
        </section>
      ))}
    </div>
  );
}
