import { useState } from 'react';

import { useViewer } from '@/auth/session';
import { Chip } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Board } from '@/board/Board';
import { BoardConfigDialog } from '@/board/BoardConfigDialog';
import { useBoard } from '@/board/boardStore';

import './HomePage.css';


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
  const [configOpen, setConfigOpen] = useState(false);
  const me = useViewer();
  const visible = board.items.filter((item) => item.visible);

  return (
    <>
      <PageHeader eyebrow={DATE_LABEL} title={`${greeting(NOW.getHours())}, ${me.name}`}>
        <Chip tone="demo">демо</Chip>
        <button className="btn btn--outline" type="button" onClick={() => setConfigOpen(true)}>
          <Icon name="settings" size={16} />
          Настроить доску
        </button>
      </PageHeader>


      {visible.length > 0 ? (
          <Board board={board} />
        ) : (
          <section className="home__blank">
            <h2 className="home__blank-title">На доске пусто</h2>
            <p className="home__blank-text">
              Виджеты скрыты. Верните расписание и дедлайны — или соберите доску заново.
            </p>
            <div className="home__blank-actions">
              <button className="btn btn--contrast" type="button" onClick={() => setConfigOpen(true)}>
                Выбрать виджеты
              </button>
            </div>
          </section>
      )}

      <BoardConfigDialog open={configOpen} onClose={() => setConfigOpen(false)} board={board} />
    </>
  );
}
