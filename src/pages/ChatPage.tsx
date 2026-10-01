import { useEffect, useState } from 'react';
import { getHistory, getMessages } from '../api/mockChat';
import type { Chat, Message } from '../api/types';
import './ChatPage.css';

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('1');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    getHistory().then(setChats);
  }, []);

  useEffect(() => {
    getMessages(activeChatId).then(setMessages);
  }, [activeChatId]);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Чаты</h2>
        {chats.map((chat) => (
          <button
            key={chat.id}
            className={chat.id === activeChatId ? 'chat-item active' : 'chat-item'}
            onClick={() => setActiveChatId(chat.id)}
          >
            <b>{chat.title}</b>
            <small>{chat.updatedAt}</small>
          </button>
        ))}
      </aside>

      <main className="chat">
        <header className="chat-header">
          <b>{chats.find((c) => c.id === activeChatId)?.title ?? 'Чат'}</b>
        </header>

        <div className="messages">
          {messages.map((m) => (
            <div
              key={m.id}
              className={m.role === 'user' ? 'bubble user' : 'bubble assistant'}
            >
              {m.text}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
