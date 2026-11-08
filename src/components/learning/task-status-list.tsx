'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { exercises } from '@/content/lessons';
import {
  taskRowLabel,
  taskRowStatus,
  type TaskRowStatus,
} from '@/lib/learning/progress';
import { readLearningState } from '@/lib/learning/storage';

export function TaskStatusList({
  exerciseKeys,
  activeKey,
}: {
  exerciseKeys: string[];
  activeKey?: string;
}) {
  const [statuses, setStatuses] = useState<Record<string, TaskRowStatus>>({});

  useEffect(() => {
    function refresh() {
      const { state } = readLearningState();
      const next: Record<string, TaskRowStatus> = {};
      for (const key of exerciseKeys) {
        const exercise = exercises[key];
        if (!exercise) continue;
        next[key] = taskRowStatus(exercise.id, state);
      }
      setStatuses(next);
    }
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [exerciseKeys]);

  return (
    <ul className="task-status-list">
      {exerciseKeys.map((key) => {
        const exercise = exercises[key];
        if (!exercise) return null;
        const status = statuses[key] ?? 'not_started';
        return (
          <li key={key} className={activeKey === key ? 'is-active' : undefined}>
            <Link href={`/practice/${key}`} className={`task-row is-${status}`}>
              <span className="task-row-dot" aria-hidden="true" />
              <span className="task-row-title">{exercise.title}</span>
              <span className="task-row-status">{taskRowLabel(status)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
