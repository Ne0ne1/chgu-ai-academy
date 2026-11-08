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
import { nextStepAfterPass } from '@/lib/learning/progress';
import type { RuntimeRunResult } from '@/lib/runtime/contracts';
import { askMentor } from '@/components/mentor/ask-mentor';
import { MentorAnswerText, MentorModeLabel } from '@/components/mentor/mentor-answer';
import type { MentorMode } from '@/lib/mentor/contracts';

const CodeEditor = dynamic(() => import('@/components/code-editor'), { ssr: false, loading: () => <Skeleton/> });

function statusText(
  status: string,
  detail: string,
  storageMessage?: string,
): string {
  if (storageMessage) return storageMessage;
  switch (status) {
    case 'loading':
      return detail || 'Загрузка Python runtime…';
    case 'ready':
      return 'Python готов. «Запустить» показывает вывод; «Проверить» оценивает решение.';
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

function IssueList({ issues, lessonSlug }: { issues: GradeIssue[]; lessonSlug: string }) {
  if (issues.length === 0) return null;
  return <ul>
    {issues.slice(0, 4).map((issue) => <li key={`${issue.testId}-${issue.kind}-${issue.message}`}>
      <p>{issue.message}</p>
      {(issue.expected !== undefined || issue.actual !== undefined) && (
        <p className="small muted">Ожидалось: {issue.expected ?? '—'} · Получено: {issue.actual ?? '—'}</p>
      )}
      {issue.lessonAnchor && (
        <p><Link className="text-link" href={lessonHref(lessonSlug, issue.lessonAnchor)}>Открыть раздел урока</Link></p>
      )}
    </li>)}
  </ul>;
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
  const buttonsDisabled = busy || status === 'error' || status === 'unavailable' || status === 'idle' || status === 'loading';
  const primaryIssue = grade && !grade.passed ? grade.issues[0] : undefined;
  const hasFailedAttempt = Boolean(grade && !grade.passed && !staleCheck);

  function download() {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/x-python;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = `${exercise.id}.py`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleRun() {
    setGrade(null);
    setCheckedCode(null);
    setDiscardedDuringCheck(false);
    setMentorText('');
    setMentorMode(null);
    const snapshot = code;
    const result = await run({ code: snapshot, stdin: exercise.visibleTests[0]?.stdin ?? '' });
    setRunResult(result);
  }

  async function handleCheck() {
    setRunResult(null);
    setDiscardedDuringCheck(false);
    setMentorText('');
    setMentorMode(null);
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
    recordAttempt(exercise, report.attempt);
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
        // Without consent the server also strips source lines from diagnostics.
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

  return <div className="practice-layout">
    <section className="practice-statement" aria-labelledby="task-title"><h2 id="task-title">Задание</h2><p>{exercise.statement}</p>
      <h3>Ожидаемый вывод</h3><pre className="expected-output">{exercise.visibleTests[0]?.expectedStdout ?? 'Указан в условии задания'}</pre>
      <p className="small muted">Пример для первого набора входных данных. Проверка использует несколько наборов.</p>
      <details className="practice-help"><summary>Подсказка</summary><div className="help-content">
        <p className="small muted">До первой проверки доступны общие подготовленные подсказки. Помощь не меняет Attempt и Mastery.</p>
        {exercise.hints.length > 0 ? <><p>{exercise.hints[0]}</p>
          {exercise.hints.slice(1, hint + 1).map(text => <p key={text}>{text}</p>)}
          {hint < exercise.hints.length - 1 && <button className="text-link" onClick={() => setHint(hint + 1)}>Следующая подсказка</button>}</> : <p>Вернитесь к примеру в уроке и сравните порядок действий.</p>}
        {hasFailedAttempt && <>
          <p className="small muted">После ошибки можно запросить помощь по последнему результату проверки. Готовое решение не выдаётся.</p>
          <label className="small">
            <input type="checkbox" checked={includeCode} onChange={event => setIncludeCode(event.target.checked)}/>
            {' '}Передать снимок проверенного кода настроенному серверу модели
          </label>
          <p className="small muted">Код уходит только после вашего согласия и только на сервер, где запущен Next.js с настройками Ollama. Это не модель на устройстве каждого студента публичного сайта.</p>
          <p>
            <button className="button secondary" type="button" disabled={mentorLoading} onClick={() => void requestMentorHelp()}>
              {mentorLoading ? 'Готовим помощь…' : 'Помощь по ошибке'}
            </button>
          </p>
          {mentorMode && <MentorModeLabel mode={mentorMode} modelName={mentorModel}/>}
          {mentorNotice && <p className="small muted">{mentorNotice}</p>}
          {mentorError && <p className="small muted">{mentorError}</p>}
          {mentorText && <>
            <MentorAnswerText text={mentorText}/>
            <Link className="text-link help-back" href={`/learn/${lessonSlug}${mentorAnchor.startsWith('#') ? mentorAnchor : '#lesson-help'}`}>
              Открыть раздел урока
            </Link>
          </>}
        </>}
        <Link className="text-link help-back" href={`/learn/${lessonSlug}#lesson-help`}>Разобрать понятие в уроке</Link>
      </div></details>
    </section>
    <section className="editor-panel" aria-label="Код решения"><div className="editor-toolbar"><span>solution.py <span className="muted">· Python</span></span>
      <details className="editor-options"><summary>Ещё</summary><div>
        <button onClick={event => { setPlain(!plain); event.currentTarget.closest('details')?.removeAttribute('open'); }}>{plain ? 'Открыть Monaco' : 'Простой редактор'}</button>
        <button onClick={download}>Скачать .py</button>
        <button onClick={() => { if (window.confirm('Заменить код шаблоном? Ваши изменения будут потеряны.')) setCode(exercise.starterCode); }}>Вернуть шаблон</button>
      </div></details>
    </div>
      {plain ? <textarea aria-label="Код Python" className="plain-editor" spellCheck={false} value={code} onChange={event => setCode(event.target.value)}/> : <CodeEditor value={code} onChange={setCode}/>}
      <div className="editor-actions">
        <button className="button secondary" disabled={buttonsDisabled} onClick={() => void handleRun()} aria-describedby="runtime-status">Запустить</button>
        <button className="button" disabled={buttonsDisabled} onClick={() => void handleCheck()} aria-describedby="runtime-status">Проверить</button>
        {status === 'error' && <button className="button secondary" onClick={() => void retryLoad()}>Повторить загрузку</button>}
      </div>
      <p className="editor-note small muted">Черновик сохраняется локально в браузере. Подсказки и простой запуск не засчитывают решение.</p>
    </section>
    <section className="output-panel" aria-labelledby="result-title"><h2 id="result-title">Результат проверки</h2>
      <p id="runtime-status">{statusText(status, detail, storageMessage)}</p>
      {runResult && <div className="run-output" role="status">
        <p><strong>{runResult.ok ? 'Вывод программы' : 'Ошибка выполнения'}</strong>{runResult.truncated ? ' · вывод обрезан (лимит 20 КБ)' : ''}</p>
        <pre>{(runResult.stdout || runResult.stderr || runResult.errorMessage || '(пусто)').trimEnd() || '(пусто)'}</pre>
        <p className="small muted">Запуск без проверки не создаёт успешную попытку.</p>
      </div>}
      {discardedDuringCheck && <div className="grade-output" role="status">
        <p><strong>Проверка не сохранена.</strong> Код изменился, пока шла проверка предыдущего снимка. Attempt и освоение не обновлены.</p>
        <p className="small muted">Нажмите «Проверить» ещё раз для текущего кода.</p>
      </div>}
      {grade && <div className="grade-output" role="status">
        {staleCheck ? (
          <p>Код изменился после последней проверки. Результат ниже относится к уже сохранённому снимку; чтобы оценить новый код, нажмите «Проверить» снова.</p>
        ) : grade.passed ? (
          <p><strong>Решение принято.</strong> Навыки подтверждены только теми проверками, которые реально прошли.</p>
        ) : (
          <p><strong>Пока не принято.</strong> Разберите причину и исправьте код. При необходимости откройте «Подсказка» → «Помощь по ошибке».</p>
        )}
        <ul>
          {grade.testResults.map((item) => (
            <li key={item.testId}>{item.passed ? 'Пройден' : 'Не пройден'}: {item.testId}</li>
          ))}
        </ul>
        <IssueList issues={grade.issues} lessonSlug={lessonSlug}/>
        {!staleCheck && grade.passed && (
          <p><Link className="text-link" href={nextStep.href}>{nextStep.label}</Link></p>
        )}
      </div>}
      {!runResult && !grade && !discardedDuringCheck && (
        <p className="small muted">Тесты выполняются в браузере и видны клиенту — это учебный прототип, не production-песочница.</p>
      )}
    </section>
  </div>;
}
