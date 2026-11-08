'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  difficultyLabels,
  slotsByDifficulty,
  type LessonTaskSlot,
} from '@/content/lesson-tasks';
import { exercises } from '@/content/lessons';
import { taskRowLabel, taskRowStatus, type TaskRowStatus } from '@/lib/learning/progress';
import { readLearningState } from '@/lib/learning/storage';

export function LessonTaskPanel({ slots }: { slots: LessonTaskSlot[] }) {
  const groups = slotsByDifficulty(slots);
  const [statuses, setStatuses] = useState<Record<string, TaskRowStatus>>({});

  useEffect(() => {
    function refresh() {
      const { state } = readLearningState();
      const next: Record<string, TaskRowStatus> = {};
      for (const slot of slots) {
        if (!slot.practiceKey) continue;
        const exercise = exercises[slot.practiceKey];
        if (!exercise) continue;
        next[slot.practiceKey] = taskRowStatus(exercise.id, state);
      }
      setStatuses(next);
    }
    refresh();
    window.addEventListener('chgu-learning-updated', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('chgu-learning-updated', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [slots]);

  return (
    <div className="lesson-task-panel">
      <h2>Задания</h2>
      {(['basic', 'medium', 'hard'] as const).map((level) => (
        <section key={level} className="task-difficulty-group">
          <h3>{difficultyLabels[level]}</h3>
          <ul>
            {groups[level].map((slot) => (
              <TaskSlotRow key={slot.id} slot={slot} status={statuses[slot.practiceKey ?? '']} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function TaskSlotRow({
  slot,
  status,
}: {
  slot: LessonTaskSlot;
  status?: TaskRowStatus;
}) {
  if (!slot.practiceKey) {
    return (
      <li>
        <div className="task-slot is-soon" aria-disabled="true">
          <span className="task-slot-title">{slot.title}</span>
          <span className="task-slot-status">Скоро</span>
        </div>
      </li>
    );
  }

  const label = status ? taskRowLabel(status) : 'Не начато';
  return (
    <li>
      <Link href={`/practice/${slot.practiceKey}`} className={`task-slot is-${status ?? 'not_started'}`}>
        <span className="task-slot-title">{slot.title}</span>
        <span className="task-slot-status">{label}</span>
      </Link>
    </li>
  );
}
