import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '@/api/client';
import type { WeekData } from '@/api/types';
import { useAsync } from '@/shared/lib/useAsync';
import { Chip, ErrorBlock, Skeleton } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { PageHeader } from '@/shared/ui/PageHeader';

import './schedule.css';

export function SchedulePage() {
  const week = useAsync(api.week);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function ask(text: string) {
    navigate(`/assistant?q=${encodeURIComponent(text)}`);
  }

  return (
    <>
      <PageHeader eyebrow="Неделя · данные демонстрационные" title="Расписание">
        <a className="btn btn--outline" href="https://rasp.tpu.ru" target="_blank" rel="noreferrer">
          rasp.tpu.ru
          <Icon name="external" size={15} />
        </a>
      </PageHeader>

      <section className="lookup">
        <div className="lookup__text">
          <p className="lookup__title">Найти аудиторию, группу или преподавателя</p>
          <p className="lookup__hint">
            Идёт через шлюз, инструмент <code>rasp_find</code>: помощник вернёт карточки со ссылками на расписание.
          </p>
        </div>
        <form
          className="lookup__form"
          onSubmit={(event) => {
            event.preventDefault();
            const text = query.trim();
            if (text !== '') ask(`Найди в расписании ${text}`);
          }}
        >
          <input
            className="lookup__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ауд. 403, 8К31, Иванова"
            aria-label="Что найти в расписании"
          />
          <button className="btn btn--contrast" type="submit">
            Спросить
          </button>
        </form>
      </section>

      {week.state.status === 'loading' ? <Skeleton lines={6} /> : null}
      {week.state.status === 'error' ? <ErrorBlock message={week.state.message} onRetry={week.reload} /> : null}

      {week.state.status === 'ready' ? (
        <WeekGrid data={week.state.data} onAsk={() => ask('Где находится аудитория 403?')} />
      ) : null}
    </>
  );
}

function WeekGrid({ data, onAsk }: { data: WeekData; onAsk: () => void }) {
  return (
    <section className="week">
      <header className="week__head">
        <h2 className="week__title">{data.weekLabel}</h2>
        <Chip tone="demo">демо</Chip>
        <span className="week__note">
          Пары на неделю по студенту шлюз пока не отдаёт — это макет данных. Поиск по расписанию работает.
        </span>
      </header>

      <div className="week__grid">
        {data.days.map((day) => (
          <article key={day.iso} className={`day${day.isToday ? ' day--today' : ''}`}>
            <header className="day__head">
              <span className="day__weekday">{day.weekday}</span>
              <span className="day__date">{day.dateLabel}</span>
            </header>

            {day.pairs.length === 0 ? (
              <p className="day__empty">Пар нет</p>
            ) : (
              <ul className="day__pairs">
                {day.pairs.map((pair) => (
                  <li key={pair.id} className="slot">
                    <span className="slot__time">
                      {pair.start}–{pair.end}
                    </span>
                    <span className="slot__subject">{pair.subject}</span>
                    <span className="slot__meta">
                      {pair.kind} · ауд. {pair.room}, корп. {pair.building}
                      {pair.teacher ? ` · ${pair.teacher}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      <p className="week__foot">
        Не нашли аудиторию? <button className="week__link" type="button" onClick={onAsk}>Спросите помощника</button> — он ищет
        по расписанию ТПУ и даёт ссылку на карточку.
      </p>
    </section>
  );
}
