import type { ReactNode } from 'react';

import { useShell } from '@/app/shellContext';
import { Icon } from '@/shared/ui/Icon';

import './PageHeader.css';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

/* Шапка экрана: надзаголовок, заголовок, действия и вход в поиск.
   Поиск — кнопка, а не поле: палитра одна на приложение и открывается из любого экрана. */
export function PageHeader({ eyebrow, title, children }: PageHeaderProps) {
  const { openPalette } = useShell();

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
      </div>
    </header>
  );
}
