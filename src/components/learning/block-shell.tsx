'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { TaskStatusList } from '@/components/learning/task-status-list';
import type { AcademyBlock } from '@/content/academy';
import { lessonBySlug } from '@/content/academy';
import { blockExerciseProgress } from '@/lib/learning/progress';
import { readLearningState } from '@/lib/learning/storage';

export function BlockShell({
  block,
  courseTitle,
  activeLessonSlug,
  activeExerciseKey,
  children,
}: {
  block: AcademyBlock;
  courseTitle: string;
  activeLessonSlug?: string;
  activeExerciseKey?: string;
  children: ReactNode;
}) {
  const [progress, setProgress] = useState({ accepted: 0, total: block.exerciseKeys.length });

  useEffect(() => {
    function refresh() {
      const { state } = readLearningState();
      setProgress(blockExerciseProgress(block.exerciseKeys, state));
    }
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [block.exerciseKeys]);

  const percent = progress.total > 0 ? Math.round((progress.accepted / progress.total) * 100) : 0;
  const toc = (
    <>
      <p className="block-nav-label">Уроки</p>
      <ul className="block-nav-list">
        {block.lessonSlugs.map((slug) => {
          const lesson = lessonBySlug(slug);
          if (!lesson) return null;
          const short = slug.includes('/') ? slug.split('/')[1] : slug;
          const active = activeLessonSlug === short || activeLessonSlug === slug;
          return (
            <li key={slug}>
              <Link
                href={`/learn/${lesson.slug}`}
                className={active && !activeExerciseKey ? 'is-active' : undefined}
              >
                {lesson.title}
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="block-nav-label">Задачи</p>
      <TaskStatusList exerciseKeys={block.exerciseKeys} activeKey={activeExerciseKey} />
      <div className="block-progress-mini" aria-label={`Прогресс блока: ${progress.accepted} из ${progress.total}`}>
        <p className="small">
          Блок: {progress.accepted}/{progress.total} задач
        </p>
        <div className="course-card-progress" aria-hidden="true">
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>
    </>
  );

  return (
    <div className="block-shell">
      <p className="block-shell-crumb small muted">
        <Link href="/courses/python">{courseTitle}</Link>
        {' · '}
        {block.title}
      </p>
      <details className="block-toc-mobile">
        <summary>Содержание блока</summary>
        {toc}
      </details>
      <div className="block-shell-grid">
        <aside className="block-sidebar" aria-label="Содержание блока">
          {toc}
        </aside>
        <div className="block-main">{children}</div>
      </div>
    </div>
  );
}
