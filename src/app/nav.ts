import type { IconName } from '@/shared/ui/Icon';

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

/** Один список на боковую навигацию и на вкладки телефона — чтобы названия не расходились. */
export const NAV: NavItem[] = [
  { to: '/', label: 'Главная', icon: 'home' },
  { to: '/schedule', label: 'Расписание', icon: 'calendar' },
  { to: '/services', label: 'Сервисы', icon: 'services' },
  { to: '/assistant', label: 'Помощник', icon: 'chat' },
  { to: '/profile', label: 'Профиль', icon: 'user' },
];

/** На телефоне — четыре вкладки из макета: расписание живёт внутри «Главной» и «Сервисов». */
export const MOBILE_NAV: NavItem[] = NAV.filter((item) => item.to !== '/schedule');
