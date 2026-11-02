import { useEffect, useState } from 'react';
import { Board } from '@/board/Board';
import { getHomeSummary } from '@/api/mock';
import type { HomeSummary } from '@/api/types';
import './HomePage.css';

function greeting(now: Date): string {
  const h = now.getHours();
  if (h < 5) return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export default function HomePage() {
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [now] = useState(() => new Date());

  useEffect(() => {
    getHomeSummary().then(setSummary);
  }, []);

  return (
    <div className="home">
      <header className="home__head">
        <div>
          <div className="home__sub">
            {summary
              ? `${summary.todayLabel} · ${summary.group} · ${summary.department}`
              : 'Загрузка…'}
          </div>
          <h1 className="home__title">
            {greeting(now)}
            {summary ? `, ${summary.studentName}` : ''}
          </h1>
        </div>
      </header>

      <Board />
    </div>
  );
}
