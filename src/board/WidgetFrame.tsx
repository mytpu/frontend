import type { ReactNode } from 'react';

import type { AsyncResult } from '@/shared/lib/useAsync';
import { Card, ErrorBlock, Skeleton } from '@/shared/ui/Card';

import type { WidgetSize } from './boardStore';

import './widgets/widgets.css';

interface WidgetFrameProps<T> {
  title: string;
  size: WidgetSize;
  result: AsyncResult<T>;
  emptyText: string;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => ReactNode;
}

/** Рамка виджета: своё состояние загрузки, пустоты и ошибки у каждого сервиса.
    Упавший Moodle не превращает главную в экран ошибки — остальные виджеты живут. */
export function WidgetFrame<T>({ title, size, result, emptyText, isEmpty, children }: WidgetFrameProps<T>) {
  const { state, reload } = result;

  return (
    <Card title={title} className={`widget widget--${size.toLowerCase()}`}>
      {state.status === 'loading' ? <Skeleton lines={size === 'S' ? 2 : 4} /> : null}

      {state.status === 'error' ? <ErrorBlock message={state.message} onRetry={reload} compact /> : null}

      {state.status === 'ready'
        ? isEmpty?.(state.data)
          ? <p className="widget__empty">{emptyText}</p>
          : children(state.data)
        : null}
    </Card>
  );
}
