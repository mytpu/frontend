import { useCallback, useEffect, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T };

export interface AsyncResult<T> {
  state: AsyncState<T>;
  /** Повторить запрос: кнопка «Повторить» на месте ошибки. */
  reload: () => void;
}

/** Загрузчик без кэша: loading → error | ready. `load` должен быть стабильной ссылкой
 *  (метод api или useCallback), иначе эффект перезапустится на каждом рендере. */
export function useAsync<T>(load: () => Promise<T>): AsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;

    load()
      .then((data) => {
        if (alive) setState({ status: 'ready', data });
      })
      .catch((error: unknown) => {
        if (!alive) return;
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Не удалось загрузить данные',
        });
      });

    return () => {
      alive = false;
    };
  }, [load, attempt]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((value) => value + 1);
  }, []);

  return { state, reload };
}
