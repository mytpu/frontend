/* Контракты данных «Мой ТПУ». Экраны знают только эти типы и не знают, откуда пришли поля:
   сегодня — демо-слой, завтра — шлюз. */

export type ServiceId = 'lk' | 'rasp' | 'moodle' | 'mail' | 'help' | 'docs';

export type PairKind = 'лекция' | 'практика' | 'лабораторная';

export interface Pair {
  id: string;
  start: string;
  end: string;
  subject: string;
  kind: PairKind;
  room: string;
  building: string;
  teacher?: string;
}

export interface DaySummary {
  iso: string;
  weekday: string;
  dateLabel: string;
}

export interface TodayData {
  day: DaySummary;
  pairs: Pair[];
  nowPairId: string | null;
  minsLeft: number | null;
  gap: string | null;
}

export interface ScheduleDay extends DaySummary {
  pairs: Pair[];
  isToday: boolean;
}

/** Лента расписания: семь дней подряд от понедельника выбранной недели. */
export interface AgendaData {
  weekLabel: string;
  offset: number;
  days: ScheduleDay[];
}

export type DeadlineSource = 'Moodle' | 'Почта' | 'ЛК';

export interface Deadline {
  id: string;
  title: string;
  subject: string;
  due: string;
  tone: 'warn' | 'neutral';
  source: DeadlineSource;
}

export type InboxSource = 'mail' | 'moodle' | 'help';

export interface InboxItem {
  id: string;
  source: InboxSource;
  who: string;
  text: string;
  time: string;
  unread: boolean;
}

export interface Mark {
  id: string;
  subject: string;
  form: string;
  value: 2 | 3 | 4 | 5;
  when: string;
}

export interface Marks {
  average: string;
  recent: Mark[];
}

export type RequestStatus = 'в работе' | 'решено' | 'ждёт ответа';

export interface Request {
  id: string;
  number: string;
  title: string;
  place: string;
  status: RequestStatus;
  updated: string;
}

export interface Student {
  name: string;
  firstName: string;
  initials: string;
  group: string;
  institute: string;
  course: number;
  program: string;
  email: string;
}

/** Плитка сервиса. `via` — правда о том, что уже идёт через шлюз, а что пока только ссылка. */
export interface Service {
  id: ServiceId;
  title: string;
  subtitle: string;
  url: string;
  via: 'gateway' | 'link';
}

export interface QuickAction {
  id: string;
  title: string;
  prompt: string;
}

export interface AppNotification {
  id: string;
  service: ServiceId;
  title: string;
  text: string;
  time: string;
  unread: boolean;
}

export interface AccessApp {
  id: string;
  title: string;
  scope: string;
  status: 'подключено' | 'по запросу' | 'нет доступа';
}

/* ---------- помощник: то, что приходит в потоке ---------- */

/** Карточка инструмента шлюза. `data` намеренно `unknown`: форму знает только рендерер этого инструмента. */
export interface ChatCard {
  tool: string;
  summary: string;
  data: unknown;
  hint?: string;
}

export interface ChatSource {
  title: string;
  url: string;
}

export type ChatEvent =
  | { type: 'meta'; conversationId: string }
  | { type: 'status'; stage: string; label: string }
  | { type: 'delta'; text: string }
  | { type: 'card'; card: ChatCard }
  | { type: 'sources'; sources: ChatSource[] }
  | { type: 'error'; code: string; message: string }
  | { type: 'done'; finish: string };

/* ---------- формы данных инструментов ---------- */

export interface RaspItem {
  name: string;
  kind: string;
  hint?: string;
  url: string;
}

export interface RaspCardData {
  total: number;
  items: RaspItem[];
}

export interface DocsHit {
  title: string;
  section?: string | null;
  url: string;
  excerpt: string;
  updatedAt?: string;
}

export interface DocsCardData {
  found: boolean;
  hits: DocsHit[];
}
