export interface Lesson {
  id: string;
  time: string;
  endTime: string;
  title: string;
  kind: "Бланочное тестирование" | "Вебинар" | "Государственная экзаменационная комиссия" | "Государственный экзамен" | "День открытых дверей" | "Дифференцированный зачёт" | "Зачёт" | "Компьютерное тестирование" | "Конкурс" | "Консультация" | "Конференц-неделя" | "Конференция" | "Концерт" | "Курсовая работа" | "Курсовой проект" | "Лабораторная работа" | "Лекция" | "Мастер-класс" | "Научная школа" | "Научное шоу" | "Олимпиада" | "Онлайн тестирование" | "Онлайн-выбор" | "Организационное собрание" | "Практика" | "Презентация" | "Рабочее совещание" | "Самостоятельная работа" | "Семинар" | "Устное собеседование" | "Фильм" | "Экзамен" | "Экскурсия";
  room: string;
  teacher: string;
  status: 'done' | 'current' | 'upcoming';
}

export interface Deadline {
  id: string;
  title: string;
  subtitle: string;
  dueLabel: string;
  urgency: 'high' | 'normal';
}

export interface Grade {
  id: string;
  value: 4 | 5;
  subject: string;
  note: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  whenLabel: string;
  place: string;
}

export interface Notification {
  id: string;
  source: 'mail' | 'schedule' | 'moodle' | 'help' | 'grade';
  title: string;
  preview: string;
  time: string;
  unread: boolean;
}

export interface Ticket {
  id: string;
  number: string;
  title: string;
  status: 'in_progress' | 'resolved';
  subtitle: string;
}

export interface HomeSummary {
  studentName: string;
  group: string;
  department: string;
  todayLabel: string;
  lessons: Lesson[];
  deadlines: Deadline[];
  grades: Grade[];
  average: number;
  event: CampusEvent | null;
  notifications: Notification[];
  tickets: Ticket[];
}

export interface Chat {
  id: string;
  title: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}
