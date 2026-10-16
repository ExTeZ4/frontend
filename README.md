# Nebula Signals — Telegram Mini App

React 18 + Vite + TypeScript + TailwindCSS + Framer Motion + @twa-dev/sdk + TanStack Query + Zustand + lightweight-charts.

## Запуск

```bash
npm install
npm run dev
```

Откройте http://localhost:5173. Без бэкенда приложение работает на **демо-данных** (mock).

## Подключение бэкенда

Создайте файл `.env` рядом с `package.json`:

```
# Адрес вашего API (демо-режим отключится автоматически)
VITE_API_URL=https://api.example.com

# Либо: ходить на /api через прокси Vite (localhost:8000), без демо-данных
# VITE_USE_MOCK=false
```

Эндпоинты:

| Метод | Путь | Ответ |
|-------|------|-------|
| GET | /api/user/me | профиль, баланс, подписка, статистика |
| GET | /api/signals?status=active | список сигналов (без status — все) |
| GET | /api/plans | тарифы |
| POST | /api/payments/stars `{plan_id}` | `{ invoice_url }` |
| POST | /api/payments/crypto `{plan_id}` | `{ pay_url }` |
| GET | /api/referral/stats | `{ link, invited, active, earned_usdt }` |

Каждый запрос отправляет заголовок `X-Init-Data` (Telegram.WebApp.initData).
Если бэкенд вернул 401 — показывается экран «Открой из Telegram».
Типы ответов смотрите в `src/api/client.ts`.

## Тест в Telegram

1. Поднимите туннель: `ngrok http 5173` (или cloudflared).
2. В @BotFather: `/setmenubutton` (или `/newapp`) -> вставьте https-ссылку туннеля.
3. Откройте бота в Telegram и нажмите кнопку меню.

## Деплой на Vercel

Импортируйте папку в Vercel (framework: Vite). Переменную `VITE_API_URL` добавьте в настройках проекта.
Затем укажите ссылку Vercel в BotFather.
