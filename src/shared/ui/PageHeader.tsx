import type { ReactNode } from 'react';

import './PageHeader.css';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

/* Шапка экрана: надзаголовок, заголовок и действия страницы. */
export function PageHeader({ eyebrow, title, children }: PageHeaderProps) {
  return (
    <header className="page-head">
      <div className="page-head__text">
        <p className="page-head__eyebrow">{eyebrow}</p>
        <h1 className="page-head__title">{title}</h1>
      </div>

      {children ? <div className="page-head__actions">{children}</div> : null}
    </header>
  );
}
