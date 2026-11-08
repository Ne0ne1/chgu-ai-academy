import { notFound } from 'next/navigation';
import { exercises, lessons } from '@/content/lessons';
import { Breadcrumbs } from '@/components/ui';
import { Practice } from '@/components/practice';
import { BlockShell } from '@/components/learning/block-shell';
import { blockForExerciseKey, getPythonCourse } from '@/content/academy';

export const metadata = { title: 'Практика' };
export function generateStaticParams() {
  return Object.keys(exercises).map((lessonId) => ({ lessonId }));
}

export default async function Page({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const exercise = Object.hasOwn(exercises, lessonId) ? exercises[lessonId] : undefined;
  if (!exercise) notFound();
  const lesson = Object.values(lessons).find((item) => item.id === exercise.lessonId);
  if (!lesson) notFound();
  const block = blockForExerciseKey(lessonId);
  const course = getPythonCourse();

  const body = (
    <>
      <header className="page-title practice-heading">
        <p className="small muted">Задача · {block?.title ?? course.title}</p>
        <h1>{exercise.title}</h1>
      </header>
      <Practice key={exercise.id} exercise={exercise} lessonSlug={lesson.slug} exerciseKey={lessonId} />
    </>
  );

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Моё обучение', href: '/' },
          { label: course.title, href: '/courses/python' },
          ...(block ? [{ label: block.title, href: `/courses/python/${block.id}` }] : []),
          { label: lesson.title, href: `/learn/${lesson.slug}` },
          { label: exercise.title },
        ]}
      />
      {block ? (
        <BlockShell
          block={block}
          courseTitle={course.title}
          activeExerciseKey={lessonId}
        >
          {body}
        </BlockShell>
      ) : (
        body
      )}
    </>
  );
}
