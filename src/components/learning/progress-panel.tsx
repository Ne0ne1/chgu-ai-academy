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
    return (
      <section className="progress-board" aria-labelledby="progress-empty-title">
        <div className="progress-panel progress-panel-empty">
          <h2 id="progress-empty-title">Пока нет проверенных решений</h2>
          <p>Изучите урок и сдайте задачи с автоматической проверкой. Чтение и самопроверка освоение не подтверждают.</p>
          {snapshot.nextStep && <Action href={snapshot.nextStep.href}>{snapshot.nextStep.label}</Action>}
          {note && <p className="small muted">{note}</p>}
          <p className="small muted">
            <button className="text-link" type="button" onClick={handleReset}>
              Сбросить учебные данные
            </button>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="progress-board" aria-label="Учебный прогресс">
      <div className="progress-panel">
        <h2>Принятые задачи</h2>
        <ul className="progress-list">
          {acceptedTitles.map((title) => (
            <li key={title}>{title}</li>
          ))}
        </ul>
      </div>
      <div className="progress-panel">
        <h2>Подтверждённые навыки</h2>
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
      </div>
      <div className="progress-panel progress-next">
        <h2>Следующий шаг</h2>
        {snapshot.nextStep ? (
          <Action href={snapshot.nextStep.href}>{snapshot.nextStep.label}</Action>
        ) : (
          <p>Все доступные задачи приняты.</p>
        )}
        {note && <p className="small muted">{note}</p>}
        <p className="small muted">
          <button className="text-link" type="button" onClick={handleReset}>
            Сбросить учебные данные
          </button>
        </p>
      </div>
    </section>
  );
}
