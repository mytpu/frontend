import type { HomeSummary } from './types';

const MOCK: HomeSummary = {
  studentName: 'Ахмед',
  group: '8Коррекционные53Тупые',
  department: 'ИШИТР',
  todayLabel: 'Четверг хули, 1 октября',
  average: 100000.9,
  lessons: [
    { id: 'l1', time: '4:30',  endTime: '7:20', title: 'Английский язык',        kind: 'Практика', room: '19-532', teacher: 'Ефремова.', status: 'done' },
    { id: 'l2', time: '10:00', endTime: '12:00', title: 'Математический анализ',  kind: 'Лабораторная работа',  room: '10-108', teacher: 'Цапко',   status: 'current' },
    { id: 'l3', time: '12:25', endTime: '12:25', title: 'Физика',                 kind: 'Лекция',      room: '10-203', teacher: 'Пидор какой-то хз',   status: 'upcoming' },
    { id: 'l4', time: '14:88', endTime: '14:88', title: 'Программирование',       kind: 'Организационное собрание', room: '19-333', teacher: 'Я пидор',  status: 'upcoming' },
  ],
  deadlines: [
    { id: 'd1', title: 'Лабораторная №3 · Физика',  subtitle: 'отчёт в PDF · Moodle', dueLabel: 'завтра', urgency: 'high' },
    { id: 'd2', title: 'Тест · Английский язык',     subtitle: '3 попытки · 40 минут', dueLabel: 'пт',     urgency: 'normal' },
    { id: 'd3', title: 'Эссе · История',             subtitle: 'до 1500 слов',         dueLabel: '12 окт', urgency: 'normal' },
  ],
  grades: [
    { id: 'g1', value: 5, subject: 'Матан',   note: '' },
    { id: 'g2', value: 5, subject: 'Физика',  note: 'контрольная, вчера' },
    { id: 'g3', value: 4, subject: 'Англ.',   note: '' },
    { id: 'g4', value: 5, subject: 'Прогр.',  note: '' },
    { id: 'g5', value: 5, subject: 'История', note: '' },
  ],
  event: {
    id: 'e1',
    title: 'День открытых лабораторий',
    whenLabel: 'Сб, 3 октября · 16:00',
    place: 'корпус 19',
  },
  notifications: [
    { id: 'n1', source: 'mail',     title: 'Петров И. С.',   preview: 'Лабораторную можно отработать в пятницу, 14:00, ауд. 10-301…', time: '9:12',  unread: true },
    { id: 'n2', source: 'schedule', title: 'Перенос пары',   preview: 'Английский 12:40 → 14:35, ауд. 19-114',                       time: '8:55',  unread: true },
    { id: 'n3', source: 'moodle',   title: 'Moodle · Физика', preview: 'Открыто задание «Лабораторная №4»',                            time: '8:40',  unread: true },
  ],
  tickets: [
    { id: 't1', number: '№20931', title: 'Не работает Wi-Fi',       status: 'in_progress', subtitle: 'корпус 10 · специалист прочитал' },
    { id: 't2', number: '№20874', title: 'Не открывается Moodle',   status: 'resolved',    subtitle: 'решено помощником' },
  ],
};

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function getHomeSummary(): Promise<HomeSummary> {
  await delay(250);
  return structuredClone(MOCK);
}
