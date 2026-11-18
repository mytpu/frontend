import type { PointerEvent as ReactPointerEvent } from 'react';
import { useRef, useState } from 'react';

import { Icon } from '@/shared/ui/Icon';

import type { BoardApi, BoardItem, WidgetId } from './boardStore';
import { widgetMeta } from './boardStore';
import { DeadlinesWidget } from './widgets/DeadlinesWidget';
import { InboxWidget } from './widgets/InboxWidget';
import { MarksWidget } from './widgets/MarksWidget';
import { RequestsWidget } from './widgets/RequestsWidget';
import { TodayWidget } from './widgets/TodayWidget';

import './Board.css';

const SIZES = ['S', 'M', 'L'] as const;

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

/** Доска: S — четверть, M — половина, L — вся ширина. Порядок меняется ручкой, размер — S/M/L на плитке. */
export function Board({ board }: { board: BoardApi }) {
  const [dragId, setDragId] = useState<WidgetId | null>(null);
  const [overId, setOverId] = useState<WidgetId | null>(null);
  const dragRef = useRef<WidgetId | null>(null);
  const overRef = useRef<WidgetId | null>(null);

  function startDrag(event: ReactPointerEvent<HTMLButtonElement>, id: WidgetId) {
    event.preventDefault();
    dragRef.current = id;
    overRef.current = id;
    setDragId(id);
    setOverId(id);

    function onMove(moveEvent: PointerEvent) {
      const under = document
        .elementFromPoint(moveEvent.clientX, moveEvent.clientY)
        ?.closest<HTMLElement>('[data-widget]');
      const next = under?.dataset.widget as WidgetId | undefined;
      if (next && next !== overRef.current) {
        overRef.current = next;
        setOverId(next);
      }
    }

    function stop() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      const from = dragRef.current;
      const to = overRef.current;
      if (from && to && from !== to) board.reorder(from, to);
      dragRef.current = null;
      overRef.current = null;
      setDragId(null);
      setOverId(null);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  }

  return (
    <div className="board">
      {board.items
        .filter((item) => item.visible)
        .map((item) => {
          const meta = widgetMeta(item.id);
          const dragging = dragId === item.id;
          const over = dragId !== null && overId === item.id && dragId !== item.id;

          return (
            <div
              key={item.id}
              data-widget={item.id}
              className={[
                'board__cell',
                `board__cell--${item.size.toLowerCase()}`,
                dragging ? 'board__cell--dragging' : '',
                over ? 'board__cell--over' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="board__tools">
                <button
                  className="board__handle"
                  type="button"
                  aria-label={`Переместить «${meta.title}»`}
                  onPointerDown={(event) => startDrag(event, item.id)}
                >
                  <Icon name="grip" size={16} />
                </button>

                <span className="board__sizes" role="group" aria-label={`Размер «${meta.title}»`}>
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      className="board__size"
                      type="button"
                      aria-pressed={item.size === size}
                      onClick={() => board.setSize(item.id, size)}
                    >
                      {size}
                    </button>
                  ))}
                </span>
              </div>

              {widgetFor(item)}
            </div>
          );
        })}
    </div>
  );
}
