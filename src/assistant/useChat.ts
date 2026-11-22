import { useCallback, useEffect, useRef, useState } from 'react';

import { api } from '@/api/client';
import type { ChatCard, ChatEvent, ChatSource } from '@/api/types';

/* Состояние переписки. Диалог живёт на сервере: `conversation_id` приходит в событии `meta`,
   поэтому продолжение («А завтра?») работает из контекста шлюза, а не из браузера. */

export interface Draft {
  service: string;
  subject: string;
  description: string;
  status: 'editing' | 'confirmed';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  status: string | null;
  cards: ChatCard[];
  sources: ChatSource[];
  error: string | null;
  pending: boolean;
  /** Текст вопроса для повтора: сама карточка ошибки не хранит историю. */
  prompt?: string;
  draft?: Draft;
}

export interface ChatApi {
  messages: ChatMessage[];
  sending: boolean;
  conversationId: string | null;
  send: (text: string) => void;
  retry: (id: string) => void;
  stop: () => void;
  reset: () => void;
  addDraft: (draft: Draft) => void;
  updateDraft: (id: string, draft: Draft) => void;
}

const newId = (): string =>
  typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `m-${Math.random().toString(36).slice(2)}`;

function assistantMessage(prompt: string): ChatMessage {
  return {
    id: newId(),
    role: 'assistant',
    text: '',
    status: 'Отправляю запрос',
    cards: [],
    sources: [],
    error: null,
    pending: true,
    prompt,
  };
}

function mergeSources(current: ChatSource[], next: ChatSource[]): ChatSource[] {
  const seen = new Set(current.map((item) => item.url));
  return [...current, ...next.filter((item) => !seen.has(item.url))];
}

export function useChat(): ChatApi {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const conversationRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);

  const patch = useCallback((id: string, update: (message: ChatMessage) => ChatMessage) => {
    setMessages((list) => list.map((message) => (message.id === id ? update(message) : message)));
  }, []);

  const apply = useCallback(
    (id: string, event: ChatEvent) => {
      switch (event.type) {
        case 'meta':
          conversationRef.current = event.conversationId;
          setConversationId(event.conversationId);
          break;
        case 'status':
          patch(id, (message) => ({ ...message, status: event.label }));
          break;
        case 'delta':
          patch(id, (message) => ({
            ...message,
            text: message.text === '' ? event.text : `${message.text}${event.text}`,
            status: null,
          }));
          break;
        case 'card':
          patch(id, (message) => ({ ...message, cards: [...message.cards, event.card] }));
          break;
        case 'sources':
          patch(id, (message) => ({ ...message, sources: mergeSources(message.sources, event.sources) }));
          break;
        case 'error':
          if (event.code === 'conversation_not_found') {
            conversationRef.current = null;
            setConversationId(null);
          }
          patch(id, (message) => ({ ...message, error: event.message, pending: false, status: null }));
          break;
        case 'done':
          patch(id, (message) => ({ ...message, pending: false, status: null }));
          break;
        default:
          break;
      }
    },
    [patch],
  );

  const run = useCallback(
    async (id: string, text: string) => {
      const controller = new AbortController();
      abortRef.current = controller;
      busyRef.current = true;
      setSending(true);

      try {
        await api.chat(text, conversationRef.current, controller.signal, (event) => apply(id, event));
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          busyRef.current = false;
          setSending(false);
        }
      }
    },
    [apply],
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (text === '' || busyRef.current) return;

      const user: ChatMessage = {
        id: newId(),
        role: 'user',
        text,
        status: null,
        cards: [],
        sources: [],
        error: null,
        pending: false,
      };
      const assistant = assistantMessage(text);

      setMessages((list) => [...list, user, assistant]);
      void run(assistant.id, text);
    },
    [run],
  );

  const retry = useCallback(
    (id: string) => {
      const message = messages.find((item) => item.id === id);
      if (!message || message.prompt === undefined || busyRef.current) return;

      patch(id, (item) => ({
        ...item,
        text: '',
        cards: [],
        sources: [],
        error: null,
        pending: true,
        status: 'Отправляю запрос',
      }));
      void run(id, message.prompt);
    },
    [messages, patch, run],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    busyRef.current = false;
    setSending(false);
    setMessages((list) => list.map((message) => (message.pending ? { ...message, pending: false, status: null } : message)));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    busyRef.current = false;
    conversationRef.current = null;
    setConversationId(null);
    setSending(false);
    setMessages([]);
  }, []);

  const addDraft = useCallback((draft: Draft) => {
    setMessages((list) => [
      ...list,
      {
        id: newId(),
        role: 'assistant',
        text: 'Черновик заявки. Отправку подтверждаете вы — и только она уходит в сервис.',
        status: null,
        cards: [],
        sources: [],
        error: null,
        pending: false,
        draft,
      },
    ]);
  }, []);

  const updateDraft = useCallback(
    (id: string, draft: Draft) => {
      patch(id, (message) => ({ ...message, draft }));
    },
    [patch],
  );

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { messages, sending, conversationId, send, retry, stop, reset, addDraft, updateDraft };
}
