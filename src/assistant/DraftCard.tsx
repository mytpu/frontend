import { useState } from 'react';

import { Chip } from '@/shared/ui/Card';
import { Stepper } from '@/shared/ui/Stepper';

import type { Draft } from './useChat';

import './cards.css';

const STORAGE_KEY = 'mytpu.draft.v1';

interface DraftCardProps {
  draft: Draft;
  onChange: (draft: Draft) => void;
}

/** Черновик заявки: шаг «поля» → шаг «проверка». Отправки в help.tpu.ru пока нет. */
export function DraftCard({ draft, onChange }: DraftCardProps) {
  const [confirmed, setConfirmed] = useState(draft.status === 'confirmed');

  function confirm() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, status: 'confirmed' }));
    } catch {
      /* приватный режим — черновик просто не сохранится */
    }
    onChange({ ...draft, status: 'confirmed' });
    setConfirmed(true);
  }

  const ready = draft.subject.trim() !== '' && draft.description.trim() !== '';

  return (
    <section className="draft">
      <header className="draft__head">
        <span className="draft__title">Заявка</span>
        <Chip tone="demo">демо</Chip>
      </header>

      {confirmed ? (
        <p className="draft__done">Черновик сохранён в браузере.</p>
      ) : (
        <Stepper
          completeLabel="Отправить заявку"
          blocked={!ready}
          onComplete={confirm}
          steps={[
            {
              title: 'Поля',
              content: (
                <>
                  <label className="draft__field">
                    <span className="draft__label">Тема</span>
                    <input
                      className="draft__input"
                      value={draft.subject}
                      onChange={(event) => onChange({ ...draft, subject: event.target.value })}
                    />
                  </label>

                  <label className="draft__field">
                    <span className="draft__label">Описание</span>
                    <textarea
                      className="draft__input draft__input--area"
                      rows={3}
                      value={draft.description}
                      onChange={(event) => onChange({ ...draft, description: event.target.value })}
                    />
                  </label>

                  <p className="draft__service">
                    Куда: <strong>{draft.service}</strong>
                  </p>
                </>
              ),
            },
            {
              title: 'Проверка',
              content: (
                <dl className="draft__review">
                  <dt>Сервис</dt>
                  <dd>{draft.service}</dd>
                  <dt>Тема</dt>
                  <dd>{draft.subject}</dd>
                  <dt>Описание</dt>
                  <dd>{draft.description}</dd>
                </dl>
              ),
            },
          ]}
        />
      )}
    </section>
  );
}
