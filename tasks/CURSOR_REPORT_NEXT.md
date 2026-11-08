# CURSOR REPORT #NEXT — исправления

## Changed files
- `src/lib/learning/evidence.ts` — **новый**: `isValidEvidence`, `compactAttempts` (вынесено из storage, используется storage + progress)
- `src/lib/learning/storage.ts` — компакт истории с сохранением доказательств; `reconcileMastery`
- `src/lib/learning/progress.ts` — `acceptedExerciseIds` только по валидным доказательствам
- `src/components/practice.tsx` — снимок кода; отбрасывание запоздалой проверки при правке во время check
- `tests/learning/storage-mastery.test.ts` — кейсы cap/evidence/честный demote
- `tests/e2e/learning-loop.mjs` — Monaco, темы, 390px, worker retry, mid-check discard, reset

## Как сохранены доказательства
- При записи и чтении `attempts` ужимаются через `compactAttempts(max=80)`: сохраняются новейшие записи **и** не менее одной `isValidEvidence`-попытки на каждое принятое упражнение (passed + непустые testResults, все passed).
- Фиктивные попытки не создаются. `acceptedExerciseIds` и mastery evidence считаются только из таких попыток.
- Совместимость v1: тот же ключ/версия. Если в уже повреждённых данных доказательство вытеснено раньше — `reconcileMastery` честно снимает `mastered` → `learning` без evidence.

## Как обработан изменённый во время проверки код
- `handleCheck` фиксирует `snapshot`, гоняет тесты по нему.
- Если к концу проверки `codeRef.current !== snapshot`, Attempt/Mastery **не** пишутся; сообщение «Проверка не сохранена» + просьба нажать «Проверить» для текущего кода.
- Если проверка успела завершиться на неизменённом снимке, результат сохраняется; правка **после** этого только помечает UI как устаревший снимок (повторная проверка нового кода доступна).

## Tests run and actual results
- `npm run typecheck` — OK
- `npm run build` — OK (внутри e2e)
- `npm run test:learning` — 18/18 passed
- `npm run test:e2e` — passed

## Browser scenarios checked
- Реальный Monaco (`.monaco-editor`), переключение на textarea
- Светлая / тёмная тема (`data-theme`)
- Viewport 390px + фокус кнопки «Проверить» с клавиатуры
- Сбой загрузки Worker (abort `runtime-worker.mjs`) → «Повторить загрузку» → ready
- Правка кода во время проверки → не сохраняется; повторная проверка работает
- Правка после завершённой проверки → сохранённый снимок виден
- Успешный путь, сброс учебных данных, draft/continue, timeout, truncation

## Known limitations
- Если старые v1-данные уже потеряли успешную попытку до этого фикса, статус освоения не восстанавливается «из воздуха» — показывается честное состояние без доказательства.
- Файл `evidence.ts` добавлен как узкая зависимость storage/progress (не отдельный продуктовый слой).
