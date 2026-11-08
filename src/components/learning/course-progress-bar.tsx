'use client';

import { useEffect, useState } from 'react';
import { courseExerciseProgress } from '@/lib/learning/progress';
import { readLearningState } from '@/lib/learning/storage';

export function CourseProgressBar({ label = 'Принято задач' }: { label?: string }) {
  const [accepted, setAccepted] = useState(0);
  const [total, setTotal] = useState(2);

  useEffect(() => {
    function refresh() {
      const { state } = readLearningState();
      const progress = courseExerciseProgress(state);
      setAccepted(progress.accepted);
      setTotal(progress.total);
    }
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  const percent = total > 0 ? Math.round((accepted / total) * 100) : 0;

  return (
    <div className="course-progress-line">
      <p>
        {label}: <strong>{accepted}</strong> из {total}
      </p>
      <div
        className="course-card-progress"
        role="progressbar"
        aria-valuenow={accepted}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
