'use client';

import { useEffect, useState } from 'react';
import { demoProgress } from '@/content/demo-data';
import { exercises } from '@/content/lessons';
import { academyCourses, getModule, moduleExerciseKeys } from '@/content/academy';
import { acceptedExerciseIds, buildProgressSnapshot, skillLabel } from '@/lib/learning/progress';
import { createEmptyLearningState, readLearningState, resetLearningState } from '@/lib/learning/storage';
import type { ProgressSnapshot } from '@/lib/learning/contracts';
import { getExerciseRouteKey } from '@/lib/learning/catalog';
import Link from 'next/link';

type Tab = 'demo' | 'mine';

export function ProgressTabs() {
  const [tab, setTab] = useState<Tab>('demo');
  const [snapshot, setSnapshot] = useState<ProgressSnapshot>(() =>
    buildProgressSnapshot(createEmptyLearningState()),
  );
  const [moduleStats, setModuleStats] = useState<Record<string, { accepted: number; total: number }>>({});

  function refreshMine() {
    const { state, message } = readLearningState();
    setSnapshot(buildProgressSnapshot(state, message));
    const acceptedSet = new Set(acceptedExerciseIds(state.attempts));
    const next: Record<string, { accepted: number; total: number }> = {};
    for (const course of academyCourses) {
      for (const moduleId of course.moduleIds) {
        const keys = moduleExerciseKeys(moduleId);
        let accepted = 0;
        for (const key of keys) {
          const exercise = exercises[key];
          if (exercise && acceptedSet.has(exercise.id)) accepted += 1;
        }
        next[moduleId] = { accepted, total: keys.length };
      }
    }
    setModuleStats(next);
  }

  useEffect(() => {
    refreshMine();
  }, []);

  const acceptedTitles = snapshot.acceptedExerciseIds.map(
    (id) => Object.values(exercises).find((item) => item.id === id)?.title ?? id,
  );

  return (
    <div className="progress-tabs">
      <div className="tab-row" role="tablist" aria-label="Режим прогресса">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'demo'}
          className={tab === 'demo' ? 'is-active' : undefined}
          onClick={() => setTab('demo')}
        >
          Пример прогресса студента · Демо
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'mine'}
          className={tab === 'mine' ? 'is-active' : undefined}
          onClick={() => {
            setTab('mine');
            refreshMine();
          }}
        >
          Мои результаты
        </button>
      </div>

      {tab === 'demo' ? (
        <div className="progress-panel-filled">
          <p className="demo-banner" role="note">
            Демо: пример заполненного прогресса, не ваши баллы
          </p>
          <ProgressBody
            courses={demoProgress.courses}
            modules={demoProgress.modules}
            acceptedTitles={demoProgress.acceptedTitles}
            points={demoProgress.points}
            pointsMax={demoProgress.pointsMax}
            recent={demoProgress.recentAttempts}
            review={demoProgress.review}
            demo
          />
        </div>
      ) : (
        <div className="progress-panel-filled">
          <p className="small muted">Только принятые задачи из этого браузера.</p>
          <ProgressBody
            courses={academyCourses.map((course) => {
              const keys = course.moduleIds.flatMap((id) => moduleExerciseKeys(id));
              const accepted = keys.filter((key) =>
                snapshot.acceptedExerciseIds.includes(exercises[key]?.id),
              ).length;
              return {
                id: course.id,
                title: course.title,
                accepted,
                total: keys.length,
              };
            })}
            modules={academyCourses.flatMap((course) =>
              course.moduleIds.map((moduleId) => ({
                id: moduleId,
                title: getModule(moduleId)?.title ?? moduleId,
                accepted: moduleStats[moduleId]?.accepted ?? 0,
                total: moduleStats[moduleId]?.total ?? 0,
              })),
            )}
            acceptedTitles={acceptedTitles}
            points={snapshot.points}
            pointsMax={snapshot.pointsMax}
            recent={[]}
            review={snapshot.reviewSkills.map((item) => skillLabel(item.skillId))}
            demo={false}
            reviewLinks={snapshot.reviewSkills.map((item) => {
              const exercise = Object.values(exercises).find((ex) =>
                ex.expectedSkillIds.includes(item.skillId),
              );
              const route = exercise ? getExerciseRouteKey(exercise.id) : undefined;
              return { label: skillLabel(item.skillId), href: route ? `/practice/${route}` : undefined };
            })}
            onReset={() => {
              if (!window.confirm('Сбросить учебные данные этого сайта?')) return;
              resetLearningState();
              refreshMine();
            }}
          />
        </div>
      )}
    </div>
  );
}

function ProgressBody({
  courses,
  modules,
  acceptedTitles,
  points,
  pointsMax,
  recent,
  review,
  demo,
  reviewLinks,
  onReset,
}: {
  courses: { id: string; title: string; accepted: number; total: number }[];
  modules: { id: string; title: string; accepted: number; total: number }[];
  acceptedTitles: string[];
  points: number;
  pointsMax: number;
  recent: { title: string; at: string; verdict: string }[];
  review: string[];
  demo: boolean;
  reviewLinks?: { label: string; href?: string }[];
  onReset?: () => void;
}) {
  return (
    <>
      <section>
        <h2>Баллы</h2>
        <p className="progress-points-line">
          <strong>{points}</strong> / {pointsMax}
          {demo ? ' · Демо' : ''}
        </p>
      </section>

      <section>
        <h2>Курсы</h2>
        <ul className="filled-stat-list">
          {courses.map((course) => (
            <li key={course.id}>
              <span>{course.title}</span>
              <span>
                {course.accepted}/{course.total}
              </span>
              <div className="course-card-progress" aria-hidden="true">
                <span
                  style={{
                    width: `${course.total ? Math.round((course.accepted / course.total) * 100) : 0}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Модули</h2>
        <ul className="filled-stat-list">
          {modules.map((module) => (
            <li key={module.id}>
              <span>{module.title}</span>
              <span>
                {module.total > 0 ? `${module.accepted}/${module.total}` : '—'}
              </span>
              {module.total > 0 && (
                <div className="course-card-progress" aria-hidden="true">
                  <span style={{ width: `${Math.round((module.accepted / module.total) * 100)}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Выполненные задания</h2>
        {acceptedTitles.length === 0 ? (
          <p className="muted">Пока нет принятых задач.</p>
        ) : (
          <ul className="progress-list">
            {acceptedTitles.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        )}
      </section>

      {recent.length > 0 && (
        <section>
          <h2>Последние попытки{demo ? ' · Демо' : ''}</h2>
          <ul className="attempt-history-list">
            {recent.map((item) => (
              <li key={`${item.title}-${item.at}`}>
                <span>{item.title}</span>
                <span className={item.verdict === 'Принято' ? 'is-ok' : 'is-error'}>{item.verdict}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2>Что повторить</h2>
        {(reviewLinks ?? review.map((label) => ({ label, href: undefined as string | undefined }))).length ===
        0 ? (
          <p className="muted">Пока нечего повторять.</p>
        ) : (
          <ul className="progress-list">
            {(reviewLinks ?? review.map((label) => ({ label }))).map((item) => (
              <li key={item.label}>
                {item.label}
                {'href' in item && item.href ? (
                  <>
                    {' · '}
                    <Link className="text-link" href={item.href}>
                      открыть
                    </Link>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {onReset && (
        <p className="progress-reset">
          <button className="text-link" type="button" onClick={onReset}>
            Сбросить учебные данные
          </button>
        </p>
      )}
    </>
  );
}
