'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { continueHref, courseExerciseProgress, hasStartedLearning } from '@/lib/learning/progress';
import { readLearningState } from '@/lib/learning/storage';
import { variablesLesson } from '@/content/lessons';

export function CourseCard() {
  const [accepted, setAccepted] = useState(0);
  const [total, setTotal] = useState(2);
  const [href, setHref] = useState(`/learn/${variablesLesson.slug}`);

  useEffect(() => {
    const { state } = readLearningState();
    const progress = courseExerciseProgress(state);
    setAccepted(progress.accepted);
    setTotal(progress.total);
    if (hasStartedLearning(state)) {
      setHref(continueHref(state));
    } else {
      setHref(`/learn/${variablesLesson.slug}`);
    }
  }, []);

  const percent = total > 0 ? Math.round((accepted / total) * 100) : 0;

  return (
    <Link
      className="course-card course-card-link"
      href={href}
      aria-label={`Основы Python, ${accepted} из ${total} задач зачтено`}
    >
      <p className="course-card-badge">
        {accepted}/{total} задач зачтено
      </p>
      <h2 className="course-card-title">Основы Python</h2>
      <p className="course-card-desc">
        Урок «{variablesLesson.title}», затем две задачи с проверкой в браузере.
      </p>
      <div
        className="course-card-progress"
        role="progressbar"
        aria-valuenow={accepted}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Прогресс курса: ${accepted} из ${total}`}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
    </Link>
  );
}
