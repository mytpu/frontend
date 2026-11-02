import { useEffect, useState } from 'react';
import { getHistory, getMessages } from '@/api/mockChat';
import type { Chat, Message } from '@/api/types';
import './AssistantPage.css';

export default function AssistantPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState('1');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    getHistory().then(setChats);
  }, []);

  useEffect(() => {
    getMessages(activeChatId).then(setMessages);
  }, [activeChatId]);

  const activeChat = chats.find((c) => c.id === activeChatId);

  return (
    <div className="assistant">
      <aside className="assistant__list">
        <h2>Разговоры</h2>
        {chats.map((chat) => (
          <button
            key={chat.id}
            className={
              chat.id === activeChatId
                ? 'assistant__chat assistant__chat--on'
                : 'assistant__chat'
            }
            onClick={() => setActiveChatId(chat.id)}
          >
            <b>{chat.title}</b>
            <small>{chat.updatedAt}</small>
          </button>
        ))}
      </aside>

      <section className="assistant__thread">
        <header className="assistant__thread-head">
          <b>{activeChat?.title ?? 'Помощник'}</b>
        </header>

        <div className="assistant__messages">
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === 'user'
                  ? 'assistant__bubble assistant__bubble--user'
                  : 'assistant__bubble assistant__bubble--bot'
              }
            >
              {m.text}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
