import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ServiceId } from '@/api/types';

/* Доска студента: какие виджеты видны, в каком порядке и какого размера.
   Набор хранится в localStorage, поэтому настройка переживает перезагрузку,
   а битое или устаревшее значение не ломает главную — оно замещается умолчанием. */

export type WidgetId = 'today' | 'deadlines' | 'inbox' | 'marks' | 'requests';
export type WidgetSize = 'S' | 'M' | 'L';

export interface WidgetMeta {
  id: WidgetId;
  title: string;
  service: ServiceId;
  serviceLabel: string;
  defaultSize: WidgetSize;
}

export interface BoardItem {
  id: WidgetId;
  visible: boolean;
  size: WidgetSize;
}

export interface BoardApi {
  items: BoardItem[];
  isCustom: boolean;
  toggle: (id: WidgetId) => void;
  setSize: (id: WidgetId, size: WidgetSize) => void;
  move: (id: WidgetId, direction: -1 | 1) => void;
  reset: () => void;
}

export const WIDGETS: WidgetMeta[] = [
  { id: 'today', title: 'Сегодня', service: 'rasp', serviceLabel: 'Расписание', defaultSize: 'L' },
  { id: 'deadlines', title: 'Дедлайны', service: 'moodle', serviceLabel: 'Moodle', defaultSize: 'M' },
  { id: 'inbox', title: 'Почта и курсы', service: 'mail', serviceLabel: 'Почта', defaultSize: 'M' },
  { id: 'marks', title: 'Оценки', service: 'lk', serviceLabel: 'Личный кабинет', defaultSize: 'M' },
  { id: 'requests', title: 'Заявки', service: 'help', serviceLabel: 'help.tpu.ru', defaultSize: 'M' },
];

const STORAGE_KEY = 'mytpu.board.v1';
const SIZES: WidgetSize[] = ['S', 'M', 'L'];

const DEFAULT_ITEMS: BoardItem[] = WIDGETS.map((widget) => ({
  id: widget.id,
  visible: true,
  size: widget.defaultSize,
}));

const known = (value: string): value is WidgetId => WIDGETS.some((widget) => widget.id === value);

function isSize(value: unknown): value is WidgetSize {
  return typeof value === 'string' && (SIZES as string[]).includes(value);
}

/** Чтение настройки: неизвестные виджеты выбрасываем, пропущенные — добавляем из умолчаний. */
function read(): BoardItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ITEMS;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_ITEMS;

    const items: BoardItem[] = [];
    for (const entry of parsed) {
      if (typeof entry !== 'object' || entry === null) continue;
      const record = entry as Record<string, unknown>;
      const id = record.id;
      if (typeof id !== 'string' || !known(id) || items.some((item) => item.id === id)) continue;
      items.push({
        id,
        visible: record.visible !== false,
        size: isSize(record.size) ? record.size : (WIDGETS.find((w) => w.id === id)?.defaultSize ?? 'M'),
      });
    }

    for (const fallback of DEFAULT_ITEMS) {
      if (!items.some((item) => item.id === fallback.id)) items.push(fallback);
    }

    return items.length > 0 ? items : DEFAULT_ITEMS;
  } catch {
    return DEFAULT_ITEMS;
  }
}

function write(items: BoardItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* приватный режим или переполненное хранилище — настройка просто не сохранится */
  }
}

export function useBoard(): BoardApi {
  const [items, setItems] = useState<BoardItem[]>(read);

  useEffect(() => {
    write(items);
  }, [items]);

  const toggle = useCallback((id: WidgetId) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item)));
  }, []);

  const setSize = useCallback((id: WidgetId, size: WidgetSize) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, size } : item)));
  }, []);

  const move = useCallback((id: WidgetId, direction: -1 | 1) => {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setItems(DEFAULT_ITEMS);
  }, []);

  const isCustom = useMemo(
    () =>
      items.some((item, index) => {
        const fallback = DEFAULT_ITEMS[index];
        return item.id !== fallback.id || item.size !== fallback.size || item.visible !== fallback.visible;
      }),
    [items],
  );

  return { items, isCustom, toggle, setSize, move, reset };
}

export function widgetMeta(id: WidgetId): WidgetMeta {
  return WIDGETS.find((widget) => widget.id === id) ?? WIDGETS[0];
}

/** Сколько строк показывать при размере S/M/L: маленький виджет — короткая выжимка. */
export function rowsFor(size: WidgetSize): number {
  if (size === 'S') return 2;
  if (size === 'M') return 3;
  return 6;
}
