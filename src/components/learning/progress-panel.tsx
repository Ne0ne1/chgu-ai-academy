'use client';

import { useEffect, useState } from 'react';
import { Action } from '@/components/ui';
import { exercises } from '@/content/lessons';
import { buildProgressSnapshot, skillLabel } from '@/lib/learning/progress';
import { createEmptyLearningState, readLearningState, resetLearningState } from '@/lib/learning/storage';
import type { ProgressSnapshot } from '@/lib/learning/contracts';

export function ProgressPanel() {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot>(() =>
    buildProgressSnapshot(createEmptyLearningState()),
  );
  const [note, setNote] = useState<string | undefined>();

  function refresh() {
    const { state, message } = readLearningState();
    setSnapshot(buildProgressSnapshot(state, message));
    setNote(message);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleReset() {
    if (!window.confirm('Сбросить только учебные данные этого сайта? Тема оформления не изменится.')) return;
    const result = resetLearningState();
    refresh();
    setNote(result.ok ? 'Учебные данные очищены.' : result.message);
  }

  const acceptedTitles = snapshot.acceptedExerciseIds.map(
    (id) => Object.values(exercises).find((item) => item.id === id)?.title ?? id,
  );

  if (snapshot.acceptedExerciseIds.length === 0 && snapshot.masteredSkills.length === 0) {
    return <section className="progress-empty">
      <h2>Пока нет проверенных решений</h2>
      <p>Изучите урок и сдайте задачи с автоматической проверкой. Чтение и самопроверка освоение не подтверждают.</p>
      {snapshot.nextStep && <Action href={snapshot.nextStep.href}>{snapshot.nextStep.label}</Action>}
      {note && <p className="small muted">{note}</p>}
      <p className="small muted"><button className="text-link" onClick={handleReset}>Сбросить учебные данные</button></p>
    </section>;
  }

  return <section className="progress-empty">
    <h2>Принятые задачи</h2>
    <ul>{acceptedTitles.map((title) => <li key={title}>{title}</li>)}</ul>
    <h2>Подтверждённые навыки</h2>
    {snapshot.masteredSkills.length === 0 ? (
      <p>Пока нет навыков с доказательством успешной попытки.</p>
    ) : (
      <ul>{snapshot.masteredSkills.map((item) => <li key={item.skillId}>{skillLabel(item.skillId)}</li>)}</ul>
    )}
    {snapshot.reviewSkills.length > 0 && <>
      <h2>Нужно повторить</h2>
      <ul>{snapshot.reviewSkills.map((item) => <li key={item.skillId}>{skillLabel(item.skillId)}</li>)}</ul>
    </>}
    {snapshot.nextStep && <p><Action href={snapshot.nextStep.href}>{snapshot.nextStep.label}</Action></p>}
    {note && <p className="small muted">{note}</p>}
    <p className="small muted"><button className="text-link" onClick={handleReset}>Сбросить учебные данные</button></p>
  </section>;
}
