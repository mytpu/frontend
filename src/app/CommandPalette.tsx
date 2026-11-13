import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Icon } from '@/shared/ui/Icon';

import './palette.css';

export interface PaletteItem {
  id: string;
  title: string;
  group: string;
  to: string;
  hint?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items: PaletteItem[];
}

/** Быстрый поиск по Ctrl K.

    По руководству `dialog` это немодальная палитра: `dialog popover="auto"` держит её в верхнем слое,
    страница остаётся живой, Esc и щелчок мимо закрывают сами. Своего перехвата фокуса и Esc нет. */
export function CommandPalette({ open, onClose, items }: CommandPaletteProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLLIElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [lastOpen, setLastOpen] = useState(open);
  const navigate = useNavigate();

  /* Сброс поля при открытии: подгоняем состояние под проп, а не в эффекте. */
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setQuery('');
      setActive(0);
    }
  }

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === '') return items;
    return items.filter((item) => `${item.title} ${item.hint ?? ''}`.toLowerCase().includes(needle));
  }, [items, query]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (open) {
      if (typeof element.showPopover === 'function') {
        if (!element.matches(':popover-open')) element.showPopover();
      } else if (!element.open) {
        element.showModal();
      }
      inputRef.current?.focus();
    } else if (typeof element.hidePopover === 'function') {
      if (element.matches(':popover-open')) element.hidePopover();
    } else if (element.open) {
      element.close();
    }
  }, [open]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  function choose(index: number) {
    const item = results[index];
    if (!item) return;
    onClose();
    navigate(item.to);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((value) => (results.length === 0 ? 0 : (value + 1) % results.length));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((value) => (results.length === 0 ? 0 : (value - 1 + results.length) % results.length));
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      choose(active);
    }
  }

  return (
    <dialog
      ref={ref}
      popover="auto"
      className="palette"
      aria-label="Быстрый поиск"
      onToggle={(event) => {
        if (event.newState === 'closed') onClose();
      }}
      onClose={onClose}
    >
      <form
        className="palette__form"
        onSubmit={(event) => {
          event.preventDefault();
          choose(active);
        }}
      >
        <Icon name="search" size={18} />
        <input
          ref={inputRef}
          className="palette__input"
          type="search"
          placeholder="Раздел, сервис или вопрос помощнику"
          autoComplete="off"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
        />
        <kbd className="kbd">Esc</kbd>
      </form>

      <ul className="palette__list" id="palette-list" role="listbox" aria-label="Результаты">
        {results.length === 0 ? (
          <li className="palette__empty">
            Ничего не нашлось. <a href="/assistant">Спросите помощника</a> — он ищет по документам ТПУ.
          </li>
        ) : null}

        {results.map((item, index) => {
          const showGroup = index === 0 || results[index - 1].group !== item.group;
          return (
            <li key={item.id} className="palette__row" ref={index === active ? activeRef : undefined}>
              {showGroup ? <span className="palette__group">{item.group}</span> : null}
              <button
                id={`palette-${item.id}`}
                className={`palette__item${index === active ? ' palette__item--active' : ''}`}
                type="button"
                role="option"
                aria-selected={index === active}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(index)}
              >
                <span className="palette__title">{item.title}</span>
                {item.hint ? <span className="palette__hint">{item.hint}</span> : null}
                <Icon name="arrow" size={16} />
              </button>
            </li>
          );
        })}
      </ul>
    </dialog>
  );
}
