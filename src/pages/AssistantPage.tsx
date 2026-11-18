import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/shared/ui/PageHeader';
import { Logo } from '@/shared/ui/Logo';
import { DriftWall } from '@/shared/ui/DriftWall';
import { WALL } from '@/assistant/wall';

import { ChatThread } from '@/assistant/ChatThread';
import { Composer } from '@/assistant/Composer';
import { useChat } from '@/assistant/useChat';

import './pages.css';

/* Сценарии, которые правда работают через шлюз: документы и расписание. */
const SCENARIOS = [
  { id: 's1', label: 'Где аудитория 403?', prompt: 'Где находится аудитория 403?' },
  { id: 's2', label: 'Как записаться на курс в Moodle', prompt: 'Как записаться на курс в Moodle?' },
  { id: 's3', label: 'Где 10-й корпус', prompt: 'Где находится учебный корпус № 10?' },
];

/* Продолжение диалога: слоты держит сервер, поэтому короткий вопрос работает. */
const FOLLOW_UPS = ['А завтра?', 'В каком корпусе?'];

const DRAFT = {
  service: 'help.tpu.ru · LMS',
  subject: 'Не открывается курс в Moodle',
  description:
    'Курс «Программирование» в Moodle не открывается: страница пустая, в консоли ошибка 500. Браузер — Chrome, интернет работает.',
  status: 'editing' as const,
};

export function AssistantPage() {
  const chat = useChat();
  const [params] = useSearchParams();
  const initial = params.get('q') ?? '';
  const empty = chat.messages.length === 0;

  return (
    <>
      <PageHeader eyebrow="Документы ТПУ и расписание — через шлюз" title="Помощник">
        <button className="btn btn--outline" type="button" onClick={chat.reset} disabled={empty}>
          Новый диалог
        </button>
      </PageHeader>

      <div className="chat">
        {empty ? (
          <section className="start">
            <div className="start__wall">
              <DriftWall items={WALL} columns={5} speed={40} />
            </div>
            <Logo size={30} />
            <h2 className="start__title">Спросите про учёбу — ответ будет со ссылкой на источник</h2>
            <div className="start__chips">
              {SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  className="chip-button"
                  type="button"
                  onClick={() => chat.send(scenario.prompt)}
                >
                  {scenario.label}
                </button>
              ))}
              <button className="chip-button chip-button--demo" type="button" onClick={() => chat.addDraft(DRAFT)}>
                Подготовить заявку (демо)
              </button>
            </div>
          </section>
        ) : (
          <ChatThread
            messages={chat.messages}
            onRetry={chat.retry}
            onDraftChange={(id, draft) => chat.updateDraft(id, draft)}
          />
        )}

        {!empty ? (
          <div className="follow">
            <span className="follow__label">Продолжить:</span>
            {FOLLOW_UPS.map((text) => (
              <button key={text} className="chip-button" type="button" onClick={() => chat.send(text)}>
                {text}
              </button>
            ))}
          </div>
        ) : null}

        <Composer key={initial} sending={chat.sending} initialValue={initial} onSend={chat.send} onStop={chat.stop} />

      </div>
    </>
  );
}
