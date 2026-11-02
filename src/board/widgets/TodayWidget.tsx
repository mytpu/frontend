import type { Lesson } from '../../api/types';
import './TodayWidget.css';

interface TodayWidgetProps {
  lessons: Lesson[];
  todayLabel: string;
}

export function TodayWidget({ lessons, todayLabel }: TodayWidgetProps) {
  const current = lessons.find((l) => l.status === 'current');

  return (
    <>
      <div className="wh">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M3 9h18M8 2v4M16 2v4" />
        </svg>
        Сегодня · {todayLabel}
        <a href="#">Вся неделя</a>
      </div>

      {current && (
        <div className="now-block">
          <small>
            Сейчас · {current.time}–{current.endTime}
          </small>
          <h5>{current.title}</h5>
          <p>
            {current.kind} · ауд. {current.room} · {current.teacher}
          </p>
          <div className="bar">
            <i />
          </div>
          <div className="meta">
            <span>Осталось 34 мин</span>
            <span>до перерыва</span>
          </div>
        </div>
      )}

      <div className="timeline">
        {lessons.map((l) => (
          <div key={l.id} className={`tl ${l.status}`}>
            <time>{l.time}</time>
            <i />
            <div>
              <b>{l.title}</b>
              <small>
                {l.kind} · {l.room}
              </small>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
