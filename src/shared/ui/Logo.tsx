import './logo.css';

/* Микрологотип из макета: зелёный крест на сетке 3×3, углы графитовые. */
export function Logo({ size = 22, withText = false }: { size?: number; withText?: boolean }) {
  const cell = size / 3;
  const cells = [0, 1, 2].flatMap((row) =>
    [0, 1, 2].map((col) => ({
      key: `${row}-${col}`,
      x: col * cell,
      y: row * cell,
      corner: (row !== 1 && col !== 1) as boolean,
    })),
  );

  return (
    <span className="logo">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {cells.map((c) => (
          <rect
            key={c.key}
            x={c.x + 0.4}
            y={c.y + 0.4}
            width={cell - 0.8}
            height={cell - 0.8}
            rx={1.6}
            fill={c.corner ? 'var(--logo-corner)' : 'var(--logo-cross)'}
          />
        ))}
      </svg>
      {withText ? <span className="logo__text">Мой ТПУ</span> : null}
    </span>
  );
}
