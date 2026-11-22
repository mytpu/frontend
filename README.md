# «Мой ТПУ» — фронтенд

Студенческий хаб ТПУ: доска с виджетами, каталог сервисов, помощник и профиль.
Смысл приложения — показать пользу MCP-шлюза: сервис не открывается в новой вкладке, а приносит
данные внутрь приложения.

## Запуск

Для входа под тестовым пользователем поднимите сервис `identity` с профилем `mock` из
[инструкции бэкенда](https://github.com/mytpu/mytpu-backend/blob/main/deploy/identity-local.md).
Vite проксирует запросы входа на `127.0.0.1:8084` по умолчанию. Для чата запустите
`npm run stub` в отдельном терминале и задайте `ASSISTANT_URL=http://127.0.0.1:8787` для Vite.

Для демо с реальным `assistant` задайте его `ASSISTANT_URL` и `ASSISTANT_SESSION_AUTH=true`.
В самом `assistant` должен быть задан `ASSISTANT_IDENTITY_URL`. Подробности в разделе «Демо с реальным шлюзом» по ссылке выше.

```bash
npm ci
npm run dev -- --host 127.0.0.1
npm run build
npm run lint
npm test
```

## Стек

Vite 8, React 19, TypeScript strict, react-router 7, oxlint. Цвета, радиусы и отступы — переменные
в `src/design/tokens.css`; две темы переключаются атрибутом `data-theme` на `<html>`.
