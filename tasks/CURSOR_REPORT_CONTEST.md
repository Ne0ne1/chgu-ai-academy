# CURSOR REPORT · CONTEST

Дедлайн подачи по Положению: **9 ноября 2026, 12:00 (Грозный)**. Письмо организатору этим агентом **не отправлялось**.

## Пути к файлам заявки и паспорта
- Заявка DOCX: `competition/CHGU_AI_Academy_Zayavka.docx`
- Заявка PDF: `competition/CHGU_AI_Academy_Zayavka.pdf`
- Паспорт DOCX: `competition/CHGU_AI_Academy_Pasport.docx`
- Паспорт PDF: `competition/CHGU_AI_Academy_Pasport.pdf`
- HTML-исходники для PDF: `competition/*.html`
- Скрины: `competition/evidence/` (`home.png`, `home-mobile.png`, `lesson.png`, `practice-error.png`, `practice-success.png`, `progress.png`)
- Инструкция деплоя: `competition/DEPLOY_VERCEL.md`

## Production URL
- **Устойчивый код:** https://github.com/Ne0ne1/chgu-ai-academy
- **Vercel Hobby production URL:** ещё не закреплён за аккаунтом владельца.
- Попытка `npx vercel deploy --temporary`: URL `https://prompt-perseus-ctfs7fj.tmp.now` собрался, но внешние запросы дают **403 Forbidden**; деплой анонимный и истекает ~60 мин.
- Claim (если ещё жив): https://vercel.com/claim-deployment?code=b674621d-9853-4c05-a5cb-62a14ad6aedf
- Локальный `127.0.0.1` **не** выдаётся как публичная ссылка для судей.
- После входа в Vercel: импорт GitHub-репо по `competition/DEPLOY_VERCEL.md`, затем вставить URL в заявку п.11 и паспорт п.14.

## Что проверено на публичном сайте
- Полноценная проверка production-домена судейским сценарием **не выполнена** (нет доступного незаблокированного Hobby URL).
- Проверено на **локальном production** (`npm run build` + `next start`, `MENTOR_DISABLE_OLLAMA=1`): главная с проблемой/CTA, урок, Pyodide, ошибка, помощь «подготовленные подсказки», успех, прогресс, мобильный 390px — скрины в `competition/evidence/`.
- В коде публичной/production среды Ollama по умолчанию **не вызывается**; показывается prepared-режим с честной маркировкой.

## Поля, которые заявителю осталось заполнить
- Ф. И. О. капитана / участников  
- Институт/факультет, курс, ОП  
- Возраст (допуск ≤24 на финал 14.11.2026)  
- Телефон и e-mail  
- Формат: индивидуально/команда и состав  
- Дата и подпись в заявке п.12 и паспорте п.18  
- Вставить финальный Production URL после деплоя  
- Не выдумывать доходы, пользователей, партнёрства с университетом/авторами курсов

## Фактические результаты тестов (среда разработки)
- `npm run typecheck` — OK  
- `npm run build` — OK  
- `npm run test:mentor` — 19/19 OK  
- Ранее в проекте также проходили `test:learning` и `test:e2e` (см. `tasks/CURSOR_REPORT_02.md` / `CURSOR_REPORT_NEXT.md`)

## Изменения продукта под конкурс (без ломки навигации)
- Главная: за несколько секунд видно проблему и путь «урок → ошибка → подсказка → исправление → прогресс».
- Публичный/production mentor: без ожидания недоступной Ollama.
- Документы по Приложениям 1–2 Положения; пример «Улубаев И.docx» использован только как ориентир оформления, факты не копировались.

## Известные ограничения
- Нет закреплённого публичного Hobby URL до входа владельца в Vercel.  
- Клиентский Pyodide — учебный прототип, не серверная песочница.  
- Один урок + две задачи; не «готовая 12‑месячная академия».  
- Живая Ollama не проверена.  
- Анонимный temporary deploy непригоден для судей (403 / TTL).

## Commit / branch
- GitHub `main`: https://github.com/Ne0ne1/chgu-ai-academy  
- Локальный commit с конкурсным пакетом создан и запушен.
