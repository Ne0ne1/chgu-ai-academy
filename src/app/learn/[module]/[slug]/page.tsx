import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CodeBlock, SelfCheck } from '@/components/interactions';
import { LessonHelp } from '@/components/lesson-help';
import { LessonObserver } from '@/components/learning/lesson-observer';
import { LessonMaterials } from '@/components/learning/lesson-materials';
import { LessonTaskPanel } from '@/components/learning/lesson-task-panel';
import { moduleForLessonSlug } from '@/content/academy';
import { variablesTaskSlots } from '@/content/lesson-tasks';
import { lessons } from '@/content/lessons';

export function generateStaticParams() {
  return Object.values(lessons).map((lesson) => {
    const [module, slug] = lesson.slug.split('/');
    return { module, slug };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string; slug: string }>;
}) {
  const { module, slug } = await params;
  const key = `${module}/${slug}`;
  return { title: lessons[key]?.title ?? 'Урок' };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ module: string; slug: string }>;
}) {
  const { module: modulePart, slug } = await params;
  const key = `${modulePart}/${slug}`;
  const lesson = Object.hasOwn(lessons, key) ? lessons[key] : undefined;
  if (!lesson) notFound();

  const courseModule = moduleForLessonSlug(key);
  const hasPractice = lesson.exercises.length > 0;
  const taskSlots = lesson.id === 'variables' ? variablesTaskSlots : [];
  const reviewHref = lesson.sections[0] ? `#${lesson.sections[0].id}` : undefined;
  const exampleSection = lesson.sections.find((section) => section.code);

  const materialSections = [
    {
      id: 'outline',
      title: 'Конспект',
      body: (
        <ul className="materials-toc">
          {lesson.sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.title}</a>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'example',
      title: 'Пример',
      body: exampleSection ? (
        <p className="small">
          Короткий пример в разделе «
          <a href={`#${exampleSection.id}`}>{exampleSection.title}</a>
          » в основной колонке.
        </p>
      ) : (
        <p className="small muted">Пример появится вместе с разбором темы.</p>
      ),
    },
    {
      id: 'extra',
      title: 'Дополнительно',
      body:
        lesson.references.length > 0 ? (
          <ul className="materials-toc">
            {lesson.references.map((reference) => (
              <li key={reference.url}>
                <a href={reference.url} target="_blank" rel="noreferrer">
                  {reference.title}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="small muted">Дополнительные ссылки будут добавлены позже.</p>
        ),
    },
    {
      id: 'video',
      title: 'Видео',
      body: (
        <div className="video-placeholder" role="note">
          Здесь будет видео по теме, созданное искусственным интеллектом
        </div>
      ),
    },
  ];

  return (
    <div className="lesson-screen">
      <p className="back-row">
        <Link className="text-link" href={courseModule ? `/modules/${courseModule.id}` : '/'}>
          Назад
        </Link>
      </p>
      <LessonObserver lessonId={lesson.id} sectionIds={lesson.sections.map((section) => section.id)} />

      <div className={`lesson-grid ${hasPractice ? 'has-tasks' : 'no-tasks'}`}>
        {hasPractice && (
          <aside className="lesson-tasks-col" aria-label="Задания урока">
            <LessonTaskPanel slots={taskSlots} />
          </aside>
        )}

        <article className="lesson-article lesson-main-col">
          <header className="lesson-heading">
            <h1>{lesson.title}</h1>
            <p className="lesson-lead">{lesson.summary}</p>
          </header>

          {!hasPractice && (
            <p className="practice-note muted">
              Учебный текст доступен. Автоматическая проверка заданий по этой теме ещё не опубликована —
              баллы за неё не начисляются.
            </p>
          )}

          {lesson.sections.map((section) => (
            <section className="lesson-section" id={section.id} key={section.id}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.code && <CodeBlock code={section.code} output={section.output} />}
              {section.note && <p className="lesson-note">{section.note}</p>}
            </section>
          ))}

          <SelfCheck check={lesson.selfCheck} reviewHref={reviewHref} />
          {hasPractice && <LessonHelp lessonId={lesson.id} />}
        </article>

        <LessonMaterials sections={materialSections} />
      </div>
    </div>
  );
}
