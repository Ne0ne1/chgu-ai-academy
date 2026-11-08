# CURSOR REPORT #02

## Changed files (приёмочные исправления)
- `src/lib/mentor/sanitize.ts` — удаление строк исходного кода из диагностики без согласия
- `src/lib/mentor/context.ts` — sanitize при `includeCode: false`; `lessonAnchors` / `resolveMentorAnchor`
- `src/lib/mentor/service.ts` — якорь модели принимается только если есть в уроке
- `src/lib/mentor/ollama.ts` — явное сообщение о таймауте
- `src/components/practice.tsx` — код только при отмеченной галочке
- `tests/mentor/consent-anchor.test.ts`, `tests/mentor/ollama-mock.test.ts`
- Ранее: mentor API/UI, fallback, `COURSE_SOURCE_MAP.md`, `OLLAMA_SETUP.md`

## Что изменено перед приёмкой
1. **Согласие на код:** без `includeCode` сервер обнуляет `code` и вычищает из `message`/`actual`/`expected` строки traceback/исходников; остаются kind и безопасное краткое описание.
2. **Якоря:** `#…` из ответа модели принимается только если якорь есть у текущего урока; иначе — якорь подготовленной подсказки (или `#lesson-help`).
3. **Имитация Ollama:** тесты `/api/tags` (есть/нет модели), ошибка `/api/chat`, таймаут, успешный mocked ответ → `local_model` + отбраковка несуществующего якоря.

## Реально работающие режимы
- Подготовленные подсказки — да (unit + e2e ранее).
- Локальная модель — серверный путь готов; **живой Ollama в этой среде по-прежнему недоступен** (`127.0.0.1:11434` connection refused).

## Модель и условия запуска
- Живой ответ не проверен.
- Настройки: `.env.example` / `tasks/OLLAMA_SETUP.md`.

## Сценарии помощи и результаты
- Урок/практика: режимы маркируются; помощь не меняет Attempt/Mastery.
- Без галочки код и source-строки диагностики не попадают в запрос к модели (проверено тестом).
- Несуществующий якорь модели → fallback prepared (`#types` / `#conversion` и т.п.).

## Карта источников
- `tasks/COURSE_SOURCE_MAP.md` без изменений в этом шаге; лицензии отдельных артефактов — «требует проверки».

## Tests run and actual results
- `npm run typecheck` — OK
- `npm run test:mentor` — 19/19 passed
- `npm run test:learning` — 37/37 passed
- `npm run build` — OK

### С имитацией Ollama (не живая модель)
- tags: модель доступна
- tags: модель отсутствует
- chat: HTTP 500/503
- chat: таймаут
- успешный mocked chat + отбрасывание `#not-real-anchor`

### Живьём
- Ollama не запущена — реальный ответ модели не проверялся.

## Known limitations
- Один system prompt не гарантирует педагогическое поведение LLM.
- Ollama слушает хост сервера Next.js, не браузер студента на публичном сайте.

## Commit / branch
- Нет (`.git` отсутствует).
