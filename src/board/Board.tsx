import type { BoardItem } from './boardStore';
import { DeadlinesWidget } from './widgets/DeadlinesWidget';
import { InboxWidget } from './widgets/InboxWidget';
import { MarksWidget } from './widgets/MarksWidget';
import { RequestsWidget } from './widgets/RequestsWidget';
import { TodayWidget } from './widgets/TodayWidget';

import './Board.css';

function widgetFor(item: BoardItem) {
  switch (item.id) {
    case 'today':
      return <TodayWidget size={item.size} />;
    case 'deadlines':
      return <DeadlinesWidget size={item.size} />;
    case 'inbox':
      return <InboxWidget size={item.size} />;
    case 'marks':
      return <MarksWidget size={item.size} />;
    case 'requests':
      return <RequestsWidget size={item.size} />;
    default:
      return null;
  }
}

/** Доска: S — четверть, M — половина, L — вся ширина. Порядок и видимость приходят из настройки. */
export function Board({ items }: { items: BoardItem[] }) {
  return (
    <div className="board">
      {items
        .filter((item) => item.visible)
        .map((item) => (
          <div key={item.id} className={`board__cell board__cell--${item.size.toLowerCase()}`}>
            {widgetFor(item)}
          </div>
        ))}
    </div>
  );
}
