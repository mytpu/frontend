import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

import { Icon } from './Icon';

import './dialog.css';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** `side` — шторка справа (уведомления), `wide` — конструктор доски. */
  variant?: 'compact' | 'wide' | 'side';
  /** Закрытие щелчком по фону. Нативный `closedby`, где он есть. */
  lightDismiss?: boolean;
}

/** Модальное окно на нативном `<dialog>`: без role="dialog", ловушек фокуса и своего обработчика Esc —
    всё это даёт браузер. См. руководство `dialog` / `light-dismiss-a-dialog`. */
export function Dialog({ open, onClose, title, children, variant = 'compact', lightDismiss = false }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (lightDismiss) element.setAttribute('closedby', 'any');
    else element.removeAttribute('closedby');

    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open, lightDismiss]);

  return (
    <dialog
      ref={ref}
      className={`dialog dialog--${variant}`}
      aria-labelledby={titleId}
      onClose={onClose}
    >
      <header className="dialog__head">
        <h2 className="dialog__title" id={titleId}>
          {title}
        </h2>
        <button className="dialog__close" type="button" onClick={onClose}>
          <Icon name="close" size={18} />
          <span className="sr-only">Закрыть</span>
        </button>
      </header>
      <div className="dialog__body">{children}</div>
    </dialog>
  );
}
