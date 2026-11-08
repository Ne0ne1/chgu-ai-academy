'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { exercises } from '@/content/lessons';
import { getExerciseRouteKey } from '@/lib/learning/catalog';
import { buildProgressSnapshot, skillLabel } from '@/lib/learning/progress';
import { readLearningState } from '@/lib/learning/storage';
import type { Mastery } from '@/lib/contracts';

function lessonAnchorForSkill(skillId: string): { href: string; label: string } | null {
  for (const [key, exercise] of Object.entries(exercises)) {
    if (!exercise.expectedSkillIds.includes(skillId)) continue;
    const route = getExerciseRouteKey(exercise.id) ?? key;
    return { href: `/practice/${route}`, label: exercise.title };
  }
  return null;
}

export function SkillsMap() {
  const [mastered, setMastered] = useState<Mastery[]>([]);
  const [review, setReview] = useState<Mastery[]>([]);

  useEffect(() => {
    const { state } = readLearningState();
    const snapshot = buildProgressSnapshot(state);
    setMastered(snapshot.masteredSkills);
    setReview(snapshot.reviewSkills);
  }, []);

  if (mastered.length === 0 && review.length === 0) {
    return (
      <section className="empty-state" aria-live="polite">
        <h2>Пока нет подтверждённых навыков</h2>
        <p>Сдайте задачу с тестами — навыки появятся здесь только после принятого решения.</p>
        <Link className="text-link" href="/modules/python">
          К модулю «Основы разработки»
        </Link>
      </section>
    );
  }

  return (
    <div className="skills-map">
      <section>
        <h2>Подтверждено тестами</h2>
        {mastered.length === 0 ? (
          <p className="muted">Пока пусто.</p>
        ) : (
          <ul className="progress-list">
            {mastered.map((item) => (
              <li key={item.skillId}>{skillLabel(item.skillId)}</li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2>Что повторить</h2>
        {review.length === 0 ? (
          <p className="muted">Ошибок с пометкой «нужно повторить» пока нет.</p>
        ) : (
          <ul className="progress-list">
            {review.map((item) => {
              const link = lessonAnchorForSkill(item.skillId);
              return (
                <li key={item.skillId}>
                  {skillLabel(item.skillId)}
                  {link && (
                    <>
                      {' · '}
                      <Link className="text-link" href={link.href}>
                        к задаче «{link.label}»
                      </Link>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
