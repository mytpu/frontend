import type { ReactNode } from 'react';

import { useShell } from '@/app/shellContext';
import { Icon } from '@/shared/ui/Icon';

import './PageHeader.css';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

/* Шапка экрана: надзаголовок, заголовок, действия, вход в поиск и шторка уведомлений.
   Поиск — кнопка, а не поле: палитра одна на приложение и открывается из любого экрана. */
export function PageHeader({ eyebrow, title, children }: PageHeaderProps) {
  const { openPalette, openNotifications, unread } = useShell();

  return (
    <header className="page-head">
      <div className="page-head__text">
        <p className="page-head__eyebrow">{eyebrow}</p>
        <h1 className="page-head__title">{title}</h1>
      </div>

      <div className="page-head__actions">
        {children}
        <button className="search search--button" type="button" onClick={openPalette}>
          <Icon name="search" size={18} />
          <span className="search__label">Поиск по сервисам</span>
          <kbd className="kbd">Ctrl K</kbd>
        </button>
        <button
          className="icon-button"
          type="button"
          onClick={openNotifications}
          aria-label={unread ? `Уведомления: ${unread} новых` : 'Уведомления'}
        >
          <Icon name="bell" size={18} />
          {unread ? <span className="icon-button__badge">{unread}</span> : null}
        </button>
      </div>
    </header>
  );
}
