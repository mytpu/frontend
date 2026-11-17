import { useState } from 'react';

import { Chip } from '@/shared/ui/Card';
import { Dialog } from '@/shared/ui/Dialog';

import type { Draft } from './useChat';

import './cards.css';

const STORAGE_KEY = 'mytpu.draft.v1';

interface DraftCardProps {
  draft: Draft;
  onChange: (draft: Draft) => void;
}

/** Черновик заявки: правится здесь, отправляется только после подтверждения.
    Отправки в help.tpu.ru пока нет — это честно написано и в карточке, и в подтверждении. */
export function DraftCard({ draft, onChange }: DraftCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  function confirm() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, status: 'confirmed' }));
    } catch {
      /* приватный режим — черновик просто не сохранится */
    }
    onChange({ ...draft, status: 'confirmed' });
    setConfirmOpen(false);
  }

  const ready = draft.subject.trim() !== '' && draft.description.trim() !== '';

  return (
    <section className="draft">
      <header className="draft__head">
        <span className="draft__title">Черновик заявки</span>
        <Chip tone="demo">демо</Chip>
      </header>

      <label className="draft__field">
        <span className="draft__label">Тема</span>
        <input
          className="draft__input"
          value={draft.subject}
          disabled={draft.status === 'confirmed'}
          onChange={(event) => onChange({ ...draft, subject: event.target.value })}
        />
      </label>

      <label className="draft__field">
        <span className="draft__label">Описание</span>
        <textarea
          className="draft__input draft__input--area"
          rows={3}
          value={draft.description}
          disabled={draft.status === 'confirmed'}
          onChange={(event) => onChange({ ...draft, description: event.target.value })}
        />
      </label>

      <p className="draft__service">
        Куда: <strong>{draft.service}</strong>
      </p>

      {draft.status === 'confirmed' ? (
        <p className="draft__done">
          Черновик сохранён в браузере. Отправка появится, когда подключим API help.tpu.ru — тогда заявка уйдёт
          в сервис с номером и статусом.
        </p>
      ) : (
        <div className="draft__foot">
          <p className="draft__hint">Заявка уйдёт только после подтверждения. Отменить можно на любом шаге.</p>
          <button className="btn btn--contrast" type="button" disabled={!ready} onClick={() => setConfirmOpen(true)}>
            Отправить заявку
          </button>
        </div>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Отправить заявку?">
        <dl className="draft__review">
          <dt>Сервис</dt>
          <dd>{draft.service}</dd>
          <dt>Тема</dt>
          <dd>{draft.subject}</dd>
          <dt>Описание</dt>
          <dd>{draft.description}</dd>
        </dl>
        <p className="draft__hint">
          Отправки в help.tpu.ru пока нет: подтверждение сохранит черновик локально. Никакой запрос наружу не уйдёт.
        </p>
        <div className="draft__review-actions">
          <button className="btn btn--outline" type="button" onClick={() => setConfirmOpen(false)} autoFocus>
            Вернуться
          </button>
          <button className="btn btn--contrast" type="button" onClick={confirm}>
            Подтвердить
          </button>
        </div>
      </Dialog>
    </section>
  );
}
