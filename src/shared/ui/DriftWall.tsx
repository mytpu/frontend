import './drift.css';

export interface DriftItem {
  image: string;
  title?: string;
}

interface DriftWallProps {
  items: DriftItem[];
  columns?: number;
  /** Секунд на полный проход колонки. */
  speed?: number;
  className?: string;
}

/* DriftWall (React Bits) в облегчённом виде: колонки листаются CSS-анимацией,
   без rAF, курсорного параллакса и 3D-наклона. Декоративный слой, не интерактив. */
export function DriftWall({ items, columns = 5, speed = 52, className }: DriftWallProps) {
  const lanes = Array.from({ length: columns }, (_, column) => items.filter((_, index) => index % columns === column));

  return (
    <div className={className ? `drift ${className}` : 'drift'} aria-hidden="true">
      {lanes.map((lane, column) => (
        <div
          key={column}
          className="drift__col"
          style={{
            animationDuration: `${speed + column * 6}s`,
            animationDirection: column % 2 === 0 ? 'normal' : 'reverse',
          }}
        >
          {[...lane, ...lane].map((item, index) => (
            <span key={index} className="drift__tile">
              <img src={item.image} alt="" loading="lazy" decoding="async" draggable={false} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
