import { SCHEDULE_CALENDAR_ENDPOINT, scheduleRequest, ScheduleSearchError } from './schedule';

export type CalendarView = 'day' | 'week';

export interface CalendarSelection {
  view: CalendarView;
  date?: string;
}

export interface Lesson {
  start: string;
  end: string;
  subject: string;
  kind?: string | null;
  teacher?: string | null;
  building?: string | null;
  room?: string | null;
}

export interface Calendar {
  group: string;
  source: 'demo';
  timeZone: 'Asia/Tomsk';
  selectedDate: string;
  weekStart: string;
  minDate: string;
  maxDate: string;
  days: { date: string; lessons: Lesson[] }[];
}

export async function loadDemoGroup(signal: AbortSignal): Promise<string | null> {
  try {
    const response = await scheduleRequest(SCHEDULE_CALENDAR_ENDPOINT, signal);
    const { demoGroup } = await response.json() as { demoGroup: string };
    return demoGroup;
  } catch (error) {
    if (error instanceof ScheduleSearchError && error.status === 404) return null;
    throw error;
  }
}

export async function loadCalendar(group: string, selection: CalendarSelection, signal: AbortSignal): Promise<Calendar> {
  const response = await scheduleRequest(SCHEDULE_CALENDAR_ENDPOINT, signal, { group, ...selection });
  const calendar = await response.json() as Calendar;
  if (calendar.group !== group || calendar.source !== 'demo' || !Array.isArray(calendar.days)) {
    throw new Error('Неверный ответ календаря');
  }
  return calendar;
}
