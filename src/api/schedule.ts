export const SCHEDULE_SEARCH_ENDPOINT = '/api/ai/schedule/search';
export const SCHEDULE_CALENDAR_ENDPOINT = '/api/ai/schedule/calendar';

export interface ScheduleItem {
  name: string;
  kind: string;
  hint: string | null;
  url: string;
}

export interface ScheduleResults {
  total: number;
  items: ScheduleItem[];
}

export class ScheduleSearchError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function searchSchedule(query: string, signal: AbortSignal): Promise<ScheduleResults> {
  return (await scheduleRequest(SCHEDULE_SEARCH_ENDPOINT, signal, { query })).json() as Promise<ScheduleResults>;
}

export async function scheduleRequest(path: string, signal: AbortSignal, body?: object): Promise<Response> {
  const response = await fetch(path, {
    method: body ? 'POST' : 'GET',
    credentials: 'same-origin',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.any([signal, AbortSignal.timeout(25_000)]),
  });
  if (!response.ok) {
    const message = response.status === 504 ? 'Источник расписания не ответил вовремя.'
      : response.status === 429 ? 'Слишком много запросов. Попробуйте немного позже.'
        : 'Не удалось найти расписание. Попробуйте снова.';
    const data = await response.json().catch(() => null) as { error?: string } | null;
    throw new ScheduleSearchError(response.status, message, data?.error);
  }
  return response;
}

export function calendarUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && url.origin === 'https://rasp.tpu.ru' && !url.username && !url.password) {
      return url.href;
    }
  } catch {
    return undefined;
  }
  return undefined;
}
