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

  return (
    <section className="progress-simple" aria-label="Учебный прогресс">
      {acceptedTitles.length === 0 && snapshot.masteredSkills.length === 0 ? (
        <>
          <h2>Пока нет проверенных решений</h2>
          <p>Пройдите урок и сдайте задачи. Чтение и самопроверка освоение не подтверждают.</p>
        </>
      ) : (
        <>
          <h2>Подтверждённый результат</h2>
          {acceptedTitles.length > 0 && (
            <>
              <h3>Принятые задачи</h3>
              <ul className="progress-list">
                {acceptedTitles.map((title) => (
                  <li key={title}>{title}</li>
                ))}
              </ul>
            </>
          )}
          <h3>Навыки</h3>
          {snapshot.masteredSkills.length === 0 ? (
            <p>Пока нет навыков с доказательством успешной попытки.</p>
          ) : (
            <ul className="progress-list">
              {snapshot.masteredSkills.map((item) => (
                <li key={item.skillId}>{skillLabel(item.skillId)}</li>
              ))}
            </ul>
          )}
          {snapshot.reviewSkills.length > 0 && (
            <>
              <h3>Нужно повторить</h3>
              <ul className="progress-list">
                {snapshot.reviewSkills.map((item) => (
                  <li key={item.skillId}>{skillLabel(item.skillId)}</li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <div className="progress-continue">
        {snapshot.nextStep ? (
          <Action href={snapshot.nextStep.href}>{snapshot.nextStep.label}</Action>
        ) : (
          <p>Все доступные задачи приняты.</p>
        )}
      </div>

      {note && <p className="small muted">{note}</p>}
      <p className="progress-reset">
        <button className="text-link" type="button" onClick={handleReset}>
          Сбросить учебные данные
        </button>
      </p>
    </section>
  );
}
