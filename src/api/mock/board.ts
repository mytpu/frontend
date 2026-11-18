/* Демо-данные доски: студент, неделя, дедлайны, письма, оценки, заявки.
   Настоящих ответов lk/rasp/lms/mail/help пока нет — из них через шлюз доступны только поиск
   по документам и поиск объекта в расписании. Поэтому в интерфейсе эти данные помечены чипом «демо».
   Даты считаются от текущего дня, чтобы неделя не выглядела прошлогодней. */

import { TIMETABLE } from './timetable';
import type {
  AgendaData,
  Deadline,
  DaySummary,
  InboxItem,
  Mark,
  Pair,
  Request,
  ScheduleDay,
  Student,
  TodayData,
} from '../types';

export const STUDENT: Student = {
  name: 'Анна Ковалёва',
  firstName: 'Анна',
  initials: 'АК',
  group: '8К31',
  institute: 'Инженерная школа информационных технологий',
  course: 3,
  program: '09.03.01 Информатика и вычислительная техника',
  email: 'anna.kovaleva@tpu.ru',
};

const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function mondayOf(date: Date): Date {
  const day = startOfDay(date);
  day.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  return day;
}

function iso(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function summary(date: Date): DaySummary {
  return {
    iso: iso(date),
    weekday: WEEKDAYS[date.getDay()],
    dateLabel: `${date.getDate()} ${MONTHS[date.getMonth()]}`,
  };
}

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function pairsFor(date: Date): Pair[] {
  return TIMETABLE[(date.getDay() + 6) % 7] ?? [];
}

/** День студента на текущую дату: идущая пара и ближайшее окно считаются по часам, а не зашиты. */
export function todayFixture(date = new Date()): TodayData {
  const pairs = pairsFor(date);
  const minutes = date.getHours() * 60 + date.getMinutes();

  let nowPairId: string | null = null;
  let minsLeft: number | null = null;
  for (const item of pairs) {
    if (minutes >= toMinutes(item.start) && minutes < toMinutes(item.end)) {
      nowPairId = item.id;
      minsLeft = toMinutes(item.end) - minutes;
      break;
    }
  }

  let gap: string | null = null;
  const index = pairs.findIndex((item) => toMinutes(item.start) > minutes);
  if (index !== -1) {
    const from = pairs[index - 1]?.end ?? '08:00';
    gap = `Окно ${from}–${pairs[index].start}`;
  }

  return { day: summary(date), pairs, nowPairId, minsLeft, gap };
}

/** Неделя с понедельника: `offset` — сдвиг в неделях от текущей (0 — эта неделя). */
export function agendaFixture(offset = 0, date = new Date()): AgendaData {
  const monday = mondayOf(date);
  monday.setDate(monday.getDate() + offset * 7);
  const today = summary(date).iso;

  const days: ScheduleDay[] = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return { ...summary(day), pairs: pairsFor(day), isToday: summary(day).iso === today };
  });

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const sameMonth = monday.getMonth() === sunday.getMonth();

  return {
    weekLabel: sameMonth
      ? `${monday.getDate()}–${sunday.getDate()} ${MONTHS[sunday.getMonth()]}`
      : `${monday.getDate()} ${MONTHS[monday.getMonth()]} – ${sunday.getDate()} ${MONTHS[sunday.getMonth()]}`,
    offset,
    days,
  };
}

export const DEADLINES: Deadline[] = [
  {
    id: 'dl-1',
    title: 'Лабораторная № 4: сортировки',
    subject: 'Программирование',
    due: 'сегодня, 23:59',
    tone: 'warn',
    source: 'Moodle',
  },
  {
    id: 'dl-2',
    title: 'Задача 12: пределы функций',
    subject: 'Математический анализ',
    due: 'завтра, 12:00',
    tone: 'warn',
    source: 'Moodle',
  },
  {
    id: 'dl-3',
    title: 'Эссе «Реформы Александра II»',
    subject: 'История России',
    due: 'пятница, 18:00',
    tone: 'neutral',
    source: 'Moodle',
  },
  {
    id: 'dl-4',
    title: 'Отчёт по практике в Л-4',
    subject: 'Физика',
    due: '25 ноября',
    tone: 'neutral',
    source: 'Почта',
  },
];

export const INBOX: InboxItem[] = [
  {
    id: 'in-1',
    source: 'moodle',
    who: 'Программирование',
    text: 'Открыта лабораторная № 4, дедлайн сегодня в 23:59',
    time: '09:12',
    unread: true,
  },
  {
    id: 'in-2',
    source: 'mail',
    who: 'Деканат ИШИТР',
    text: 'Заседание старост в среду, 14:30, ауд. 210',
    time: '08:40',
    unread: true,
  },
  {
    id: 'in-3',
    source: 'help',
    who: 'help.tpu.ru',
    text: 'Заявка № 41028 переведена в статус «в работе»',
    time: 'вчера',
    unread: false,
  },
  {
    id: 'in-4',
    source: 'moodle',
    who: 'Математический анализ',
    text: 'Добавлен разбор задачи 11',
    time: 'вчера',
    unread: false,
  },
];

export const MARKS: { average: string; recent: Mark[] } = {
  average: '4,6',
  recent: [
    { id: 'mk-1', subject: 'Программирование', form: 'защита лабы', value: 5, when: '12 ноября' },
    { id: 'mk-2', subject: 'Физика', form: 'контрольная', value: 4, when: '11 ноября' },
    { id: 'mk-3', subject: 'Математический анализ', form: 'коллоквиум', value: 5, when: '7 ноября' },
    { id: 'mk-4', subject: 'Английский язык', form: 'устный ответ', value: 4, when: '5 ноября' },
  ],
};

export const REQUESTS: Request[] = [
  {
    id: 'rq-1',
    number: '41028',
    title: 'Не открывается курс в Moodle',
    place: 'help.tpu.ru · LMS',
    status: 'в работе',
    updated: 'сегодня',
  },
  {
    id: 'rq-2',
    number: '40877',
    title: 'Нет доступа к сетевой папке кафедры',
    place: 'help.tpu.ru · Сеть',
    status: 'ждёт ответа',
    updated: 'вчера',
  },
  {
    id: 'rq-3',
    number: '40510',
    title: 'Дубликат оценки в зачётке',
    place: 'help.tpu.ru · Учёба',
    status: 'решено',
    updated: '3 ноября',
  },
];
