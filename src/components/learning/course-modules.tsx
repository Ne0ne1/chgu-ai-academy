'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getModule, moduleExerciseKeys, type CourseId } from '@/content/academy';
import { moduleBlurbs, moduleDemoProgress } from '@/content/module-blurbs';
import { exercises } from '@/content/lessons';
import { acceptedExerciseIds } from '@/lib/learning/progress';
import { readLearningState } from '@/lib/learning/storage';

export function CourseModules({
  courseId,
  moduleIds,
}: {
  courseId: CourseId;
  moduleIds: string[];
}) {
  const [acceptedByModule, setAcceptedByModule] = useState<Record<string, { accepted: number; total: number }>>(
    {},
  );

  useEffect(() => {
    function refresh() {
      const { state } = readLearningState();
      const acceptedSet = new Set(acceptedExerciseIds(state.attempts));
      const next: Record<string, { accepted: number; total: number }> = {};
      for (const moduleId of moduleIds) {
        const keys = moduleExerciseKeys(moduleId);
        let accepted = 0;
        for (const key of keys) {
          const exercise = exercises[key];
          if (exercise && acceptedSet.has(exercise.id)) accepted += 1;
        }
        next[moduleId] = { accepted, total: keys.length };
      }
      setAcceptedByModule(next);
    }
    refresh();
    window.addEventListener('chgu-learning-updated', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('chgu-learning-updated', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [courseId, moduleIds]);

  return (
    <ul className={`course-module-grid cols-${moduleIds.length}`}>
      {moduleIds.map((moduleId) => {
        const module = getModule(moduleId);
        if (!module) return null;
        const real = acceptedByModule[moduleId] ?? {
          accepted: 0,
          total: moduleExerciseKeys(moduleId).length,
        };
        const useDemo = real.total === 0;
        const demo = moduleDemoProgress[moduleId] ?? { accepted: 0, total: 1 };
        const shown = useDemo ? demo : real;
        const percent = shown.total > 0 ? Math.round((shown.accepted / shown.total) * 100) : 0;

        return (
          <li key={moduleId}>
            <Link className="module-card" href={`/modules/${moduleId}`}>
              <h2>{module.title.replace(' · выпускной проект', '')}</h2>
              <p>{moduleBlurbs[moduleId] ?? module.summary}</p>
              <div className="module-card-foot">
                {useDemo ? (
                  <span className="demo-chip">Демо · {shown.accepted}/{shown.total}</span>
                ) : (
                  <span>
                    {shown.accepted}/{shown.total}
                  </span>
                )}
                <div className="course-card-progress" aria-hidden="true">
                  <span style={{ width: `${percent}%` }} />
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
