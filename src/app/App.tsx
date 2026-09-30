import { useState } from 'react';
import { Layout, type NavKey } from './Layout';
import HomePage from '../pages/HomePage';
import ChatPage from '../pages/ChatPage';

export default function App() {
  const [page, setPage] = useState<NavKey>('home');

  return (
    <Layout active={page} onNavigate={setPage}>
      {page === 'home' ? <HomePage /> : <ChatPage />}
    </Layout>
  );
}
