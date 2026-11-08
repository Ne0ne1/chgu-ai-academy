'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { academyCourses } from '@/content/academy';
import { continueHref, courseExerciseProgress, hasStartedLearning } from '@/lib/learning/progress';
import { readLearningState } from '@/lib/learning/storage';

export function HomeCourses() {
  const [accepted, setAccepted] = useState(0);
  const [total, setTotal] = useState(2);
  const [href, setHref] = useState('/courses/python');

  useEffect(() => {
    const { state } = readLearningState();
    const progress = courseExerciseProgress(state);
    setAccepted(progress.accepted);
    setTotal(progress.total);
    setHref(hasStartedLearning(state) ? continueHref(state) : '/courses/python');
  }, []);

  return (
    <ul className="home-course-list">
      {academyCourses.map((course) => {
        if (course.readiness === 'coming') {
          return (
            <li key={course.id} className="home-course-card is-coming" aria-disabled="true">
              <p className="course-card-badge">Готовится</p>
              <h2 className="course-card-title">{course.title}</h2>
              <p className="course-card-desc">{course.goal}</p>
            </li>
          );
        }

        const percent = total > 0 ? Math.round((accepted / total) * 100) : 0;
        return (
          <li key={course.id}>
            <Link
              className="home-course-card course-card-link"
              href={href}
              aria-label={`${course.title}, ${accepted} из ${total} задач принято`}
            >
              <p className="course-card-badge">
                {accepted}/{total} задач принято
              </p>
              <h2 className="course-card-title">{course.title}</h2>
              <p className="course-card-desc">{course.goal}</p>
              <div className="course-card-progress" aria-hidden="true">
                <span style={{ width: `${percent}%` }} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
