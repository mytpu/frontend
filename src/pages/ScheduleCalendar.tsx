import { useEffect, useRef, useState } from 'react';

import { loadCalendar, loadDemoGroup, type Calendar, type CalendarSelection } from '@/api/calendar';
import { ScheduleSearchError } from '@/api/schedule';
import { SESSION_EXPIRED } from '@/auth/session';
import { Card, Chip, ErrorBlock } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';

function notifyExpired(error: unknown) {
  if (error instanceof ScheduleSearchError && error.status === 401 && error.code === 'session_required') {
    window.dispatchEvent(new Event(SESSION_EXPIRED));
    return true;
  }
  return false;
}

const shortDay = new Intl.DateTimeFormat('ru', { weekday: 'short', day: 'numeric', timeZone: 'UTC' });
const fullDay = new Intl.DateTimeFormat('ru', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

function isoShift(date: string, offset: number) {
  const value = new Date(date);
  value.setUTCDate(value.getUTCDate() + offset);
  return value.toISOString().slice(0, 10);
}

export function ScheduleCalendarEntry() {
  const [state, setState] = useState<{ group?: string; error?: boolean }>({});
  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const request = new AbortController();
    void loadDemoGroup(request.signal).then((group) => {
      if (!request.signal.aborted) setState({ group: group ?? undefined });
    }).catch((error: unknown) => {
      if (!request.signal.aborted && !notifyExpired(error)) setState({ error: true });
    });
    return () => request.abort();
  }, [attempt]);

  if (state.error) return <ErrorBlock compact message="Не удалось проверить доступность демо-расписания."
    onRetry={() => { setState({}); setAttempt((value) => value + 1); }} />;
  if (!state.group) return null;
  if (open) return <ScheduleCalendar group={state.group} onClose={() => setOpen(false)} />;
  return <Card title="Календарь занятий" action={{ label: 'Открыть демо-расписание', onClick: () => setOpen(true) }}>
    <p className="agenda__meta">Группа {state.group}</p>
  </Card>;
}

function ScheduleCalendar({ group, onClose }: { group: string; onClose: () => void }) {
  const [selection, setSelection] = useState<CalendarSelection>({ view: 'day' });
  const [calendar, setCalendar] = useState<Calendar>();
  const [state, setState] = useState<{ status: 'loading' | 'ready' | 'error'; message?: string }>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const active = useRef<AbortController | null>(null);

  useEffect(() => {
    const request = new AbortController();
    active.current = request;
    void loadCalendar(group, selection, request.signal).then((result) => {
      if (request.signal.aborted) return;
      setCalendar(result);
      setState({ status: 'ready' });
    }).catch((error: unknown) => {
      if (request.signal.aborted || notifyExpired(error)) return;
      const message = error instanceof ScheduleSearchError && error.status === 504
        ? 'Источник расписания не ответил вовремя.' : 'Не удалось загрузить демо-расписание.';
      setState({ status: 'error', message });
    });
    return () => request.abort();
  }, [group, selection, attempt]);

  function select(next: CalendarSelection) {
    active.current?.abort();
    setState({ status: 'loading' });
    setSelection(next);
  }

  const date = selection.date ?? (state.status === 'ready' ? calendar?.selectedDate : undefined);
  const monday = date ? isoShift(date, -((new Date(date).getUTCDay() + 6) % 7)) : undefined;
  const previous = date ? isoShift(date, -7) : undefined;
  const next = date ? isoShift(date, 7) : undefined;

  return (
    <Card title={`Группа ${group}`} badge={<Chip tone="demo">Демонстрационные данные</Chip>}
      action={{ label: 'Закрыть календарь', onClick: onClose }}>
      <div className="agenda">
        <div className="agenda__bar">
          <div className="agenda__nav">
            <button className="agenda__arrow" type="button" aria-label="Предыдущая неделя"
              disabled={!previous || !calendar || previous < calendar.minDate}
              onClick={() => select({ view: selection.view, date: previous })}>
              <Icon name="arrow" size={16} className="agenda__arrow--back" />
            </button>
            <button className="agenda__today" type="button" onClick={() => select({ view: 'day' })}>Сегодня</button>
            <button className="agenda__arrow" type="button" aria-label="Следующая неделя"
              disabled={!next || !calendar || next > calendar.maxDate}
              onClick={() => select({ view: selection.view, date: next })}>
              <Icon name="arrow" size={16} />
            </button>
            {monday ? <span className="agenda__range">{shortDay.format(new Date(monday))} — {shortDay.format(new Date(isoShift(monday, 6)))}</span> : null}
          </div>
          <div className="agenda__nav" role="group" aria-label="Режим просмотра">
            <button type="button" className="btn btn--outline" aria-pressed={selection.view === 'day'}
              onClick={() => select({ view: 'day', date })}>День</button>
            <button type="button" className="btn btn--outline" aria-pressed={selection.view === 'week'}
              onClick={() => select({ view: 'week', date })}>Неделя</button>
          </div>
        </div>
        {monday ? (
          <div className="agenda__days" role="group" aria-label="Дни недели">
            {Array.from({ length: 7 }, (_, offset) => {
              const entry = isoShift(monday, offset);
              return <button key={entry} type="button" className="agenda__day" aria-pressed={entry === date}
                data-on={entry === date || undefined} aria-label={fullDay.format(new Date(entry))}
                onClick={() => select({ view: 'day', date: entry })}>{shortDay.format(new Date(entry))}</button>;
            })}
          </div>
        ) : null}
        {state.status === 'loading' ? <p role="status" className="agenda__empty">Загружаем календарь…</p> : null}
        {state.status === 'error' ? <ErrorBlock compact message={state.message ?? 'Не удалось загрузить календарь.'}
          onRetry={() => { setState({ status: 'loading' }); setAttempt((value) => value + 1); }} /> : null}
        {state.status === 'ready' && calendar ? calendar.days.map((day) => (
          <section className="agenda__panel" key={day.date}>
            <header className="agenda__panel-head"><h3 className="agenda__panel-title">{fullDay.format(new Date(day.date))}</h3></header>
            {day.lessons.length ? <ol className="agenda__list">{day.lessons.map((lesson, index) => (
              <li className="agenda__pair" key={`${lesson.start}:${index}`}>
                <span className="agenda__time">{lesson.start} – {lesson.end}</span>
                <span className="agenda__body">
                  <span className="agenda__subject">{lesson.subject}</span>
                  <span className="agenda__meta">{[lesson.kind, lesson.teacher, lesson.building,
                    lesson.room ? `ауд. ${lesson.room}` : null].filter(Boolean).join(' · ')}</span>
                </span>
              </li>
            ))}</ol> : <p className="agenda__empty">Пар нет</p>}
          </section>
        )) : null}
      </div>
    </Card>
  );
}
