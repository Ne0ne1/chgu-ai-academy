> Отложено после UX-переработки. Сначала выполните CURSOR_TASK_NEXT.md и дождитесь приёмки Codex; не запускайте обе задачи одновременно.

CURSOR TASK #01 — Четыре урока Python и сохраняемая диагностика

Цель:
Довести начальный контент до четырёх полных уроков и реализовать диагностику из 8–12 вопросов с клиентским сохранением. Работаем в /Users/isadadasev/Documents/ChatGPT/chgu-ai-academy. Сначала прочитай CHGU_AI_Academy_Master_Plan.md и эту задачу. Не запускай параллельные изменения с Codex.

Контекст проекта и существующие файлы:
Next.js App Router, TypeScript, Tailwind 4, Lucide. src/lib/contracts.ts содержит интерфейсы. src/content/lessons.ts экспортирует lessons, exercises, diagnosticQuestions и variablesLesson. src/content/curriculum.ts содержит modules. Общий рендер урока — src/app/learn/python/[slug]/page.tsx; он принимает Lesson и генерирует маршруты из lessons. src/components/diagnostic.tsx сейчас показывает один пример. src/app/progress/page.tsx честно сообщает об отсутствии проверенных попыток. Python runtime и LLM отсутствуют.

Разрешено менять:
- src/content/lessons.ts; можно выделять новые файлы в src/content/lessons/ и src/content/diagnostics/, сохранив существующие экспорты.
- src/content/curriculum.ts: только статус и lessonSlug для трёх новых тем Python.
- src/components/diagnostic.tsx; новые компоненты только в src/components/diagnostics/.
- src/app/diagnostic/page.tsx; src/app/progress/page.tsx.
- Новые src/lib/diagnostics.ts, src/lib/storage.ts, src/components/diagnostics/diagnostic-result.tsx.
- tests/diagnostics*, tests/storage*; package.json и lockfile — только скрипты и необходимые тестовые devDependencies.

Запрещено менять:
Глобальный дизайн src/app/globals.css, layout, header, главную, рендер урока, практику, Mentor, лабораторию и contracts.ts. Не добавляй БД, авторизацию, серверный Python, LLM, реальные ключи или удалённые сервисы. Если контракт мешает — опиши предлагаемое изменение в отчёте, не меняй его молча. Не создавай фиктивные Attempt или Mastery из чтения урока либо диагностики.

Контракты типов и API:
Используй Lesson, Exercise, DiagnosticQuestion, DiagnosticResult из src/lib/contracts.ts без any. Ключи lessons: python/variables, python/conditions, python/loops, python/functions. id уроков: variables, conditions, loops, functions. exercises индексируется по id урока. section.id уникален внутри урока. exercises у Lesson содержит id упражнений. DiagnosticResult: id, completedAt (ISO), answers, score, total, recommendedLessonSlug, skillScores. Сохранение только на клиенте под ключом chgu-ai-academy:diagnostic:v1: {version:1,result:DiagnosticResult}. Проверяй структуру прочитанного JSON; SSR не обращается к window. Повреждённое хранилище, недоступность localStorage и запрет записи не должны ломать UI.

Пошаговые действия:
1. Сохрани качественный урок variables. Добавь conditions, loops, functions: измеримые цели, prerequisites, минимум 4 содержательных раздела, несколько оригинальных примеров с точным выводом, типичные ошибки, самопроверку с объяснением, критерии готовности и проверенные ссылки на официальные источники. Не копируй чужие курсы.
2. Для каждого нового урока добавь упражнение со starterCode, видимым ожидаемым выводом и постепенными подсказками. Runtime остаётся явно недоступным; hiddenTests пусты.
3. Создай 8–12 вопросов по четырём темам с вариантом «Не знаю». Чистая функция подсчёта даёт по 1 баллу за правильный ответ, считает skillScores. Пропуски не дают баллов. Рекомендация — первый урок по порядку prerequisites с долей правильных ответов ниже 0.7; если все >=0.7, предложи закрепление функций без утверждения mastery. Правило объясни на экране результата. Дубликаты/неизвестные id не должны искажать оценку.
4. Реализуй выбор ответа, назад/вперёд, завершение, результат и повторное прохождение. Не разрешай переход без ответа, но дай явный вариант «Не знаю». Сохраняй завершённый результат и восстанавливай после перезагрузки. Сброс — явное действие, затрагивающее только свой ключ.
5. В progress покажи только фактический результат диагностики и рекомендуемый урок. Подтверждённые практикой навыки остаются пустыми. Убери устаревшую маркировку демовопроса на странице диагностики.
6. Проверь клавиатуру, мобильный стек, состояния ошибок сохранения. Используй существующие CSS-классы.

Acceptance criteria:
Все четыре URL /learn/python/{variables,conditions,loops,functions} открываются; TOC и самопроверки работают. В программе доступные темы ведут на правильные URL. Диагностика корректно считает нулевой, полный и смешанный результат; все «Не знаю» рекомендуют variables. Перезагрузка сохраняет завершённый результат; сброс удаляет только его. Повреждённый JSON не вызывает падение. Нет фейкового прогресса, исполнения кода или AI.

Команды проверки:
npm ci
npm run build
npm run typecheck
Добавь npm run test:diagnostics для целевых тестов scoring/recommendation/storage и выполни его. Проверь браузером четыре урока, диагностику, повторное прохождение, перезагрузку и мобильный экран 390px.

Формат отчёта:
CURSOR REPORT #01
Changed files:
Implemented:
Tests run and results:
Known limitations:
Commit / branch (если был):
Если репозиторий уже инициализирован, используй отдельную ветку feat/cursor-python-diagnostics. Не перезаписывай чужие изменения. После отчёта остановись для приёмки Codex.
