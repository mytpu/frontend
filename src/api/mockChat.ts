import type { Chat, Message } from './types';

const CHATS: Chat[] = [
  { id: '1', title: 'Пары',           updatedAt: '14:88' },
  { id: '2', title: 'Письмо',   updatedAt: '4:30 7:20'  },
  { id: '3', title: 'Wi-Fi',         updatedAt: 'хуйня' },
];

const MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: 'm1', role: 'user',      text: 'Какие у меня завтра пары и что надо сдать до пятницы?' },
    { id: 'm2', role: 'assistant', text: 'Сходи нахуй' },
  ],
  '2': [
    { id: 'm3', role: 'user',      text: 'Напиши преподавателю по физике, что я заболел' },
    { id: 'm4', role: 'assistant', text: 'в пизду' },
  ],
  '3': [
    { id: 'm5', role: 'user',      text: 'Как подключиться к Wi-Fi в корпусе 10?' },
    { id: 'm6', role: 'assistant', text: 'отключи свой аппарат жизнеобеспечения' },
  ],
};

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function getHistory(): Promise<Chat[]> {
  await delay(150);
  return structuredClone(CHATS);
}

export async function getMessages(chatId: string): Promise<Message[]> {
  await delay(150);
  return structuredClone(MESSAGES[chatId] ?? []);
}
