export const SCHEDULE_SEARCH_ENDPOINT = '/api/ai/schedule/search';

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

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function searchSchedule(query: string, signal: AbortSignal): Promise<ScheduleResults> {
  const response = await fetch(SCHEDULE_SEARCH_ENDPOINT, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(25_000)]),
  });
  if (!response.ok) {
    const message = response.status === 504 ? 'Источник расписания не ответил вовремя.'
      : response.status === 429 ? 'Слишком много запросов. Попробуйте немного позже.'
        : 'Не удалось найти расписание. Попробуйте снова.';
    throw new ScheduleSearchError(response.status, message);
  }
  return response.json() as Promise<ScheduleResults>;
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
