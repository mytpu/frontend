import type { ChatCard, DocsCardData, DocsHit, RaspCardData, RaspItem } from '@/api/types';
import { Icon } from '@/shared/ui/Icon';

import './cards.css';

/* Карточки инструментов шлюза. Данные приходят как `unknown`: форму проверяем здесь,
   а не доверяем ей — поток идёт из сети. */

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

function asRasp(data: unknown): RaspCardData | null {
  const body = record(data);
  if (!body || !Array.isArray(body.items)) return null;

  const items: RaspItem[] = [];
  for (const entry of body.items) {
    const item = record(entry);
    if (!item) continue;
    const name = text(item.name);
    const url = text(item.url);
    if (!name || !url) continue;
    items.push({ name, kind: text(item.kind) ?? '', url, ...(text(item.hint) ? { hint: text(item.hint) as string } : {}) });
  }

  return { total: typeof body.total === 'number' ? body.total : items.length, items };
}

function asDocs(data: unknown): DocsCardData | null {
  const body = record(data);
  if (!body) return null;

  const hits: DocsHit[] = [];
  if (Array.isArray(body.hits)) {
    for (const entry of body.hits) {
      const hit = record(entry);
      if (!hit) continue;
      const title = text(hit.title);
      const url = text(hit.url);
      if (!title || !url) continue;
      hits.push({ title, url, excerpt: text(hit.excerpt) ?? '', ...(text(hit.section) ? { section: text(hit.section) as string } : {}) });
    }
  }

  return { found: body.found === true && hits.length > 0, hits };
}

export function ChatCardView({ card }: { card: ChatCard }) {
  if (card.tool === 'rasp_find') {
    const data = asRasp(card.data);
    if (data) return <RaspView data={data} summary={card.summary} hint={card.hint} />;
  }

  if (card.tool === 'docs_search') {
    const data = asDocs(card.data);
    if (data) return <DocsView data={data} summary={card.summary} hint={card.hint} />;
  }

  return <GenericView card={card} />;
}

function CardHead({ tool, count }: { tool: string; count?: number }) {
  return (
    <header className="card-tool__head">
      <code className="card-tool__tool">{tool}</code>
      {typeof count === 'number' ? <span className="card-tool__count">{count}</span> : null}
    </header>
  );
}

function RaspView({ data, summary, hint }: { data: RaspCardData; summary: string; hint?: string }) {
  return (
    <section className="card-tool">
      <CardHead tool="rasp_find" count={data.total} />
      <p className="card-tool__summary">{summary}</p>

      {data.items.length > 0 ? (
        <ul className="card-tool__list">
          {data.items.map((item) => (
            <li key={item.url} className="card-tool__row">
              <span className="card-tool__body">
                <span className="card-tool__title">{item.name}</span>
                <span className="card-tool__meta">
                  {item.kind}
                  {item.hint ? ` · ${item.hint}` : ''}
                </span>
              </span>
              <a className="card-tool__link" href={item.url} target="_blank" rel="noreferrer">
                Расписание
                <Icon name="external" size={14} />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="card-tool__meta">Совпадений нет — уточните номер аудитории, группы или фамилию.</p>
      )}

      {hint ? <p className="card-tool__hint">{hint}</p> : null}
    </section>
  );
}

function DocsView({ data, summary, hint }: { data: DocsCardData; summary: string; hint?: string }) {
  return (
    <section className="card-tool">
      <CardHead tool="docs_search" count={data.hits.length} />
      <p className="card-tool__summary">{summary}</p>

      {data.hits.length > 0 ? (
        <ul className="card-tool__list">
          {data.hits.map((hit) => (
            <li key={hit.url} className="card-tool__row card-tool__row--wide">
              <span className="card-tool__body">
                <a className="card-tool__title card-tool__title--link" href={hit.url} target="_blank" rel="noreferrer">
                  {hit.title}
                </a>
                {hit.section ? <span className="card-tool__meta">{hit.section}</span> : null}
                {hit.excerpt ? <span className="card-tool__excerpt">{hit.excerpt}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="card-tool__meta">По документам ТПУ ничего не нашлось.</p>
      )}

      {hint ? <p className="card-tool__hint">{hint}</p> : null}
    </section>
  );
}

function GenericView({ card }: { card: ChatCard }) {
  return (
    <section className="card-tool">
      <CardHead tool={card.tool} />
      <p className="card-tool__summary">{card.summary}</p>
      {card.hint ? <p className="card-tool__hint">{card.hint}</p> : null}
      <details className="card-tool__raw">
        <summary>Данные инструмента</summary>
        <pre>{JSON.stringify(card.data, null, 2)}</pre>
      </details>
    </section>
  );
}
