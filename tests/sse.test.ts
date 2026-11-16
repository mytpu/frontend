/* Проверка разбора SSE без сборки и без зависимостей: `npm test`.
   Поток рвётся по сети где угодно, поэтому главный случай — событие, разрезанное на куски. */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createSseReader, toChatEvent } from '../src/api/sse.ts';

test('событие, разрезанное на куски, собирается целиком', () => {
  const reader = createSseReader();

  assert.deepEqual(reader.push('event: delta\nda'), []);
  assert.deepEqual(reader.push('ta: {"text":"при'), []);
  const chunks = reader.push('вет"}\n\n');

  assert.equal(chunks.length, 1);
  assert.deepEqual(chunks[0], { event: 'delta', data: '{"text":"привет"}' });
});

test('два события в одном куске разбираются оба', () => {
  const reader = createSseReader();
  const chunks = reader.push('event: status\ndata: {"stage":"thinking","label":"Думаю"}\n\nevent: done\ndata: {"finish":"stop"}\n\n');

  assert.deepEqual(
    chunks.map((chunk) => chunk.event),
    ['status', 'done'],
  );
});

test('CRLF и комментарии не ломают разбор', () => {
  const reader = createSseReader();
  const chunks = reader.push(': ping\r\nevent: delta\r\ndata: {"text":"ok"}\r\n\r\n');

  assert.deepEqual(chunks, [{ event: 'delta', data: '{"text":"ok"}' }]);
});

test('последнее событие без пустой строки отдаётся при закрытии потока', () => {
  const reader = createSseReader();
  assert.deepEqual(reader.push('event: done\ndata: {"finish":"stop"}'), []);
  assert.equal(reader.flush().length, 1);
});

test('несколько строк data склеиваются', () => {
  const reader = createSseReader();
  const [chunk] = reader.push('event: delta\ndata: {"text":\ndata: "два"}\n\n');

  assert.equal(chunk.data, '{"text":\n"два"}');
});

test('meta отдаёт conversation_id', () => {
  const event = toChatEvent({ event: 'meta', data: '{"conversation_id":"c-1","message_id":"m","request_id":"r"}' });

  assert.deepEqual(event, { type: 'meta', conversationId: 'c-1' });
});

test('status без label игнорируется, с label — приходит событием', () => {
  assert.equal(toChatEvent({ event: 'status', data: '{"stage":"thinking"}' }), null);
  assert.deepEqual(toChatEvent({ event: 'status', data: '{"stage":"tools","label":"Ищу"}' }), {
    type: 'status',
    stage: 'tools',
    label: 'Ищу',
  });
});

test('карточка инструмента собирается вместе с данными', () => {
  const event = toChatEvent({
    event: 'card',
    data: '{"tool":"rasp_find","summary":"Нашёл","data":{"total":1,"items":[]},"hint":"Уточните"}',
  });

  assert.deepEqual(event, {
    type: 'card',
    card: { tool: 'rasp_find', summary: 'Нашёл', data: { total: 1, items: [] }, hint: 'Уточните' },
  });
});

test('битые источники отбрасываются, живой остаётся', () => {
  const event = toChatEvent({
    event: 'sources',
    data: '[{"title":"Дока","url":"https://devdocs.tpu.ru/a"},{"title":"Без ссылки"}]',
  });

  assert.deepEqual(event, {
    type: 'sources',
    sources: [{ title: 'Дока', url: 'https://devdocs.tpu.ru/a' }],
  });
});

test('error сохраняет код и текст, битый JSON — null', () => {
  assert.deepEqual(toChatEvent({ event: 'error', data: '{"code":"upstream","message":"Шлюз недоступен"}' }), {
    type: 'error',
    code: 'upstream',
    message: 'Шлюз недоступен',
  });
  assert.equal(toChatEvent({ event: 'delta', data: 'не json' }), null);
});

test('неизвестное событие не рвёт поток', () => {
  assert.equal(toChatEvent({ event: 'ping', data: '{}' }), null);
});
