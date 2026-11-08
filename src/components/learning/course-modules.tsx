'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getModule, moduleExerciseKeys, type CourseId } from '@/content/academy';
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
  }, [courseId, moduleIds]);

  return (
    <ul className="course-module-list">
      {moduleIds.map((moduleId) => {
        const module = getModule(moduleId);
        if (!module) return null;
        const progress = acceptedByModule[moduleId] ?? { accepted: 0, total: moduleExerciseKeys(moduleId).length };
        const hasTasks = progress.total > 0;

        return (
          <li key={moduleId}>
            <Link className="course-module-row" href={`/modules/${moduleId}`}>
              <span className="course-module-title">{module.title}</span>
              {hasTasks ? (
                <span className="course-module-meta">
                  {progress.accepted}/{progress.total}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
