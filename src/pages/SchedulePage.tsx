import { useCallback, useState } from 'react';

import { api } from '@/api/client';
import type { Pair, ScheduleDay } from '@/api/types';
import { useAsync } from '@/shared/lib/useAsync';
import { Chip, ErrorBlock, Skeleton } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { PageHeader } from '@/shared/ui/PageHeader';
import { ScheduleSearch } from './ScheduleSearch';

import './schedule.css';

const WEEKDAY_SHORT = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

function minutes(value: string): number {
  const [hours, mins] = value.split(':').map(Number);
  return hours * 60 + mins;
}

/** Идущая пара — только у сегодняшнего дня: остальные дни просто список. */
function runningPair(day: ScheduleDay): string | null {
  if (!day.isToday) return null;
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  return day.pairs.find((pair: Pair) => current >= minutes(pair.start) && current < minutes(pair.end))?.id ?? null;
}

export function SchedulePage() {
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState('');

  const load = useCallback(() => api.agenda(offset), [offset]);
  const agenda = useAsync(load);

  const data = agenda.state.status === 'ready' ? agenda.state.data : null;

  const day =
    data?.days.find((item) => item.iso === selected) ?? data?.days.find((item) => item.isToday) ?? data?.days[0] ?? null;
  const running = day ? runningPair(day) : null;

  function jumpTo(iso: string) {
    if (iso === '') return;
    const [year, month, day] = iso.split('-').map(Number);
    const target = new Date(year, month - 1, day);
    const base = new Date();
    const monday = (value: Date) => {
      const date = new Date(value.getFullYear(), value.getMonth(), value.getDate());
      date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
      return date;
    };
    setOffset(Math.round((monday(target).getTime() - monday(base).getTime()) / (7 * 86400000)));
    setSelected(iso);
  }

  function goToday() {
    setOffset(0);
    setSelected('');
  }

  return (
    <>
      <PageHeader title="Расписание">
        <a className="btn btn--outline" href="https://rasp.tpu.ru" target="_blank" rel="noreferrer">
          rasp.tpu.ru
          <Icon name="external" size={15} />
        </a>
      </PageHeader>

      <ScheduleSearch />

      {agenda.state.status === 'loading' ? <Skeleton lines={6} /> : null}
      {agenda.state.status === 'error' ? (
        <ErrorBlock message={agenda.state.message} onRetry={agenda.reload} />
      ) : null}

      {data && day ? (
        <section className="agenda">
          <div className="agenda__bar">
            <div className="agenda__nav">
              <button
                className="agenda__arrow"
                type="button"
                aria-label="Предыдущая неделя"
                onClick={() => setOffset((value) => value - 1)}
              >
                <Icon name="arrow" size={16} className="agenda__arrow--back" />
              </button>
              <button className="agenda__today" type="button" onClick={goToday}>
                Сегодня
              </button>
              <button
                className="agenda__arrow"
                type="button"
                aria-label="Следующая неделя"
                onClick={() => setOffset((value) => value + 1)}
              >
                <Icon name="arrow" size={16} />
              </button>
              <input
                className="agenda__date"
                type="date"
                aria-label="Перейти к неделе"
                onChange={(event) => jumpTo(event.target.value)}
              />
              <span className="agenda__range">{data.weekLabel}</span>
              <Chip tone="demo">Демонстрационные пары</Chip>
            </div>
          </div>

          <div className="agenda__days" role="tablist" aria-label="Дни недели">
            {data.days.map((item, index) => (
              <button
                key={item.iso}
                role="tab"
                type="button"
                aria-selected={item.iso === day.iso}
                className="agenda__day"
                data-on={item.iso === day.iso || undefined}
                data-today={item.isToday || undefined}
                onClick={() => setSelected(item.iso)}
              >
                <span className="agenda__wd">{WEEKDAY_SHORT[index]}</span>
                <span className="agenda__num">{item.dateLabel.split(' ')[0]}</span>
                <span className="agenda__dot" data-empty={item.pairs.length === 0 || undefined} aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className="agenda__panel">
            <header className="agenda__panel-head">
              <h2 className="agenda__panel-title">
                {day.weekday}, {day.dateLabel}
              </h2>
              {running ? <Chip tone="ok">идёт</Chip> : null}
            </header>

            {day.pairs.length === 0 ? (
              <p className="agenda__empty">Пар нет</p>
            ) : (
              <ol className="agenda__list">
                {day.pairs.map((pair) => (
                  <li key={pair.id} className="agenda__pair" data-now={pair.id === running || undefined}>
                    <span className="agenda__time">
                      {pair.start}
                      <span className="agenda__dash" aria-hidden="true">
                        –
                      </span>
                      {pair.end}
                    </span>
                    <span className="agenda__body">
                      <span className="agenda__subject">{pair.subject}</span>
                      <span className="agenda__meta">
                        {pair.kind} · ауд. {pair.room}, корп. {pair.building}
                        {pair.teacher ? ` · ${pair.teacher}` : ''}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      ) : null}
    </>
  );
}
