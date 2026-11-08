'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getModule, lessonBySlug, moduleExerciseKeys } from '@/content/academy';
import { moduleDemoProgress } from '@/content/module-blurbs';
import { exercises } from '@/content/lessons';
import { acceptedExerciseIds } from '@/lib/learning/progress';
import { readLearningState } from '@/lib/learning/storage';

export function ModuleWorkspace({ moduleId }: { moduleId: string }) {
  const module = getModule(moduleId);
  const topics = module?.topics ?? [];
  const [acceptedByLesson, setAcceptedByLesson] = useState<Record<string, { accepted: number; total: number }>>(
    {},
  );

  const liveKeys = useMemo(() => moduleExerciseKeys(moduleId), [moduleId]);

  useEffect(() => {
    function refresh() {
      const { state } = readLearningState();
      const acceptedSet = new Set(acceptedExerciseIds(state.attempts));
      const next: Record<string, { accepted: number; total: number }> = {};
      for (const topic of topics) {
        if (!topic.lessonSlug) continue;
        const lesson = lessonBySlug(topic.lessonSlug);
        if (!lesson) continue;
        let accepted = 0;
        for (const exerciseId of lesson.exercises) {
          if (acceptedSet.has(exerciseId)) accepted += 1;
        }
        next[topic.lessonSlug] = { accepted, total: lesson.exercises.length };
      }
      setAcceptedByLesson(next);
    }
    refresh();
    window.addEventListener('chgu-learning-updated', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('chgu-learning-updated', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [topics, liveKeys]);

  if (!module) return null;

  return (
    <ul className="lesson-card-list">
      {topics.map((topic) => {
        const slug = topic.lessonSlug;
        if (!slug) return null;
        const lesson = lessonBySlug(slug);
        if (!lesson) return null;
        const real = acceptedByLesson[slug] ?? { accepted: 0, total: lesson.exercises.length };
        const hasLiveTasks = real.total > 0;
        const demo = moduleDemoProgress[moduleId];
        const shown = hasLiveTasks
          ? real
          : { accepted: 0, total: demo?.total ? Math.max(4, Math.round(demo.total / topics.length)) : 4 };
        const percent = hasLiveTasks && shown.total > 0 ? Math.round((shown.accepted / shown.total) * 100) : 0;

        return (
          <li key={slug}>
            <Link className="lesson-card" href={`/learn/${slug}`}>
              <h2>{lesson.title}</h2>
              <p>{lesson.summary}</p>
              <div className="lesson-card-meta">
                {hasLiveTasks ? (
                  <span>
                    {shown.accepted}/{shown.total} заданий
                  </span>
                ) : (
                  <span className="demo-chip">Текст урока · практика позже</span>
                )}
              </div>
              {hasLiveTasks && (
                <div className="course-card-progress" aria-hidden="true">
                  <span style={{ width: `${percent}%` }} />
                </div>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
