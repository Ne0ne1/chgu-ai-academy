'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Action } from '@/components/ui';
import { exercises } from '@/content/lessons';
import { buildProgressSnapshot, skillLabel } from '@/lib/learning/progress';
import { createEmptyLearningState, readLearningState, resetLearningState } from '@/lib/learning/storage';
import type { ProgressSnapshot } from '@/lib/learning/contracts';
import { getExerciseRouteKey } from '@/lib/learning/catalog';

export function ProgressPanel() {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot>(() =>
    buildProgressSnapshot(createEmptyLearningState()),
  );

  function refresh() {
    const { state, message } = readLearningState();
    setSnapshot(buildProgressSnapshot(state, message));
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleReset() {
    if (!window.confirm('Сбросить только учебные данные этого сайта? Тема оформления не изменится.')) return;
    resetLearningState();
    refresh();
  }

  const acceptedTitles = snapshot.acceptedExerciseIds.map(
    (id) => Object.values(exercises).find((item) => item.id === id)?.title ?? id,
  );

  return (
    <section className="progress-simple" aria-label="Учебный прогресс">
      <div className="progress-points" role="status">
        <p>
          Баллы: <strong>{snapshot.points}</strong> / {snapshot.pointsMax}
        </p>
        <p className="small muted">
          100 баллов за каждую уникальную принятую задачу. Повторная сдача не добавляет баллы. Это баллы учебного
          прототипа, не университетская оценка.
        </p>
      </div>

      {acceptedTitles.length === 0 && snapshot.masteredSkills.length === 0 ? (
        <>
          <h2>Пока нет проверенных решений</h2>
          <p>Пройдите урок и сдайте задачи. Чтение и подсказки освоение не подтверждают.</p>
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
        </>
      )}

      <section className="review-section" aria-labelledby="review-title">
        <h2 id="review-title">Что повторить</h2>
        {snapshot.reviewSkills.length === 0 ? (
          <p className="muted">Пока нет тем с ошибками, требующими повторения.</p>
        ) : (
          <ul className="progress-list">
            {snapshot.reviewSkills.map((item) => {
              const exercise = Object.values(exercises).find((ex) =>
                ex.expectedSkillIds.includes(item.skillId),
              );
              const route = exercise ? getExerciseRouteKey(exercise.id) : undefined;
              return (
                <li key={item.skillId}>
                  {skillLabel(item.skillId)}
                  {route && (
                    <>
                      {' · '}
                      <Link className="text-link" href={`/practice/${route}`}>
                        открыть задачу
                      </Link>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="progress-continue">
        {snapshot.nextStep ? (
          <Action href={snapshot.nextStep.href}>{snapshot.nextStep.label}</Action>
        ) : (
          <p>Все доступные задачи приняты.</p>
        )}
      </div>

      {snapshot.storageMessage && <p className="small muted">{snapshot.storageMessage}</p>}
      <p className="progress-reset">
        <button className="text-link" type="button" onClick={handleReset}>
          Сбросить учебные данные
        </button>
      </p>
    </section>
  );
}
