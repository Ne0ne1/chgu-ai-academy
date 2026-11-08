import { notFound } from 'next/navigation';
import { exercises, lessons } from '@/content/lessons';
import { Action, Breadcrumbs } from '@/components/ui';
import { CodeBlock, SelfCheck } from '@/components/interactions';
import { LessonHelp } from '@/components/lesson-help';
import { LessonObserver } from '@/components/learning/lesson-observer';
import { getExerciseRouteKey } from '@/lib/learning/catalog';

export function generateStaticParams() { return Object.values(lessons).map(lesson => ({ slug: lesson.slug.split('/')[1] })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: lessons[`python/${slug}`]?.title ?? 'Урок не найден' };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const key = `python/${slug}`;
  const lesson = Object.hasOwn(lessons, key) ? lessons[key] : undefined;
  if (!lesson) notFound();
  const firstExerciseId = lesson.exercises[0];
  const practiceKey = firstExerciseId ? getExerciseRouteKey(firstExerciseId) : undefined;
  const practiceHref = practiceKey ? `/practice/${practiceKey}` : `/practice/${lesson.id}`;
  const exerciseTitles = lesson.exercises
    .map((exerciseId) => Object.values(exercises).find((item) => item.id === exerciseId)?.title)
    .filter((title): title is string => Boolean(title));
  const reviewHref = lesson.sections.some((section) => section.id === 'types')
    ? '#types'
    : lesson.sections.some((section) => section.id === 'branch')
      ? '#branch'
      : undefined;
  const practiceIntro =
    exerciseTitles.length > 1
      ? `Сначала решите «${exerciseTitles[0]}», затем «${exerciseTitles[1]}». Попробуйте самостоятельно, затем обращайтесь к подсказкам.`
      : exerciseTitles.length === 1
        ? `Решите задачу «${exerciseTitles[0]}». Попробуйте самостоятельно, затем обращайтесь к подсказкам.`
        : 'Попробуйте решить задачу самостоятельно, затем обращайтесь к подсказкам.';
  return <><Breadcrumbs items={[{ label: 'Программа', href: '/program' }, { label: 'Основы Python', href: '/program#python' }, { label: lesson.title }]}/>
    <LessonObserver lessonId={lesson.id} sectionIds={lesson.sections.map((section) => section.id)}/>
    <div className="lesson-layout">
      <aside className="lesson-sidebar"><nav className="lesson-toc" aria-label="Содержание урока"><p>В этом уроке</p>
        {lesson.sections.map(section => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}
        <a href="#self-check">Самопроверка</a><a href="#practice">Практика</a>
        <a href="#lesson-help" className="toc-help">Помощь с темой</a>
      </nav></aside>
      <article className="lesson-article">
        <header className="lesson-heading"><p className="small muted">Основы Python · {lesson.estimatedMinutes} минут</p><h1>{lesson.title}</h1><p className="lesson-lead">{lesson.summary}</p></header>
        <details className="lesson-objectives"><summary>Что вы научитесь делать · подготовка</summary>
          <ul>{lesson.objectives.map(objective => <li key={objective}>{objective}</li>)}</ul><p className="small muted">{lesson.prerequisites.join('. ')}.</p>
        </details>
        <details className="mobile-toc"><summary>Содержание урока</summary>
          {lesson.sections.map(section => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}<a href="#self-check">Самопроверка</a><a href="#practice">Практика</a>
        </details>
        <LessonHelp lessonId={lesson.id}/>
        {lesson.sections.map(section => <section className="lesson-section" id={section.id} key={section.id}>
          <h2>{section.title}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          {section.code && <CodeBlock code={section.code} output={section.output}/>}
          {section.note && <p className="lesson-note">{section.note}</p>}
        </section>)}
        <SelfCheck check={lesson.selfCheck} reviewHref={reviewHref}/>
        <section className="lesson-section practice-next" id="practice"><h2>Теперь примените</h2>
          <p>{practiceIntro}</p>
          <Action href={practiceHref}>Перейти к практике</Action>
          <p className="small muted">Проверка выполняется в браузере. Чтение урока и подсказка сами по себе освоение не подтверждают.</p>
        </section>
        <details className="references"><summary>Источники и дополнительное чтение</summary>
          {lesson.references.map(reference => <div key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer">{reference.title} ↗</a><p>{reference.attribution}</p></div>)}
        </details>
      </article>
    </div>
  </>;
}
