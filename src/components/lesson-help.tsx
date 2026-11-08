'use client';

import { useState } from 'react';
import { lessonSupport } from '@/content/learning-support';
import { askMentor } from '@/components/mentor/ask-mentor';
import { MentorAnswerText, MentorModeLabel } from '@/components/mentor/mentor-answer';
import type { MentorMode } from '@/lib/mentor/contracts';

export function LessonHelp({ lessonId }: { lessonId: string }) {
  const topics = lessonSupport[lessonId] ?? [];
  const [selected, setSelected] = useState(0);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<MentorMode | null>(null);
  const [modelName, setModelName] = useState<string | undefined>();
  const [answer, setAnswer] = useState('');
  const [anchor, setAnchor] = useState('#lesson-help');
  const [notice, setNotice] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const topic = topics[selected];

  async function requestHelp() {
    if (!topic) return;
    setLoading(true);
    setError(undefined);
    setNotice(undefined);
    try {
      const result = await askMentor({
        context: 'lesson',
        lessonId,
        sectionId: topic.sectionId,
        question: question.trim() || undefined,
      });
      setMode(result.mode);
      setModelName(result.modelName);
      setAnswer(result.text);
      setAnchor(result.lessonAnchor || `#${topic.sectionId}`);
      setNotice(result.notice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось получить помощь');
    } finally {
      setLoading(false);
    }
  }

  return <details className="lesson-help" id="lesson-help">
    <summary>Нужна помощь с темой?</summary>
    <div className="help-content">
      <p className="small muted">Помощь объясняет понятие. Она не ставит оценку и не подтверждает освоение.</p>
      {topic ? <>
        <label htmlFor="help-topic">Что разобрать</label>
        <select id="help-topic" value={selected} onChange={event => setSelected(Number(event.target.value))}>
          {topics.map((item, index) => <option key={item.sectionId} value={index}>{item.title}</option>)}
        </select>
        <label htmlFor="help-question">Короткий вопрос (необязательно)</label>
        <textarea
          id="help-question"
          className="plain-editor"
          style={{ minHeight: 72, width: '100%', maxWidth: 520 }}
          maxLength={400}
          value={question}
          onChange={event => setQuestion(event.target.value)}
          placeholder="Например: чем строка отличается от числа?"
        />
        <p>
          <button className="button secondary" type="button" disabled={loading} onClick={() => void requestHelp()}>
            {loading ? 'Готовим ответ…' : 'Получить объяснение'}
          </button>
        </p>
        {mode && <MentorModeLabel mode={mode} modelName={modelName}/>}
        {notice && <p className="small muted">{notice}</p>}
        {error && <p className="small muted">{error} Можно открыть подготовленное объяснение ещё раз.</p>}
        {answer ? <MentorAnswerText text={answer}/> : (
          <p role="status">{topic.explanation}</p>
        )}
        <a className="text-link" href={anchor.startsWith('#') ? anchor : `#${topic.sectionId}`}>Вернуться к объяснению в уроке</a>
      </> : <p>Подсказки для этой темы ещё готовятся.</p>}
    </div>
  </details>;
}
