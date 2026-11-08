'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { academyCourses, courseExerciseKeys, type CourseId } from '@/content/academy';
import { exercises } from '@/content/lessons';
import { acceptedExerciseIds } from '@/lib/learning/progress';
import { readLearningState } from '@/lib/learning/storage';

function useCourseAccepted(courseId: CourseId) {
  const [accepted, setAccepted] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const keys = courseExerciseKeys(courseId);
    const { state } = readLearningState();
    const acceptedSet = new Set(acceptedExerciseIds(state.attempts));
    let count = 0;
    for (const key of keys) {
      const exercise = exercises[key];
      if (exercise && acceptedSet.has(exercise.id)) count += 1;
    }
    setAccepted(count);
    setTotal(keys.length);
  }, [courseId]);

  return { accepted, total };
}

export function HomeCourses() {
  return (
    <ul className="home-course-list">
      {academyCourses.map((course) => (
        <CourseCard key={course.id} courseId={course.id} title={course.title} href={course.href} />
      ))}
    </ul>
  );
}

function CourseCard({
  courseId,
  title,
  href,
}: {
  courseId: CourseId;
  title: string;
  href: string;
}) {
  const { accepted, total } = useCourseAccepted(courseId);

  return (
    <li>
      <Link className="home-course-card course-card-link" href={href} aria-label={title}>
        <h2 className="course-card-title">{title}</h2>
        {total > 0 ? (
          <p className="course-card-meta">
            {accepted}/{total} заданий
          </p>
        ) : (
          <p className="course-card-meta muted">Модули курса</p>
        )}
      </Link>
    </li>
  );
}
