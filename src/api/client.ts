import { streamChat } from './chat';
import { DEADLINES, INBOX, MARKS, REQUESTS, STUDENT, todayFixture, weekFixture } from './mock/board';
import { ACCESS_APPS, NOTIFICATIONS, QUICK_ACTIONS, SERVICES } from './mock/services';
import type { ChatEvent } from './types';
import type {
  AccessApp,
  AppNotification,
  Deadline,
  InboxItem,
  Marks,
  QuickAction,
  Request,
  Service,
  Student,
  TodayData,
  WeekData,
} from './types';

/* Единственный шов между экранами и источниками данных.
   Демо-слой отвечает за доску, помощник — за живой поток шлюза. Когда появятся API личных сервисов,
   меняется только этот файл: экраны о подмене не знают. */

const LATENCY_MS = 260;

/** Демонстрация устойчивости: `?state=moodle-down` роняет только Moodle, `?state=empty` отдаёт пустые списки. */
export type DemoState = 'ok' | 'moodle-down' | 'empty';

const params = new URLSearchParams(window.location.search);
const rawState = params.get('state');
export const demoState: DemoState = rawState === 'moodle-down' || rawState === 'empty' ? rawState : 'ok';

export class ServiceError extends Error {
  readonly service: string;

  constructor(service: string, message: string) {
    super(message);
    this.name = 'ServiceError';
    this.service = service;
  }
}

function pause(ms = LATENCY_MS): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function answer<T>(value: T): Promise<T> {
  await pause();
  return structuredClone(value);
}

/** Ответ-заглушка «сервис упал»: только для демонстрации изоляции виджетов. */
async function broken(service: string, message: string): Promise<never> {
  await pause();
  throw new ServiceError(service, message);
}

export const api = {
  student(): Promise<Student> {
    return answer(STUDENT);
  },

  today(): Promise<TodayData> {
    return answer(todayFixture());
  },

  week(): Promise<WeekData> {
    return answer(weekFixture());
  },

  deadlines(): Promise<Deadline[]> {
    if (demoState === 'moodle-down') {
      return broken('Moodle', 'Moodle не отвечает: задания не загрузились');
    }
    return answer(demoState === 'empty' ? [] : DEADLINES);
  },

  inbox(): Promise<InboxItem[]> {
    return answer(demoState === 'empty' ? [] : INBOX);
  },

  marks(): Promise<Marks> {
    return answer(MARKS);
  },

  requests(): Promise<Request[]> {
    return answer(demoState === 'empty' ? [] : REQUESTS);
  },

  services(): Promise<Service[]> {
    return answer(SERVICES);
  },

  quickActions(): Promise<QuickAction[]> {
    return answer(QUICK_ACTIONS);
  },

  notifications(): Promise<AppNotification[]> {
    return answer(NOTIFICATIONS);
  },

  accessApps(): Promise<AccessApp[]> {
    return answer(ACCESS_APPS);
  },

  /** Поток помощника. Без настроенного шлюза отдаёт событие ошибки — интерфейс показывает это честно. */
  chat(
    message: string,
    conversationId: string | null,
    signal: AbortSignal,
    onEvent: (event: ChatEvent) => void,
  ): Promise<void> {
    return streamChat(message, { conversationId, signal, onEvent });
  },
};

export type Api = typeof api;
