import { useRef, useState } from 'react';

import { Icon } from '@/shared/ui/Icon';

import './thread.css';

interface ComposerProps {
  sending: boolean;
  initialValue?: string;
  onSend: (text: string) => void;
  onStop: () => void;
}

export function Composer({ sending, initialValue = '', onSend, onStop }: ComposerProps) {
  const [value, setValue] = useState(initialValue);
  const field = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const text = value.trim();
    if (text === '' || sending) return;
    setValue('');
    onSend(text);
  }

  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <textarea
        ref={field}
        className="composer__field"
        rows={1}
        autoFocus
        value={value}
        placeholder="Спросите про ТПУ: «где ауд. 403», «как записаться на курс», «а завтра?»"
        aria-label="Сообщение помощнику"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
      />

      {sending ? (
        <button className="composer__stop" type="button" onClick={onStop} aria-label="Остановить ответ">
          <Icon name="close" size={18} />
        </button>
      ) : (
        <button className="composer__send" type="submit" aria-label="Отправить" disabled={value.trim() === ''}>
          <Icon name="send" size={18} />
        </button>
      )}

      <p className="composer__hint">Enter — отправить, Shift + Enter — новая строка</p>
    </form>
  );
}
