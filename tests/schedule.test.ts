import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calendarUrl } from '../src/api/schedule.ts';

test('открывается только HTTPS-календарь без учётных данных на сайте ТПУ', () => {
  const calendar = 'https://rasp.tpu.ru/redirect/kalendar.html?hash=demo';
  assert.equal(calendarUrl(calendar), calendar);
  for (const url of [
    'http://rasp.tpu.ru',
    'https://rasp.tpu.ru.example',
    'https://rasp.tpu.ru:8080',
    'https://example.org@rasp.tpu.ru',
    'https://rasp.tpu.ru@example.org',
    'blob:https://rasp.tpu.ru/demo',
    'javascript:alert(1)',
    '/schedule',
  ]) {
    assert.equal(calendarUrl(url), undefined, url);
  }
});
