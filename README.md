# only.vision

Интернет-магазин одежды в Бишкеке: лендинг, каталог, корзина с учётом остатков, оформление заказа, отслеживание и админка.
Бриф, этапы и журнал ошибок — в [BRIEF.md](BRIEF.md).

**Стек:** React 19 + Vite, Tailwind CSS 4, Motion, GSAP + Lenis, Supabase (Postgres).

## Запуск
```bash
npm install
npm run dev
```
Без ключей Supabase сайт работает на **демо-базе в браузере** (localStorage). Пароль админки в демо-режиме — `onlyvision` (`/admin`).

## Подключение Supabase
1. Создать проект на supabase.com.
2. SQL Editor → выполнить `supabase/schema.sql`, затем `supabase/seed.sql`.
3. Authentication → Sign In / Providers → отключить «Allow new users to sign up». Затем Users → Add user (email `admin@only.vision` + пароль). Это пароль от админки.
4. Скопировать `.env.example` в `.env` и заполнить `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` (Project Settings → API).
5. Перезапустить `npm run dev`. В админке справа вверху должно появиться «● Supabase».

## Деплой на Vercel
Import из GitHub → Framework: Vite → в Environment Variables добавить те же `VITE_*` переменные → Deploy. Файл `vercel.json` уже настроен под SPA-маршруты.

## Структура
- `src/pages`: главная, каталог, товар, оформление, отслеживание, админка
- `src/components/ui`: общие компоненты и компоненты из 21st.dev (`flashlight-text-reveal.tsx`, `parallax-scrolling.tsx`)
- `src/lib/api.js`: единый интерфейс данных → `localApi` (демо) или `supabaseApi`
- `supabase/schema.sql`: таблицы, RLS, функции `place_order` (атомарное списание остатков) и `track_order`
