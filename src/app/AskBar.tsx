import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Icon } from '@/shared/ui/Icon';
import { Logo } from '@/shared/ui/Logo';

import './ask.css';

/** Плавающая строка помощника: с любого экрана ведёт в чат с уже набранным вопросом. */
export function AskBar() {
  const [text, setText] = useState('');
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (pathname === '/assistant') return null;

  return (
    <form
      className="ask"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const question = text.trim();
        setText('');
        navigate(question === '' ? '/assistant' : `/assistant?q=${encodeURIComponent(question)}`);
      }}
    >
      <Logo size={20} />
      <input
        className="ask__input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Спросите помощника: «где ауд. 403?»"
        aria-label="Вопрос помощнику"
      />
      <kbd className="kbd">Ctrl K</kbd>
      <button className="ask__send" type="submit" aria-label="Спросить помощника">
        <Icon name="send" size={18} />
      </button>
    </form>
  );
}
