import { createSseReader, toChatEvent } from './sse';
import { SESSION_EXPIRED } from '@/auth/session';
import type { ChatEvent } from './types';

/* Клиент потока помощника. Браузер обращается к своему origin, ключ шлюза доклеивает сервер
   (в разработке — `server.proxy` в vite.config.ts). Ни мастер-ключ шлюза, ни ключ модели
   в клиентский бандл не попадают. */

export const CHAT_ENDPOINT = '/api/ai/chat/stream';

export interface ChatOptions {
  conversationId: string | null;
  signal: AbortSignal;
  onEvent: (event: ChatEvent) => void;
}

interface ErrorBody {
  error?: unknown;
  message?: unknown;
}

function errorFrom(body: ErrorBody, status: number): string {
  if (typeof body.message === 'string' && body.message.trim() !== '') return body.message;
  return `Шлюз ответил ошибкой ${status}`;
}

/** Отправляет сообщение и отдаёт события по мере прихода. Бросает только при обрыве, который некуда деть. */
export async function streamChat(message: string, options: ChatOptions): Promise<void> {
  const { conversationId, signal, onEvent } = options;
  let response: Response;

  try {
    response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ message, conversationId }),
      signal,
    });
  } catch (error) {
    if (signal.aborted) return;
    onEvent({
      type: 'error',
      code: 'network',
      message: error instanceof Error ? error.message : 'Нет связи со шлюзом',
    });
    return;
  }

  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event(SESSION_EXPIRED));
    let text = '';
    try {
      text = await response.text();
    } catch {
      text = '';
    }
    let body: ErrorBody = {};
    try {
      body = text.trim() === '' ? {} : (JSON.parse(text) as ErrorBody);
    } catch {
      body = {};
    }
    const code = response.status === 404 && body.error === 'conversation_not_found' ? body.error : 'http';
    onEvent({ type: 'error', code, message: errorFrom(body, response.status) });
    return;
  }

  if (!response.body) {
    onEvent({ type: 'error', code: 'no_body', message: 'Шлюз не вернул поток' });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const sse = createSseReader();

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const chunk of sse.push(decoder.decode(value, { stream: true }))) {
        const event = toChatEvent(chunk);
        if (event) onEvent(event);
      }
    }
    for (const chunk of sse.flush()) {
      const event = toChatEvent(chunk);
      if (event) onEvent(event);
    }
  } catch {
    if (signal.aborted) return;
    onEvent({ type: 'error', code: 'stream', message: 'Поток ответа прервался' });
  }
}
