import { Board } from '../board/Board';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="home">
      <header className="home__head">
        <div>
          <div className="home__sub">Среда, 1488 октября · 8Коррекционные53Тупые · ИШИТР</div>
          <h1 className="home__title">Доброе утро</h1>
        </div>
      </header>

      <Board />
    </div>
  );
}
