import { Icon } from '@/shared/ui/Icon';
import { PageHeader } from '@/shared/ui/PageHeader';

import { ScheduleCalendarEntry } from './ScheduleCalendar';
import { ScheduleSearch } from './ScheduleSearch';

import './schedule.css';

export function SchedulePage() {
  return (
    <>
      <PageHeader title="Расписание">
        <a className="btn btn--outline" href="https://rasp.tpu.ru" target="_blank" rel="noreferrer">
          rasp.tpu.ru <Icon name="external" size={15} />
        </a>
      </PageHeader>
      <ScheduleCalendarEntry />
      <ScheduleSearch />
    </>
  );
}
