import { useEffect, useRef, useState, type FormEvent } from 'react';

import { calendarUrl, searchSchedule, ScheduleSearchError, type ScheduleResults } from '@/api/schedule';
import { SESSION_EXPIRED } from '@/auth/session';
import { Card, Chip, ErrorBlock } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';

type SearchState =
  | { status: 'idle' | 'loading' }
  | { status: 'ready'; result: ScheduleResults }
  | { status: 'error'; message: string; retryQuery?: string };

export function ScheduleSearch() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>({ status: 'idle' });
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);

  async function run(text: string) {
    active.current?.abort();
    if (!text || text.length > 100) {
      setState({ status: 'error', message: 'Введите запрос длиной от 1 до 100 символов.' });
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    setState({ status: 'loading' });
    try {
      const result = await searchSchedule(text, controller.signal);
      if (!controller.signal.aborted) setState({ status: 'ready', result });
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof ScheduleSearchError && error.status === 401) {
        setState({ status: 'idle' });
        window.dispatchEvent(new Event(SESSION_EXPIRED));
        return;
      }
      setState({
        status: 'error',
        message: error instanceof ScheduleSearchError ? error.message : 'Не удалось загрузить расписание.',
        retryQuery: text,
      });
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void run(query.trim());
  }

  const retryQuery = state.status === 'error' ? state.retryQuery : undefined;

  return (
    <Card title="Поиск по расписанию ТПУ">
      <form className="agenda__find" onSubmit={submit}>
        <Icon name="search" size={16} />
        <input
          className="agenda__input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Группа, преподаватель или аудитория"
          aria-label="Что найти в расписании"
        />
        <button className="agenda__find-go" type="submit" aria-label="Найти расписание">
          <Icon name="arrow" size={15} />
        </button>
      </form>
      {state.status === 'loading' ? <p className="agenda__empty" role="status">Ищем расписание…</p> : null}
      {state.status === 'error' ? (
        <ErrorBlock compact message={state.message} onRetry={retryQuery ? () => void run(retryQuery) : undefined} />
      ) : null}
      {state.status === 'ready' ? (
        state.result.items.length === 0 ? <p className="agenda__empty" role="status">Ничего не найдено</p> : (
          <>
            {state.result.total > state.result.items.length ? (
              <p className="agenda__empty" role="status">Показано {state.result.items.length} из {state.result.total}</p>
            ) : null}
            <ul className="schedule-results">
              {state.result.items.map((item, index) => {
                const url = calendarUrl(item.url);
                return (
                  <li key={`${item.url}:${index}`} className="schedule-results__item">
                    <span className="agenda__body">
                      <span className="agenda__subject">{item.name}</span>
                      {item.hint ? <span className="agenda__meta">{item.hint}</span> : null}
                    </span>
                    <Chip>{item.kind}</Chip>
                    {url ? (
                      <a className="btn btn--outline" href={url} target="_blank" rel="noreferrer"
                        aria-label={`Открыть расписание: ${item.name}`}>
                        Открыть <Icon name="external" size={15} />
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </>
        )
      ) : null}
    </Card>
  );
}
