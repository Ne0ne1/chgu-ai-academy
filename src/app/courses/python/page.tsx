import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui';
import { CourseProgressBar } from '@/components/learning/course-progress-bar';
import { getPythonCourse } from '@/content/academy';

export const metadata = { title: 'Python для AI' };

export default function PythonCoursePage() {
  const course = getPythonCourse();
  const blocks = course.blocks ?? [];

  return (
    <div className="course-page">
      <Breadcrumbs items={[{ label: 'Моё обучение', href: '/' }, { label: course.title }]} />
      <header className="page-title">
        <h1>{course.title}</h1>
        <p>{course.goal}</p>
      </header>
      <CourseProgressBar label="Доступные задачи" />

      <section aria-labelledby="blocks-title" className="course-blocks">
        <h2 id="blocks-title">Блоки курса</h2>
        <ol className="course-block-list">
          {blocks.map((block, index) => {
            if (block.readiness === 'coming') {
              return (
                <li key={block.id} className="course-block-card is-coming">
                  <p className="course-card-badge">
                    Блок {index + 1} · Готовится
                  </p>
                  <h3>{block.title}</h3>
                  <p>{block.outcome}</p>
                  <p className="small muted">Появится, когда урок и задачи будут готовы. Прогресс пока не считается.</p>
                </li>
              );
            }

            return (
              <li key={block.id}>
                <Link className="course-block-card course-card-link" href={`/courses/python/${block.id}`}>
                  <p className="course-card-badge">Блок {index + 1} · Доступен</p>
                  <h3>{block.title}</h3>
                  <p>{block.outcome}</p>
                  <p className="small">
                    {block.exerciseKeys.length} проверяемые задачи · открыть блок
                  </p>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
