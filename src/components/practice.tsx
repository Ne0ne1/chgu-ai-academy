'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Exercise } from '@/lib/contracts';
import { Skeleton } from '@/components/ui';
import { gradeExercise, type GradeReport } from '@/lib/grading/grade';
import { lessonHref, type GradeIssue } from '@/lib/grading/feedback';
import { usePythonRuntime } from '@/hooks/use-python-runtime';
import { useLearningStore } from '@/hooks/use-learning-store';
import {
  acceptedExerciseIds,
  nextStepAfterPass,
  recentAttemptsForExercise,
} from '@/lib/learning/progress';
import { programExamples } from '@/lib/learning/task-examples';
import type { RuntimeRunResult } from '@/lib/runtime/contracts';
import { askMentor } from '@/components/mentor/ask-mentor';
import { MentorAnswerText, MentorModeLabel } from '@/components/mentor/mentor-answer';
import type { MentorMode } from '@/lib/mentor/contracts';
import { isValidEvidence } from '@/lib/learning/evidence';

const CodeEditor = dynamic(() => import('@/components/code-editor'), {
  ssr: false,
  loading: () => <Skeleton />,
});

function statusText(status: string, detail: string, storageMessage?: string): string {
  if (storageMessage) return storageMessage;
  switch (status) {
    case 'loading':
      return detail || 'Загрузка Python runtime…';
    case 'ready':
      return 'Python готов.';
    case 'running':
      return 'Выполняется…';
    case 'error':
      return detail || 'Не удалось загрузить runtime.';
    case 'unavailable':
      return detail || 'Runtime недоступен.';
    default:
      return 'Подготовка Python runtime…';
  }
}

function IssueList({
  issues,
  stdin,
  nextHint,
}: {
  issues: GradeIssue[];
  stdin?: string;
  nextHint: string;
}) {
  if (issues.length === 0) return null;
  const issue = issues[0];
  const tech = issue.actual && /Error|Traceback|File "/i.test(issue.actual) ? issue.actual : undefined;
  return (
    <div className="issue-primary">
      <dl className="verdict-grid">
        <div>
          <dt>Тест</dt>
          <dd>{issue.testId}</dd>
        </div>
        {stdin !== undefined && (
          <div>
            <dt>Входные данные</dt>
            <dd>
              <pre>{stdin.trim() || '(пусто)'}</pre>
            </dd>
          </div>
        )}
        {issue.expected !== undefined && (
          <div>
            <dt>Ожидалось</dt>
            <dd>
              <pre>{issue.expected}</pre>
            </dd>
          </div>
        )}
        {issue.actual !== undefined && (
          <div>
            <dt>Получилось</dt>
            <dd>
              <pre>{tech ? '(см. технические подробности)' : issue.actual}</pre>
            </dd>
          </div>
        )}
      </dl>
      <p>
        <strong>Почему:</strong> {issue.message}
      </p>
      <p>
        <strong>Следующий шаг:</strong> {nextHint}
      </p>
      {tech && (
        <details className="help-tech">
          <summary>Технические подробности</summary>
          <pre>{tech}</pre>
        </details>
      )}
    </div>
  );
}

