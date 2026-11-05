/* Разбор потока Server-Sent Events и перевод его в события помощника.

   Файл намеренно без зависимостей (кроме типов): его проверяет `node --test tests/sse.test.ts`
   без сборки, а браузер получает тот же код. */

import type { ChatEvent, ChatSource } from './types';

export interface SseChunk {
  event: string;
  data: string;
}

export interface SseReader {
  /** Добавить пришедший кусок текста и получить все завершённые события. */
  push(chunk: string): SseChunk[];
  /** Хвост буфера после закрытия потока (последнее событие может прийти без пустой строки). */
  flush(): SseChunk[];
}

const SEPARATOR = '\n\n';

/** Событийный парсер: держит буфер, потому что кусок сети может оборвать событие посередине. */
export function createSseReader(): SseReader {
  let buffer = '';

  function parse(block: string): SseChunk | null {
    let event = '';
    const data: string[] = [];

    for (const line of block.split('\n')) {
      if (line === '' || line.startsWith(':')) continue;
      const colon = line.indexOf(':');
      const field = colon === -1 ? line : line.slice(0, colon);
      let value = colon === -1 ? '' : line.slice(colon + 1);
      if (value.startsWith(' ')) value = value.slice(1);

      if (field === 'event') event = value;
      if (field === 'data') data.push(value);
    }

    if (event === '' && data.length === 0) return null;
    return { event: event === '' ? 'message' : event, data: data.join('\n') };
  }

  function drain(final: boolean): SseChunk[] {
    const chunks: SseChunk[] = [];

    for (;;) {
      const at = buffer.indexOf(SEPARATOR);
      if (at === -1) break;
      const block = buffer.slice(0, at);
      buffer = buffer.slice(at + SEPARATOR.length);
      const chunk = parse(block);
      if (chunk) chunks.push(chunk);
    }

    if (final && buffer.trim() !== '') {
      const chunk = parse(buffer);
      buffer = '';
      if (chunk) chunks.push(chunk);
    }

    return chunks;
  }

  return {
    push(chunk: string): SseChunk[] {
      buffer += chunk.replace(/\r\n?/g, '\n');
      return drain(false);
    },
    flush(): SseChunk[] {
      return drain(true);
    },
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asSources(value: unknown): ChatSource[] {
  if (!Array.isArray(value)) return [];
  const sources: ChatSource[] = [];
  for (const item of value) {
    const record = asRecord(item);
    if (!record) continue;
    const title = asString(record.title);
    const url = asString(record.url);
    if (title && url) sources.push({ title, url });
  }
  return sources;
}

/** Перевод SSE-события в событие помощника. Неизвестное или битое событие — `null`, поток не рвётся. */
export function toChatEvent(chunk: SseChunk): ChatEvent | null {
  let payload: unknown = null;
  try {
    payload = chunk.data.trim() === '' ? null : JSON.parse(chunk.data);
  } catch {
    return null;
  }

  const body = asRecord(payload);

  switch (chunk.event) {
    case 'meta': {
      const conversationId = asString(body?.conversation_id);
      return conversationId ? { type: 'meta', conversationId } : null;
    }
    case 'status': {
      const label = asString(body?.label);
      if (!label) return null;
      return { type: 'status', stage: asString(body?.stage) ?? 'work', label };
    }
    case 'delta': {
      const text = asString(body?.text);
      return text ? { type: 'delta', text } : null;
    }
    case 'card': {
      const tool = asString(body?.tool);
      const summary = asString(body?.summary);
      if (!tool || !summary) return null;
      const hint = asString(body?.hint);
      return { type: 'card', card: { tool, summary, data: body?.data ?? null, ...(hint ? { hint } : {}) } };
    }
    case 'sources': {
      const sources = Array.isArray(payload) ? asSources(payload) : asSources(body?.sources);
      return sources.length > 0 ? { type: 'sources', sources } : null;
    }
    case 'error': {
      const message = asString(body?.message);
      if (!message) return null;
      return { type: 'error', code: asString(body?.code) ?? 'error', message };
    }
    case 'done': {
      return { type: 'done', finish: asString(body?.finish) ?? 'stop' };
    }
    default:
      return null;
  }
}
