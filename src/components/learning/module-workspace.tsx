'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  getModule,
  lessonBySlug,
  moduleExerciseKeys,
  plannedTopicTitles,
  publishedLessonSlugs,
} from '@/content/academy';
import { exercises } from '@/content/lessons';
import {
  acceptedExerciseIds,
  taskRowLabel,
  taskRowStatus,
  type TaskRowStatus,
} from '@/lib/learning/progress';
import { readLearningState } from '@/lib/learning/storage';

export function ModuleWorkspace({ moduleId }: { moduleId: string }) {
  const module = getModule(moduleId);
  const exerciseKeys = useMemo(() => moduleExerciseKeys(moduleId), [moduleId]);
  const lessonSlugs = useMemo(() => publishedLessonSlugs(moduleId), [moduleId]);
  const planned = useMemo(() => plannedTopicTitles(moduleId), [moduleId]);
  const [statuses, setStatuses] = useState<Record<string, TaskRowStatus>>({});
  const [lessonProgress, setLessonProgress] = useState<Record<string, { accepted: number; total: number }>>({});

  useEffect(() => {
    function refresh() {
      const { state } = readLearningState();
      const acceptedSet = new Set(acceptedExerciseIds(state.attempts));
      const nextStatuses: Record<string, TaskRowStatus> = {};
      for (const key of exerciseKeys) {
        const exercise = exercises[key];
        if (!exercise) continue;
        nextStatuses[key] = taskRowStatus(exercise.id, state);
      }
      setStatuses(nextStatuses);

      const nextLessons: Record<string, { accepted: number; total: number }> = {};
      for (const slug of lessonSlugs) {
        const lesson = lessonBySlug(slug);
        if (!lesson) continue;
        let accepted = 0;
        for (const exerciseId of lesson.exercises) {
          if (acceptedSet.has(exerciseId)) accepted += 1;
        }
        nextLessons[slug] = { accepted, total: lesson.exercises.length };
      }
      setLessonProgress(nextLessons);
    }
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('chgu-learning-updated', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('chgu-learning-updated', refresh);
    };
  }, [exerciseKeys, lessonSlugs]);

  if (!module) return null;

  return (
    <div className="module-workspace">
      <section className="module-practice" aria-labelledby="practice-heading">
        <h2 id="practice-heading">Практические занятия</h2>
        {exerciseKeys.length === 0 ? (
          <p className="muted small">Пока нет опубликованных заданий в этом модуле.</p>
        ) : (
          <div className="practice-group">
            <p className="practice-group-title">Задания</p>
            <ul className="module-task-list">
              {exerciseKeys.map((key) => {
                const exercise = exercises[key];
                if (!exercise) return null;
                const status = statuses[key] ?? 'not_started';
                return (
                  <li key={key}>
                    <Link href={`/practice/${key}`} className={`module-task-row is-${status}`}>
                      <span className="module-task-dot" aria-hidden="true" />
                      <span className="module-task-title">{exercise.title}</span>
                      <span className="module-task-status">{taskRowLabel(status)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {planned.length > 0 && (
          <div className="module-plan">
            <p className="practice-group-title">Дальше в модуле</p>
            <ul className="module-plan-list">
              {planned.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <aside className="module-materials" aria-labelledby="materials-heading">
        <h2 id="materials-heading">Материалы</h2>
        {lessonSlugs.length === 0 ? (
          <p className="muted small">Опубликованных уроков пока нет.</p>
        ) : (
          lessonSlugs.map((slug) => {
            const lesson = lessonBySlug(slug);
            if (!lesson) return null;
            const progress = lessonProgress[slug] ?? { accepted: 0, total: lesson.exercises.length };
            const percent =
              progress.total > 0 ? Math.round((progress.accepted / progress.total) * 100) : 0;
            return (
              <article key={slug} className="material-card">
                <h3>
                  <Link href={`/learn/${lesson.slug}`}>{lesson.title}</Link>
                </h3>
                <ul className="material-sections">
                  {lesson.sections.map((section) => (
                    <li key={section.id}>
                      <Link href={`/learn/${lesson.slug}#${section.id}`}>{section.title}</Link>
                    </li>
                  ))}
                </ul>
                <div className="video-placeholder" role="note">
                  Здесь будет видео по теме, созданное искусственным интеллектом
                </div>
                {progress.total > 0 && (
                  <div
                    className="material-progress"
                    role="progressbar"
                    aria-valuenow={progress.accepted}
                    aria-valuemin={0}
                    aria-valuemax={progress.total}
                    aria-label={`Прогресс урока: ${progress.accepted} из ${progress.total}`}
                  >
                    <span style={{ width: `${percent}%` }} />
                  </div>
                )}
              </article>
            );
          })
        )}
      </aside>
    </div>
  );
}
