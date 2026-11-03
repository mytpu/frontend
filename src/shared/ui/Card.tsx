import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import './ui.css';

export type ChipTone = 'ok' | 'warn' | 'info' | 'neutral' | 'demo';

export function Chip({ tone = 'neutral', children }: { tone?: ChipTone; children: ReactNode }) {
  return <span className={`chip chip--${tone}`}>{children}</span>;
}

interface CardProps {
  title: string;
  /** Пометка рядом с заголовком: «демо», счётчик, статус сервиса. */
  badge?: ReactNode;
  action?: { label: string; to?: string; onClick?: () => void };
  children: ReactNode;
  className?: string;
}

export function Card({ title, badge, action, children, className }: CardProps) {
  return (
    <section className={className ? `card ${className}` : 'card'}>
      <header className="card__head">
        <h2 className="card__title">
          {title}
          {badge}
        </h2>
        {action ? (
          action.to ? (
            <Link className="card__action" to={action.to}>
              {action.label}
            </Link>
          ) : (
            <button className="card__action" type="button" onClick={action.onClick}>
              {action.label}
            </button>
          )
        ) : null}
      </header>
      {children}
    </section>
  );
}

export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton" aria-busy="true" aria-live="polite">
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} className="skeleton__line" style={{ width: `${92 - i * 12}%` }} />
      ))}
    </div>
  );
}

/** Ошибка загрузки с повтором: одинаково на виджете и на экране. */
export function ErrorBlock({ message, onRetry, compact = false }: { message: string; onRetry?: () => void; compact?: boolean }) {
  return (
    <div className={compact ? 'state state--compact' : 'state'} role="alert">
      <p className="state__text">{message}</p>
      {onRetry ? (
        <button className="state__retry" type="button" onClick={onRetry}>
          Повторить
        </button>
      ) : null}
    </div>
  );
}
