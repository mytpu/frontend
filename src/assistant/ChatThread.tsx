import type { ChatMessage } from './useChat';
import { ChatCardView } from './ChatCard';
import { DraftCard } from './DraftCard';

import './thread.css';
import './cards.css';

interface ChatThreadProps {
  messages: ChatMessage[];
  onRetry: (id: string) => void;
  onDraftChange: (id: string, draft: NonNullable<ChatMessage['draft']>) => void;
}

export function ChatThread({ messages, onRetry, onDraftChange }: ChatThreadProps) {
  return (
    <div className="thread" role="log" aria-live="polite" aria-label="Переписка с помощником">
      {messages.map((message) =>
        message.role === 'user' ? (
          <article key={message.id} className="msg msg--user">
            <p className="msg__text">{message.text}</p>
          </article>
        ) : (
          <article key={message.id} className="msg msg--assistant">
            <div className="msg__head">
              <span className="msg__avatar" aria-hidden="true">
                М
              </span>
              <span className="msg__author">Помощник</span>
              {message.pending && message.status ? (
                <span className="msg__status">
                  <span className="msg__dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  {message.status}
                </span>
              ) : null}
            </div>

            {message.text !== '' ? <p className="msg__text">{message.text}</p> : null}

            {message.cards.map((card, index) => (
              <ChatCardView key={`${message.id}-${card.tool}-${index}`} card={card} />
            ))}

            {message.draft ? (
              <DraftCard
                draft={message.draft}
                onChange={(draft) => onDraftChange(message.id, draft)}
              />
            ) : null}

            {message.sources.length > 0 ? (
              <div className="sources">
                <p className="sources__title">Источники</p>
                <ul className="sources__list">
                  {message.sources.map((source) => (
                    <li key={source.url}>
                      <a className="sources__link" href={source.url} target="_blank" rel="noreferrer">
                        {source.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {message.error ? (
              <div className="msg__error" role="alert">
                <p className="msg__error-text">{message.error}</p>
                <button className="state__retry" type="button" onClick={() => onRetry(message.id)}>
                  Повторить
                </button>
              </div>
            ) : null}
          </article>
        ),
      )}
    </div>
  );
}
