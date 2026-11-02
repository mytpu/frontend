export type WidgetSize = 'S' | 'M' | 'L';

export interface WidgetConfig {
  id: string;
  kind: WidgetKind;
  size: WidgetSize;
}

export type WidgetKind =
  | 'today'
  | 'deadlines'
  | 'grades'
  | 'event'
  | 'inbox'
  | 'tickets';
