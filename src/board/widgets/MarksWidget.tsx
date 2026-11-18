import { api } from '@/api/client';
import type { Marks } from '@/api/types';
import { useAsync } from '@/shared/lib/useAsync';

import { WidgetFrame } from '../WidgetFrame';
import { rowsFor } from '../boardStore';
import type { WidgetSize } from '../boardStore';


export function MarksWidget({ size }: { size: WidgetSize }) {
  const result = useAsync(api.marks);
  const limit = rowsFor(size);

  return (
    <WidgetFrame
      title="Оценки"
      size={size}
      result={result}
      emptyText="Оценок пока нет"
      isEmpty={(data: Marks) => data.recent.length === 0}
    >
      {(data) => (
        <>
          <p className="average">
            <span className="average__value">{data.average}</span>
            <span className="average__label">средний балл за семестр</span>
          </p>

          <ul className="rows">
            {data.recent.slice(0, limit).map((mark) => (
              <li key={mark.id} className="row">
                <span className="row__body">
                  <span className="row__title">{mark.subject}</span>
                  <span className="row__meta">
                    {mark.form} · {mark.when}
                  </span>
                </span>
                <span className={`mark mark--${mark.value >= 4 ? 'good' : 'low'}`}>{mark.value}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </WidgetFrame>
  );
}
