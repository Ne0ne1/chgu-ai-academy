# Отчёт · конкурсный редизайн

## Preview URL
https://chgu-ai-academy-pe7coxp4h-isadadashev777-6756s-projects.vercel.app

## Production URL
https://chgu-ai-academy.vercel.app

## База и ветка
- Freeze tag: `redesign-base-2026-11-08` (+ `contest-2026-11-08`)
- Ветка: `feat/contest-redesign` → смержена в `main` после проверки
- Конкурсные DOCX/PDF не удалялись и не переписывались

## Использованные skills (реально)
Скачаны с GitHub и применены при работе:
1. **frontend-design** (`anthropics/skills`) — характер, типографика, анти-шаблоны AI-дизайна
2. **effective-ui-design** (`sebastian-software/effective-ui-design-skill`) — контраст/AA, 8pt ритм, иерархи кнопок, dark mode, reduced motion
3. **accessibility-inclusive-design** (`hueyexe/frontend-agent-skills`) — семантика, фокус, skip-link, touch targets, keyboard
4. **ui-visual-composition** (`hueyexe/frontend-agent-skills`) — иерархия, spacing, restraint

Также использован локальный **deploy-with-vercel** (CLI deploy preview/prod; MCP Vercel в сессии не применялся).

Специализированный «фирменный» skill бренда ЧГУ отсутствует — не утверждается.

## Дизайн-решения
Концепция «учебный стол» (`tasks/DESIGN_CONCEPT.md`):
- Source Serif 4 + Source Sans 3 + IBM Plex Mono
- Teal accent только для действий; спокойный paper-фон без декоративных градиентов/стоков/гербов
- Главная: бренд + польза + CTA «Попробовать урок» + компактный цикл код→ошибка→подсказка→исправление; «1 урок · 2 задачи» вторично
- Урок: сильнее заголовки/TOC/code blocks/заметки
- Практика: акцент на редактор и «Проверить»; результат с явным следующим шагом; техдетали модели спрятаны в `<details>`
- Прогресс: три панели — задачи / навыки / следующий шаг; без процентов и наград

## Проверки
- `npm run typecheck` — OK
- `npm run build` — OK
- `npm run test:learning` — OK
- `npm run test:e2e` — OK (desktop/mobile 390, темы, оба редактора через сценарий, полный цикл)
- Preview HTTPS полный путь — OK (`competition/evidence/redesign/preview-verify.log`)
- Production короткий повтор — OK (`competition/evidence/redesign/production-verify.log`)
- Скриншоты до/после: `competition/evidence/redesign/{before,after}/`

## Ограничения
- Публичная помощь — подготовленные подсказки; живая LLM не обещается
- Один урок + две задачи
- Клиентский Pyodide
- Для просмотра preview временно отключён Vercel SSO на проекте (иначе 302 на auth)
