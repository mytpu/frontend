export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export interface Chat {
  id: string;
  title: string;
  updatedAt: string;
}

const chats: Chat[] = [
  { id: '1', title: 'Пары', updatedAt: '14:88' },
  { id: '2', title: 'Письма', updatedAt: '9:00' },
  { id: '3', title: 'Оторвался тромб', updatedAt: 'вчера' },
];

const messagesByChat: Record<string, Message[]> = {
  '1': [
    { id: 'm1', role: 'user', text: 'Какие у меня завтра пары?' },
    { id: 'm2', role: 'assistant', text: 'Завтра етеб пиздец' },
  ],
  '2': [
    { id: 'm1', role: 'user', text: 'Напиши преподавателю по физике, что я заболел' },
    { id: 'm2', role: 'assistant', text: 'Хуй тебе' },
  ],
  '3': [
    { id: 'm1', role: 'user', text: 'Как подключиться к Wi-Fi в общежитии?' },
    { id: 'm2', role: 'assistant', text: 'Заебал' },
  ],
};

export const getHistory = async (): Promise<Chat[]> => {
  return chats;
};

export const getMessages = async (chatId: string): Promise<Message[]> => {
  return messagesByChat[chatId] ?? [];
};
