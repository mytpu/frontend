/* Локальная заглушка помощника для показа без стенда.
 *
 * Говорит по тому же контракту, что и `services/assistant`:
 * POST /api/ai/chat/stream → SSE meta, status, card, sources, delta, error, done.
 * Это не бэкенд и не замена ему: карточки здесь выдуманы, чтобы проверить интерфейс
 * и показать поток, когда ключа стенда нет.
 *
 * Запуск: npm run stub
 * Затем в .env.local: ASSISTANT_URL=http://127.0.0.1:8787
 */

import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 8787);
const conversations = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function sse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

const DOCS = {
  found: true,
  hits: [
    {
      title: 'Как записаться на курс в Moodle',
      section: 'Электронное обучение',
      url: 'https://devdocs.tpu.ru/moodle/enrol',
      excerpt:
        'Откройте lms.tpu.ru, войдите через ТПУ, найдите курс в каталоге и нажмите «Записаться». Если курс скрыт, напишите преподавателю.',
    },
  ],
};

const RASP = {
  total: 2,
  items: [
    {
      name: 'Аудитория 403',
      kind: 'аудитория',
      hint: 'Учебный корпус № 10, 4 этаж',
      url: 'https://rasp.tpu.ru/redirect/kalendar.html?hash=403-10',
    },
    {
      name: 'Аудитория 403 А',
      kind: 'аудитория',
      hint: 'Учебный корпус № 10, 4 этаж',
      url: 'https://rasp.tpu.ru/redirect/kalendar.html?hash=403a-10',
    },
  ],
};

const SOURCES_DOCS = [
  { title: 'Как записаться на курс в Moodle — devdocs.tpu.ru', url: 'https://devdocs.tpu.ru/moodle/enrol' },
  { title: 'Электронное обучение ТПУ — devdocs.tpu.ru', url: 'https://devdocs.tpu.ru/moodle' },
];

const SOURCES_RASP = [{ title: 'Расписание ТПУ — rasp.tpu.ru', url: 'https://rasp.tpu.ru' }];

function pick(message, previous) {
  const text = message.toLowerCase();

  if (/^(а\s+)?завтра/.test(text) && previous.room) {
    return {
      kind: 'rasp',
      status: 'Беру вчерашний вопрос и переношу на завтра',
      summary: `Завтра аудитория ${previous.room} занята по расписанию — карточка со ссылкой ниже.`,
      answer: `Продолжаю прошлый вопрос: завтра ${previous.room} в расписании есть. Точное время пар — по ссылке выше.`,
    };
  }

  if (/корпус|аудитор|групп|препод|расписан|403|8к31/.test(text)) {
    return {
      kind: 'rasp',
      status: 'Ищу в расписании ТПУ',
      summary: 'В расписании ТПУ нашлось 2 аудитории с номером 403: корпус 10, 4 этаж.',
      answer:
        'Аудитория 403 — учебный корпус № 10, четвёртый этаж. Рядом 403А. Пары по этой аудитории смотрите по ссылке в карточке.',
      remember: { room: '403' },
    };
  }

  if (/moodle|курс|запис|справк|правил|инструкц|как\s/.test(text)) {
    return {
      kind: 'docs',
      status: 'Ищу в документах ТПУ',
      summary: 'Нашёл инструкцию: «Как записаться на курс в Moodle», раздел «Электронное обучение».',
      answer:
        'Запись на курс в Moodle: войдите в lms.tpu.ru через ТПУ, откройте каталог курсов и нажмите «Записаться». Если курс не виден, его скрыл преподаватель — напишите ему из карточки курса.',
    };
  }

  if (/заявк|help\.tpu/.test(text)) {
    return {
      kind: 'text',
      status: 'Смотрю, что есть по заявкам',
      answer:
        'Создать заявку в help.tpu.ru пока нельзя: API сервиса не подключён. Черновик можно собрать здесь — он сохранится в браузере и не уйдёт наружу.',
    };
  }

  return {
    kind: 'docs',
    status: 'Ищу в документах ТПУ',
    summary: 'По документам ТПУ точного ответа нет — вот ближайшая инструкция.',
    answer:
      'В документах ТПУ нет прямого ответа на этот вопрос. Уточните формулировку или посмотрите инструкцию в карточке.',
  };
}

async function stream(req, res) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');

  let body;
  try {
    body = raw.trim() === '' ? {} : JSON.parse(raw);
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'invalid_arguments', message: 'Тело запроса — не JSON' }));
    return;
  }

  const message = typeof body.message === 'string' ? body.message : '';
  if (message.trim() === '') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'invalid_arguments', message: 'Пустое сообщение' }));
    return;
  }

  const conversationId = body.conversationId ?? crypto.randomUUID();
  const previous = conversations.get(conversationId) ?? {};
  const plan = pick(message, previous);
  conversations.set(conversationId, { ...previous, ...(plan.remember ?? {}) });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  sse(res, 'meta', { conversation_id: conversationId, message_id: crypto.randomUUID(), request_id: crypto.randomUUID() });
  sse(res, 'status', { stage: 'thinking', label: 'Разбираю вопрос' });
  await sleep(380);

  sse(res, 'status', { stage: 'tools', label: plan.status });
  await sleep(520);

  if (plan.kind === 'rasp') {
    sse(res, 'card', { tool: 'rasp_find', summary: plan.summary, data: RASP, hint: 'Уточните корпус — покажу пары.' });
  }

  if (plan.kind === 'docs') {
    sse(res, 'card', { tool: 'docs_search', summary: plan.summary, data: DOCS, hint: 'Могу найти ещё по другому слову.' });
  }

  if (plan.kind !== 'text') {
    sse(res, 'sources', plan.kind === 'rasp' ? SOURCES_RASP : SOURCES_DOCS);
  }

  for (const word of plan.answer.split(' ')) {
    sse(res, 'delta', { text: `${word} ` });
    await sleep(28);
  }

  sse(res, 'done', { finish: 'stop' });
  res.end();
}

const server = createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/ai/chat/stream') {
    await stream(req, res);
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', stub: true }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not_found', message: 'Только POST /api/ai/chat/stream' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Заглушка помощника: http://127.0.0.1:${PORT}/api/ai/chat/stream`);
  console.log('В .env.local добавьте: ASSISTANT_URL=http://127.0.0.1:8787');
});
