import { Icon } from '@/shared/ui/Icon';
import { Dialog } from '@/shared/ui/Dialog';

import type { BoardApi, WidgetSize } from './boardStore';
import { WIDGETS } from './boardStore';

import './config.css';

const SIZES: WidgetSize[] = ['S', 'M', 'L'];
const SIZE_TITLE: Record<WidgetSize, string> = { S: 'маленький', M: 'средний', L: 'во всю ширину' };

interface BoardConfigDialogProps {
  open: boolean;
  onClose: () => void;
  board: BoardApi;
}

/** Конструктор доски: включить нужное, задать размер и порядок. Порядок — кнопками, а не перетаскиванием:
    так он работает с клавиатуры и не тянет библиотеку. */
export function BoardConfigDialog({ open, onClose, board }: BoardConfigDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Настроить доску" variant="wide">
      <ul className="cfg">
        {board.items.map((item, index) => {
          const meta = WIDGETS.find((widget) => widget.id === item.id);
          if (!meta) return null;

          return (
            <li key={item.id} className={`cfg__row${item.visible ? '' : ' cfg__row--off'}`}>
              <button
                className="cfg__switch"
                type="button"
                role="switch"
                aria-checked={item.visible}
                aria-label={`${meta.title}: ${item.visible ? 'показан' : 'скрыт'}`}
                onClick={() => board.toggle(item.id)}
              >
                <span className="cfg__dot" />
              </button>

              <span className="cfg__text">
                <span className="cfg__title">{meta.title}</span>
                <span className="cfg__meta">{meta.serviceLabel}</span>
              </span>

              <span className="cfg__sizes" role="group" aria-label={`Размер виджета ${meta.title}`}>
                {SIZES.map((size) => (
                  <button
                    key={size}
                    className={`cfg__size${item.size === size ? ' cfg__size--on' : ''}`}
                    type="button"
                    aria-pressed={item.size === size}
                    title={SIZE_TITLE[size]}
                    onClick={() => board.setSize(item.id, size)}
                  >
                    {size}
                  </button>
                ))}
              </span>

              <span className="cfg__move">
                <button
                  className="cfg__arrow"
                  type="button"
                  aria-label={`${meta.title}: выше`}
                  disabled={index === 0}
                  onClick={() => board.move(item.id, -1)}
                >
                  <Icon name="up" size={16} />
                </button>
                <button
                  className="cfg__arrow"
                  type="button"
                  aria-label={`${meta.title}: ниже`}
                  disabled={index === board.items.length - 1}
                  onClick={() => board.move(item.id, 1)}
                >
                  <Icon name="down" size={16} />
                </button>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="cfg__foot">
        <button className="btn btn--outline" type="button" onClick={board.reset} disabled={!board.isCustom}>
          Сбросить
        </button>
        <button className="btn btn--contrast" type="button" onClick={onClose}>
          Готово
        </button>
      </div>
    </Dialog>
  );
}
