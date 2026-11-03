import type { SVGProps } from 'react';

export type IconName =
  | 'home'
  | 'calendar'
  | 'services'
  | 'chat'
  | 'user'
  | 'bell'
  | 'search'
  | 'send'
  | 'arrow'
  | 'plus'
  | 'clock'
  | 'check'
  | 'mail'
  | 'docs'
  | 'moon'
  | 'sun'
  | 'book'
  | 'help'
  | 'close'
  | 'refresh'
  | 'up'
  | 'down'
  | 'external'
  | 'settings'
  | 'lock'
  | 'power'
  | 'spark';

/* Только контурные иконки 24×24, stroke = currentColor: так они красятся токенами темы. */
const PATHS: Record<IconName, string> = {
  home: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z',
  calendar: 'M4 6.5h16M8 3v3m8-3v3M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  services: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  chat: 'M20 12.5c0 4-3.6 7-8 7-1 0-2-.2-2.9-.5L4 20l1.3-3.6A6.6 6.6 0 0 1 4 12.5c0-3.9 3.6-7 8-7s8 3.1 8 7z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20c.9-3.4 3.9-5.5 7.5-5.5s6.6 2.1 7.5 5.5',
  bell: 'M6 9a6 6 0 1 1 12 0c0 3.5.7 5.4 1.6 6.5H4.4C5.3 14.4 6 12.5 6 9zM9.5 19a2.5 2.5 0 0 0 5 0',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM16.2 16.2 21 21',
  send: 'M4 12 20 4l-3 8 3 8zM4 12h13',
  arrow: 'M5 12h13M12.5 6l6 6-6 6',
  plus: 'M12 5v14M5 12h14',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2',
  check: 'M5 12.5 9.5 17 19 7',
  mail: 'M3 6.5h18v11H3zM3 7l9 6 9-6',
  docs: 'M7 3.5h7l4 4v13H7zM14 3.5v4h4M10 12h6M10 16h6',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z',
  sun: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4',
  book: 'M5 4.5h6v15H5zM13 4.5h6v15h-6z',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.6 9.4a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.9M12 17h.01',
  close: 'M6 6l12 12M18 6 6 18',
  refresh: 'M20 12a8 8 0 1 1-2.4-5.7M20 4v4h-4',
  up: 'M12 19V5M6 11l6-6 6 6',
  down: 'M12 5v14M18 13l-6 6-6-6',
  external: 'M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  settings: 'M4 7h9M17 7h3M4 17h4M12 17h8M15.5 4v6M8 14v6',
  lock: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3',
  power: 'M12 4v7.5M7.6 6.6a7 7 0 1 0 8.8 0',
  spark: 'M12 3.5l1.8 5.2L19 10.5l-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z',
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
