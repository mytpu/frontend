/* Демо-каталог сервисов ТПУ и мелкие списки (уведомления, быстрые действия, приложения с доступом).
   Поле `via` — важнее названия: оно говорит, что реально идёт через шлюз, а что пока только ссылка. */

import type { AccessApp, AppNotification, QuickAction, Service } from '../types';

export const SERVICES: Service[] = [
  {
    id: 'lk',
    title: 'Личный кабинет',
    subtitle: 'Успеваемость, зачётка, справки',
    url: 'https://lk.tpu.ru',
    via: 'link',
  },
  {
    id: 'rasp',
    title: 'Расписание',
    subtitle: 'Пары, аудитории, преподаватели',
    url: 'https://rasp.tpu.ru',
    via: 'gateway',
  },
  {
    id: 'moodle',
    title: 'Moodle',
    subtitle: 'Курсы, задания, дедлайны',
    url: 'https://lms.tpu.ru',
    via: 'link',
  },
  {
    id: 'mail',
    title: 'Почта',
    subtitle: 'Письма от деканата и преподавателей',
    url: 'https://mail.tpu.ru',
    via: 'link',
  },
  {
    id: 'help',
    title: 'Заявки',
    subtitle: 'help.tpu.ru: проблемы с сервисами',
    url: 'https://help.tpu.ru',
    via: 'link',
  },
  {
    id: 'docs',
    title: 'Инструкции',
    subtitle: 'devdocs.tpu.ru и справочные статьи',
    url: 'https://devdocs.tpu.ru',
    via: 'gateway',
  },
];

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'qa-1', title: 'Где проходит пара', prompt: 'Где находится аудитория 403?' },
  { id: 'qa-2', title: 'Найти группу', prompt: 'Найди в расписании группу 8К31' },
  { id: 'qa-3', title: 'Инструкция по Moodle', prompt: 'Как записаться на курс в Moodle?' },
  { id: 'qa-4', title: 'Что с заявкой', prompt: 'Что означает статус «ждёт ответа» в help.tpu.ru?' },
];

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'nt-1',
    service: 'moodle',
    title: 'Дедлайн сегодня',
    text: 'Лабораторная № 4 по программированию закрывается в 23:59',
    time: '09:12',
    unread: true,
  },
  {
    id: 'nt-2',
    service: 'help',
    title: 'Заявка в работе',
    text: '№ 41028 «Не открывается курс в Moodle» — назначена исполнителю',
    time: '08:55',
    unread: true,
  },
  {
    id: 'nt-3',
    service: 'mail',
    title: 'Письмо от деканата',
    text: 'Заседание старост в среду, 14:30, ауд. 210',
    time: '08:40',
    unread: true,
  },
  {
    id: 'nt-4',
    service: 'rasp',
    title: 'Изменение в расписании',
    text: 'Физика в пятницу перенесена из Л-4 в Л-2',
    time: 'вчера',
    unread: false,
  },
];

export const ACCESS_APPS: AccessApp[] = [
  { id: 'ap-1', title: 'Помощник «Мой ТПУ»', scope: 'документы, расписание', status: 'подключено' },
  { id: 'ap-2', title: 'Календарь ТПУ', scope: 'расписание', status: 'по запросу' },
  { id: 'ap-3', title: 'Внешний клиент по MCP', scope: 'документы', status: 'нет доступа' },
];