export function Practice({
  exercise,
  lessonSlug,
  exerciseKey,
}: {
  exercise: Exercise;
  lessonSlug: string;
  exerciseKey: string;
}) {
  const { state, hydrated, storageMessage, saveDraft, recordAttempt, updateLocation } = useLearningStore();
  const { status, detail, busy, run, retryLoad } = usePythonRuntime();
  const [code, setCode] = useState(exercise.starterCode);
  const codeRef = useRef(code);
  const [hint, setHint] = useState(0);
  const [plain, setPlain] = useState(false);
  const [runResult, setRunResult] = useState<RuntimeRunResult | null>(null);
  const [grade, setGrade] = useState<GradeReport | null>(null);
  const [mode, setMode] = useState<'check' | 'submit' | null>(null);
  const [submitWasRepeat, setSubmitWasRepeat] = useState(false);
  const [checkedCode, setCheckedCode] = useState<string | null>(null);
  const [discardedDuringCheck, setDiscardedDuringCheck] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [includeCode, setIncludeCode] = useState(false);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [mentorMode, setMentorMode] = useState<MentorMode | null>(null);
  const [mentorModel, setMentorModel] = useState<string | undefined>();
  const [mentorText, setMentorText] = useState('');
  const [mentorAnchor, setMentorAnchor] = useState('#lesson-help');
  const [mentorNotice, setMentorNotice] = useState<string | undefined>();
  const [mentorError, setMentorError] = useState<string | undefined>();

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    if (!hydrated || draftReady) return;
    const draft = state.drafts[exerciseKey]?.code;
    if (typeof draft === 'string') setCode(draft);
    setDraftReady(true);
    updateLocation({ lessonId: exercise.lessonId, exerciseKey });
  }, [hydrated, draftReady, state.drafts, exerciseKey, exercise.lessonId, updateLocation]);

  useEffect(() => {
    if (!draftReady) return;
    const handle = window.setTimeout(() => saveDraft(exerciseKey, code), 400);
    return () => window.clearTimeout(handle);
  }, [code, draftReady, exerciseKey, saveDraft]);

  const staleCheck = checkedCode !== null && checkedCode !== code;
  const nextStep = useMemo(() => nextStepAfterPass(exerciseKey), [exerciseKey]);
  const buttonsDisabled =
    busy || status === 'error' || status === 'unavailable' || status === 'idle' || status === 'loading';
  const primaryIssue = grade && !grade.passed ? grade.issues[0] : undefined;
  const hasFailedAttempt = Boolean(grade && !grade.passed && !staleCheck);
  const failedTest = primaryIssue
    ? [...exercise.visibleTests, ...exercise.hiddenTests].find((test) => test.id === primaryIssue.testId)
    : undefined;
  const attemptHistory = useMemo(
    () => (hydrated ? recentAttemptsForExercise(exercise.id, state, 5) : []),
    [hydrated, exercise.id, state],
  );
  const examples = useMemo(() => programExamples(exercise, 2), [exercise]);

  async function gradeCurrent(asSubmit: boolean) {
    setRunResult(null);
    setDiscardedDuringCheck(false);
    setMentorText('');
    setMentorMode(null);
    setMode(asSubmit ? 'submit' : 'check');
    if (asSubmit) {
      setSubmitWasRepeat(acceptedExerciseIds(state.attempts).includes(exercise.id));
    }
    const snapshot = code;
    const report = await gradeExercise(exercise, snapshot, (input) => run(input));

    if (codeRef.current !== snapshot) {
      setDiscardedDuringCheck(true);
      setGrade(null);
      setCheckedCode(null);
      return;
    }

    setGrade(report);
    setCheckedCode(snapshot);
    if (asSubmit) {
      recordAttempt(exercise, report.attempt);
    }
  }

  async function handleRun() {
    setGrade(null);
    setMode(null);
    setCheckedCode(null);
    setDiscardedDuringCheck(false);
    setMentorText('');
    setMentorMode(null);
    const result = await run({ code, stdin: exercise.visibleTests[0]?.stdin ?? '' });
    setRunResult(result);
  }

  async function requestMentorHelp() {
    setMentorLoading(true);
    setMentorError(undefined);
    setMentorNotice(undefined);
    try {
      const allowCode = includeCode && hasFailedAttempt;
      const result = await askMentor({
        context: 'practice',
        lessonId: exercise.lessonId,
        exerciseId: exercise.id,
        hasAttempt: Boolean(grade),
        includeCode: allowCode,
        code: allowCode ? (checkedCode ?? code) : undefined,
        lastIssue: primaryIssue
          ? {
              kind: primaryIssue.kind,
              message: primaryIssue.message,
              expected: primaryIssue.expected,
              actual: primaryIssue.actual,
              lessonAnchor: primaryIssue.lessonAnchor,
            }
          : undefined,
      });
      setMentorMode(result.mode);
      setMentorModel(result.modelName);
      setMentorText(result.text);
      setMentorAnchor(result.lessonAnchor || primaryIssue?.lessonAnchor || '#lesson-help');
      setMentorNotice(result.notice);
    } catch (err) {
      setMentorError(err instanceof Error ? err.message : 'Не удалось получить помощь');
    } finally {
      setMentorLoading(false);
    }
  }

  const lessonSectionHref = lessonHref(
    lessonSlug,
    primaryIssue?.lessonAnchor || mentorAnchor || '#lesson-help',
  );

  return (
    <div className="practice-layout practice-layout-3">
      <section className="practice-statement" aria-labelledby="task-title">
        <h2 id="task-title">Условие</h2>
        <p>{exercise.statement}</p>

        <section className="program-example" aria-labelledby="example-title">
          <h3 id="example-title">Пример работы программы</h3>
          {examples.map((example, index) => (
            <div className="program-example-item" key={`${example.expectedStdout}-${index}`}>
              {examples.length > 1 && <p className="small muted">Пример {index + 1}</p>}
              <dl className="verdict-grid">
                <div>
                  <dt>Ввод</dt>
                  <dd>
                    <pre>{example.stdin.trim() || '(пусто)'}</pre>
                  </dd>
                </div>
                <div>
                  <dt>Вывод</dt>
                  <dd>
                    <pre>{example.expectedStdout}</pre>
                  </dd>
                </div>
              </dl>
              <p className="program-example-why">{example.explanation}</p>
            </div>
          ))}
        </section>
      </section>

      <div className="practice-work">
        <section className="editor-panel" aria-label="Код решения">
          <div className="editor-toolbar">
            <span>
              solution.py <span className="muted">· Python</span>
            </span>
            <details className="editor-options">
              <summary>Ещё</summary>
              <div>
                <button
                  type="button"
                  onClick={(event) => {
                    setPlain(!plain);
                    event.currentTarget.closest('details')?.removeAttribute('open');
                  }}
                >
                  {plain ? 'Открыть Monaco' : 'Простой редактор'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Заменить код шаблоном?')) setCode(exercise.starterCode);
                  }}
                >
                  Вернуть шаблон
                </button>
              </div>
            </details>
          </div>
          {plain ? (
            <textarea
              aria-label="Код Python"
              className="plain-editor"
              spellCheck={false}
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          ) : (
            <CodeEditor value={code} onChange={setCode} />
          )}
          <div className="editor-actions">
            <button className="button secondary" disabled={buttonsDisabled} onClick={() => void handleRun()}>
              Запустить
            </button>
            <button
              className="button secondary"
              disabled={buttonsDisabled}
              onClick={() => void gradeCurrent(false)}
            >
              Проверить
            </button>
            <button className="button" disabled={buttonsDisabled} onClick={() => void gradeCurrent(true)}>
              Отправить решение
            </button>
            {status === 'error' && (
              <button className="button secondary" type="button" onClick={() => void retryLoad()}>
                Повторить загрузку
              </button>
            )}
          </div>
          <p className="editor-note small muted">
            «Запустить» — только вывод. «Проверить» — тесты без баллов. «Отправить решение» — запись попытки;
            баллы начисляются один раз при первом принятии.
          </p>
        </section>

        <section className="output-panel" aria-labelledby="result-title">
          <h2 id="result-title">Результат</h2>
          <p id="runtime-status" className={`runtime-status is-${status}`}>
            {statusText(status, detail, storageMessage)}
          </p>
          {runResult && (
            <div className={`run-output ${runResult.ok ? 'is-ok' : 'is-error'}`} role="status">
              <p>
                <strong>{runResult.ok ? 'Вывод программы' : 'Ошибка выполнения'}</strong>
                {runResult.truncated ? ' · вывод обрезан (лимит 20 КБ)' : ''}
              </p>
              <pre>
                {(runResult.stdout || runResult.stderr || runResult.errorMessage || '(пусто)').trimEnd() ||
                  '(пусто)'}
              </pre>
            </div>
          )}
          {discardedDuringCheck && (
            <div className="grade-output is-warn" role="status">
              <p>
                <strong>Проверка не сохранена.</strong> Код изменился во время проверки.
              </p>
            </div>
          )}
          {grade && (
            <div
              className={`grade-output current-verdict ${grade.passed && !staleCheck ? 'is-ok' : 'is-error'}`}
              role="status"
            >
              <p className="verdict-kicker">
                {mode === 'submit' ? 'Отправка решения' : 'Проверка без баллов'}
              </p>
              {staleCheck ? (
                <p>Код изменился после проверки. Нажмите «Проверить» или «Отправить решение» снова.</p>
              ) : grade.passed ? (
                <p>
                  <strong>{mode === 'submit' ? 'Решение принято.' : 'Тесты пройдены.'}</strong>
                  {mode === 'check' && ' Чтобы засчитать баллы, нажмите «Отправить решение».'}
                  {mode === 'submit' &&
                    (submitWasRepeat
                      ? ' Повторная отправка баллы не добавляет.'
                      : ' Баллы начислены за первое принятие.')}
                </p>
              ) : (
                <p>
                  <strong>Пока не принято.</strong>
                </p>
              )}
              <ul className="test-result-list">
                {grade.testResults.map((item) => (
                  <li key={item.testId} className={item.passed ? 'is-ok' : 'is-error'}>
                    {item.passed ? 'Пройден' : 'Не пройден'}: {item.testId}
                  </li>
                ))}
              </ul>
              {!grade.passed && (
                <IssueList
                  issues={grade.issues}
                  stdin={failedTest?.stdin}
                  nextHint="Исправьте код и снова нажмите «Проверить» или «Отправить решение»."
                />
              )}
              {grade.passed && mode === 'submit' && !staleCheck && (
                <p className="next-action">
                  <Link className="button" href={nextStep.href}>
                    {nextStep.label}
                  </Link>
                </p>
              )}
            </div>
          )}

          <section className="attempt-history" aria-labelledby="attempts-title">
            <h3 id="attempts-title">Последние попытки</h3>
            {attemptHistory.length === 0 ? (
              <p className="small muted">Появятся после «Отправить решение».</p>
            ) : (
              <ul className="attempt-history-list">
                {attemptHistory.map((attempt) => (
                  <li key={attempt.id}>
                    <time dateTime={attempt.timestamp}>
                      {new Date(attempt.timestamp).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    <span className={attempt.passed && isValidEvidence(attempt) ? 'is-ok' : 'is-error'}>
                      {attempt.passed && isValidEvidence(attempt) ? 'Принято' : 'Ошибка'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>
      </div>

      <aside className="practice-mentor" aria-labelledby="mentor-title">
        <h2 id="mentor-title">AI-наставник</h2>
        <p className="small muted">
          Подсказка по ошибке и следующий шаг. Полный код решения не выдаётся. На публичном сайте — подготовленные
          ответы, не локальная модель.
        </p>
        <details className="practice-help">
          <summary>Подсказка по условию</summary>
          <div className="help-content">
            {exercise.hints.length > 0 ? (
              <>
                <p>{exercise.hints[0]}</p>
                {exercise.hints.slice(1, hint + 1).map((text) => (
                  <p key={text}>{text}</p>
                ))}
                {hint < exercise.hints.length - 1 && (
                  <button className="text-link" type="button" onClick={() => setHint(hint + 1)}>
                    Ещё подсказка
                  </button>
                )}
              </>
            ) : (
              <p>Сверьте пример ввода и вывода.</p>
            )}
          </div>
        </details>
        {hasFailedAttempt && (
          <div className="help-after-error">
            <button
              className="button secondary"
              type="button"
              disabled={mentorLoading}
              onClick={() => void requestMentorHelp()}
            >
              {mentorLoading ? 'Готовим помощь…' : 'Разобрать ошибку'}
            </button>
            {mentorMode && <MentorModeLabel mode={mentorMode} modelName={mentorModel} />}
            {mentorNotice && <p className="small muted">{mentorNotice}</p>}
            {mentorError && (
              <p className="result-banner is-error" role="alert">
                {mentorError}
              </p>
            )}
            {mentorText && (
              <div className="mentor-teaching">
                <MentorAnswerText text={mentorText} />
              </div>
            )}
            <Link className="text-link" href={lessonSectionHref}>
              К разделу урока
            </Link>
            <label className="small">
              <input
                type="checkbox"
                checked={includeCode}
                onChange={(event) => setIncludeCode(event.target.checked)}
              />{' '}
              Передать снимок кода (только по согласию)
            </label>
          </div>
        )}
      </aside>
    </div>
  );
}
