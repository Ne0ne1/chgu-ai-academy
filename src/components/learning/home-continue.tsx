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
  const [label, setLabel] = useState('Начать');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const { state } = readLearningState();
    const progress = courseExerciseProgress(state);
    setAccepted(progress.accepted);
    setTotal(progress.total);
    const learningStarted = hasStartedLearning(state);
    setStarted(learningStarted);
    if (learningStarted) {
      setLabel('Продолжить');
      setHref(continueHref(state));
    } else {
      setLabel('Начать');
      setHref(`/learn/${variablesLesson.slug}`);
    }
  }, []);

  return (
    <article className="course-card">
      <div className="course-card-body">
        <p className="course-card-kicker">Курс · доступен</p>
        <h2 className="course-card-title">Основы Python</h2>
        <p className="course-card-desc">
          Урок «{variablesLesson.title}», затем две задачи с проверкой в браузере.
        </p>
        <p className="course-card-meta">
          Прогресс: {accepted}/{total} задач
        </p>
      </div>
      <div className="course-card-actions">
        <Link className="button" href={href}>
          {label}
        </Link>
        <Link className="text-link" href="/program">
          Обзор курса
        </Link>
        {started && accepted === total && total > 0 && (
          <p className="small muted">Все доступные задачи приняты.</p>
        )}
      </div>
    </article>
  );
}
