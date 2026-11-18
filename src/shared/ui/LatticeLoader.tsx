import './lattice.css';

export type LatticeStatus = 'working' | 'done' | 'error';

interface LatticeLoaderProps {
  /** Текст для скринридера; на экране подпись не дублируется. */
  label?: string;
  status?: LatticeStatus;
  size?: number;
}

/* Сетка 3×3 из LatticeLoader (React Bits): ячейки зажигаются по диагонали.
   Пока идёт ответ — «работает», после — «готово», при ошибке — «сбой». */
export function LatticeLoader({ label = 'Загрузка', status = 'working', size = 5 }: LatticeLoaderProps) {
  return (
    <span className="lattice" data-status={status} role="status" aria-label={label}>
      <span className="lattice__grid" aria-hidden="true" style={{ ['--lattice-cell' as string]: `${size}px` }}>
        {Array.from({ length: 9 }, (_, index) => (
          <span
            key={index}
            className="lattice__cell"
            style={{ animationDelay: `${(Math.floor(index / 3) + (index % 3)) * 90}ms` }}
          />
        ))}
      </span>
    </span>
  );
}
