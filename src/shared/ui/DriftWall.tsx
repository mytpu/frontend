import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useState } from 'react';

import './drift.css';

export interface DriftItem {
  image: string;
  title?: string;
}

interface DriftWallProps {
  items: DriftItem[];
  columns?: number;
  tileWidth?: number;
  tileHeight?: number;
  gap?: number;
  radius?: number;
  tilt?: number;
  turn?: number;
  perspective?: number;
  depth?: number;
  speed?: number;
  direction?: 'up' | 'down';
  variance?: number;
  parallax?: number;
  lift?: number;
  fade?: number;
  dim?: number;
  overlayColor?: string;
  className?: string;
}

const SHIFT = 0.16;

/* DriftWall (React Bits, JS+CSS) — оригинальная механика: колонки едут в rAF,
   соседние в разные стороны, плоскость наклонена и слегка следует за курсором.
   Плитки декоративные: наведение поднимает их к зрителю, ссылок нет. */
export function DriftWall({
  items,
  columns = 5,
  tileWidth = 160,
  tileHeight = 108,
  gap = 14,
  radius = 14,
  tilt = 16,
  turn = -14,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = 'up',
  variance = 0.45,
  parallax = 0.6,
  lift = 64,
  fade = 0.6,
  dim = 0.55,
  overlayColor = '#060010',
  className,
}: DriftWallProps) {
  const root = useRef<HTMLDivElement>(null);
  const plane = useRef<HTMLDivElement>(null);
  const tracks = useRef<(HTMLDivElement | null)[]>([]);
  const shifts = useRef<number[]>([]);
  const velocities = useRef<number[]>([]);
  const pointer = useRef({ x: 0, y: 0 });
  const damped = useRef({ x: 0, y: 0 });
  const [height, setHeight] = useState(600);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const lanes = useMemo(() => {
    const cols: DriftItem[][] = Array.from({ length: columns }, () => []);
    items.forEach((item, index) => cols[index % columns].push(item));
    return cols.map((col) => (col.length > 0 ? col : items.slice(0, 1)));
  }, [items, columns]);

  useLayoutEffect(() => {
    if (!root.current) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height || 600));
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  const metrics = useMemo(() => {
    const unit = tileHeight + gap;
    return lanes.map((lane) => {
      const copy = Math.max(unit, lane.length * unit);
      return { copy, copies: Math.max(2, Math.ceil((height * 1.6) / copy) + 1) };
    });
  }, [lanes, tileHeight, gap, height]);

  const baseSpeed = useMemo(() => {
    const sign = direction === 'up' ? 1 : -1;
    return lanes.map((_, index) => {
      const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
      return speed * (1 + variance * pseudo) * sign * (index % 2 === 0 ? 1 : -1);
    });
  }, [lanes, speed, direction, variance]);

  useEffect(() => {
    shifts.current = metrics.map((meta, index) => meta.copy * ((index * 0.37) % 1));
    velocities.current = lanes.map(() => 0);
  }, [metrics, lanes]);

  useEffect(() => {
    if (!plane.current) return;
    let frameId = 0;

    function frame() {
      const max = parallax * 8;
      const targetX = pointer.current.x * max;
      const targetY = -pointer.current.y * max;
      const ease = 1 - Math.exp(-SHIFT);
      damped.current.x += (targetX - damped.current.x) * ease;
      damped.current.y += (targetY - damped.current.y) * ease;

      if (plane.current) {
        plane.current.style.transform =
          `translate(-50%, -50%) scale(1.18) rotateX(${tilt + damped.current.y}deg) ` +
          `rotateY(${turn + damped.current.x}deg) translateZ(${-depth}px)`;
      }

      const dt = 1 / 60;
      if (!reduced) {
        for (let index = 0; index < tracks.current.length; index += 1) {
          const meta = metrics[index];
          const track = tracks.current[index];
          if (!meta || !track) continue;
          const target = baseSpeed[index] ?? 0;
          velocities.current[index] += (target - velocities.current[index]) * (1 - Math.exp(-dt / 0.28));
          let next = (shifts.current[index] ?? 0) + velocities.current[index] * dt;
          next = ((next % meta.copy) + meta.copy) % meta.copy;
          shifts.current[index] = next;
          track.style.transform = `translate3d(0, ${-next}px, 0)`;
        }
      }

      frameId = requestAnimationFrame(frame);
    }

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [baseSpeed, metrics, parallax, reduced, tilt, turn, depth]);

  return (
    <div
      ref={root}
      className={className ? `drift-wall ${className}` : 'drift-wall'}
      aria-hidden="true"
      style={
        {
          '--dw-tile-w': `${tileWidth}px`,
          '--dw-radius': `${radius}px`,
          '--dw-perspective': `${perspective}px`,
          '--dw-lift': `${lift}px`,
          '--dw-dim': dim,
          '--dw-overlay': overlayColor,
          '--dw-edge': `${Math.max(0, (1 - fade) * 100)}%`,
        } as CSSProperties
      }
    >
      <div ref={plane} className="drift-wall__plane">
        {lanes.map((lane, column) => (
          <div className="drift-wall__col" key={column}>
            <div
              className="drift-wall__track"
              ref={(element) => {
                tracks.current[column] = element;
              }}
            >
              {Array.from({ length: metrics[column]?.copies ?? 2 }).map((_, copy) =>
                lane.map((item, index) => (
                  <span key={`${copy}-${index}`} className="drift-wall__tile">
                    <span className="drift-wall__inner">
                      <img src={item.image} alt="" loading="lazy" decoding="async" draggable={false} />
                      <span className="drift-wall__overlay" />
                    </span>
                  </span>
                )),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
