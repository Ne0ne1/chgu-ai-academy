import Link from 'next/link';
import { modules } from '@/content/curriculum';
import { exercises, lessons, variablesLesson } from '@/content/lessons';
import { Breadcrumbs } from '@/components/ui';
import { getExerciseRouteKey } from '@/lib/learning/catalog';

export const metadata = { title: 'Основы Python' };

export default function Program() {
  const python = modules.find((module) => module.id === 'python');
  const path = [
    {
      label: 'Урок',
      title: variablesLesson.title,
      href: `/learn/${variablesLesson.slug}`,
      available: true,
    },
    ...variablesLesson.exercises.map((exerciseId, index) => {
      const exercise = Object.values(exercises).find((item) => item.id === exerciseId);
      const key = getExerciseRouteKey(exerciseId);
      return {
        label: `Задача ${index + 1}`,
        title: exercise?.title ?? exerciseId,
        href: key ? `/practice/${key}` : `/practice/${variablesLesson.id}`,
        available: true,
      };
    }),
  ];

  return (
    <div className="program-page course-overview">
      <Breadcrumbs items={[{ label: 'Моё обучение', href: '/' }, { label: 'Основы Python' }]} />
      <header className="page-title">
        <h1>Основы Python</h1>
        <p>Урок и две задачи. Сначала теория, затем практика с проверкой.</p>
      </header>

      <section className="course-path" aria-labelledby="path-title">
        <h2 id="path-title">Путь по курсу</h2>
        <ol className="course-path-list">
          {path.map((step) => (
            <li key={step.href}>
              <span className="course-path-label">{step.label}</span>
              <Link href={step.href}>{step.title}</Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="course-topics" aria-labelledby="topics-title">
        <h2 id="topics-title">Темы модуля</h2>
        <ol className="topic-list">
          {(python?.topics ?? []).map((topic) => {
            const lesson = topic.lessonSlug ? lessons[topic.lessonSlug] : undefined;
            const ready = topic.status === 'available' && lesson;
            return (
              <li className={`topic-row ${ready ? 'is-available' : 'is-planned'}`} key={topic.title}>
                <div>
                  {ready ? (
                    <Link href={`/learn/${lesson.slug}`}>{topic.title}</Link>
                  ) : (
                    <span className="topic-planned-title">{topic.title}</span>
                  )}
                  <p>{ready ? 'Доступно сейчас' : 'В плане'}</p>
                </div>
                <span className="topic-status">{ready ? 'Открыто' : 'План'}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <details className="program-method">
        <summary>План на 12 месяцев</summary>
        <ul className="cabinet-plan-list">
          {modules.map((module) => (
            <li key={module.id}>
              <span className="cabinet-plan-name">
                {module.number}. {module.title}
              </span>
              <span className="cabinet-plan-status">
                {module.id === 'python' ? 'Частично открыт' : 'Пока недоступен'}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
