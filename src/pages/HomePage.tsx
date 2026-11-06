import { api, demoState } from '@/api/client';
import { useAsync } from '@/shared/lib/useAsync';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Board } from '@/board/Board';
import { useBoard } from '@/board/boardStore';
import { Skeleton } from '@/shared/ui/Card';

import './HomePage.css';

const DEMO_NOTICE: Record<string, string> = {
  'moodle-down': 'Демо-состояние: Moodle недоступен. Остальные виджеты живут — так и должно быть.',
  empty: 'Демо-состояние: сервисы вернули пустые списки. Виджеты показывают пустоту, а не ошибку.',
};

/* Время одного визита: пересчитывать его на каждый рендер незачем. */
const NOW = new Date();
const DATE_LABEL = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).format(NOW);

function greeting(hour: number): string {
  if (hour < 5) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export function HomePage() {
  const board = useBoard();
  const student = useAsync(api.student);

  const me = student.state.status === 'ready' ? student.state.data : null;
  const eyebrow = me ? `${DATE_LABEL} · ${me.group}` : DATE_LABEL;
  const visible = board.items.filter((item) => item.visible);

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={me ? `${greeting(NOW.getHours())}, ${me.firstName}` : 'Мой ТПУ'} />

      {DEMO_NOTICE[demoState] ? (
        <p className="home__demo">
          <span aria-hidden="true">●</span> {DEMO_NOTICE[demoState]}
        </p>
      ) : null}

      {student.state.status === 'loading' ? <Skeleton lines={3} /> : null}
      {student.state.status === 'error' ? (
        <p className="home__error">Данные студента не загрузились: {student.state.message}</p>
      ) : null}

      {student.state.status === 'ready' ? (
        visible.length > 0 ? (
          <Board items={board.items} />
        ) : (
          <section className="home__blank">
            <h2 className="home__blank-title">На доске пусто</h2>
            <p className="home__blank-text">Все виджеты скрыты. Включите нужные в настройке доски.</p>
          </section>
        )
      ) : null}
    </>
  );
}
