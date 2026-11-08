# CURSOR REPORT · CONTEST

Дедлайн подачи по Положению: **9 ноября 2026, 12:00 (Грозный)**. Письмо организатору этим агентом **не отправлялось**.

## Пути к файлам заявки и паспорта
- Заявка DOCX: `competition/CHGU_AI_Academy_Zayavka.docx`
- Заявка PDF: `competition/CHGU_AI_Academy_Zayavka.pdf`
- Паспорт DOCX: `competition/CHGU_AI_Academy_Pasport.docx`
- Паспорт PDF: `competition/CHGU_AI_Academy_Pasport.pdf`
- HTML-исходники для PDF: `competition/*.html`
- Скрины: `competition/evidence/` (`home.png`, `home-mobile.png`, `lesson.png`, `practice-error.png`, `practice-success.png`, `progress.png`, `public-verify.log`, превью документов)
- Инструкция деплоя: `competition/DEPLOY_VERCEL.md`
- Генератор: `scripts/generate-competition-docs.py`
- Публичная проверка: `scripts/verify-public-demo.mjs`

## Production URL
- **Публичное демо (Vercel Hobby):** https://chgu-ai-academy.vercel.app
- **Репозиторий:** https://github.com/Ne0ne1/chgu-ai-academy
- Временные/claim/403 ссылки из документов убраны; в заявке и паспорте указан только рабочий production URL.

## Что проверено на публичном сайте (чистый профиль, без авторизации)
Фактический прогон `node scripts/verify-public-demo.mjs` → `competition/evidence/public-verify.log`:
- HOME status=200
- Урок открывается
- Pyodide: `runtime-worker.mjs` и `pyodide.mjs` — HTTP 200 по HTTPS
- Runtime: «Python готов»
- Неверная проверка отклонена («Пока не принято»)
- Подготовленная помощь показана (режим «подготовленные подсказки»)
- Верное решение принято
- Прогресс показывает принятую задачу и сохраняется после перезагрузки
- Мобильный 390 px: главная и runtime практики OK

## Поля, которые заявителю осталось заполнить
- Ф. И. О. капитана / участников
- Институт/факультет, курс, ОП
- Возраст (допуск ≤24 на финал 14.11.2026)
- Телефон и e-mail
- Формат: индивидуально/команда и состав команды
- Дата и подпись в заявке п.12 и паспорте п.18

Не выдумывать доходы, пользователей, партнёрства с университетом/авторами курсов. Стадия продукта в документах: прототип; публичная помощь — подготовленные подсказки; живая Ollama в публичном демо не обещается.

## Фактические результаты тестов (среда разработки)
- `npm run typecheck` — OK (на момент конкурсного пакета)
- `npm run build` — OK
- `npm run test:mentor` — OK
- Публичный e2e-сценарий — OK (см. выше)

## Известные ограничения
- Клиентский Pyodide — учебный прототип, не серверная песочница.
- Один урок + две задачи в конкурсной версии; не «готовая 12‑месячная академия».
- Живая Ollama на публичном сайте не используется и не проверялась.
- LocalStorage не даёт кросс-устройств без аккаунта.

## Commit / branch
- GitHub `main`: https://github.com/Ne0ne1/chgu-ai-academy
- Конкурсная версия фиксируется git-тегом после коммита окончательных DOCX/PDF.
