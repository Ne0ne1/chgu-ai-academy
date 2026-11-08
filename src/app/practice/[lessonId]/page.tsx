import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Practice } from '@/components/practice';
import { moduleForExerciseKey } from '@/content/academy';
import { exercises, lessons } from '@/content/lessons';

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
  const module = moduleForExerciseKey(lessonId);
  const backHref = module ? `/modules/${module.id}` : '/';

  return (
    <div className="practice-page">
      <p className="back-row">
        <Link className="text-link" href={backHref}>
          Назад
        </Link>
      </p>
      <header className="page-title practice-heading">
        <h1>{exercise.title}</h1>
      </header>
      <Practice key={exercise.id} exercise={exercise} lessonSlug={lesson.slug} exerciseKey={lessonId} />
    </div>
  );
}
