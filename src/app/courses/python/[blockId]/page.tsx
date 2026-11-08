import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui';
import { BlockShell } from '@/components/learning/block-shell';
import { TaskStatusList } from '@/components/learning/task-status-list';
import { getBlock, getPythonCourse, lessonBySlug } from '@/content/academy';

export function generateStaticParams() {
  return [{ blockId: 'first-programs' }];
}

export async function generateMetadata({ params }: { params: Promise<{ blockId: string }> }) {
  const { blockId } = await params;
  const block = getBlock(blockId);
  return { title: block?.title ?? 'Блок' };
}

export default async function BlockPage({ params }: { params: Promise<{ blockId: string }> }) {
  const { blockId } = await params;
  const block = getBlock(blockId);
  const course = getPythonCourse();
  if (!block || block.readiness !== 'available') notFound();

  const firstLesson = block.lessonSlugs[0] ? lessonBySlug(block.lessonSlugs[0]) : undefined;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Моё обучение', href: '/' },
          { label: course.title, href: '/courses/python' },
          { label: block.title },
        ]}
      />
      <BlockShell block={block} courseTitle={course.title}>
        <header className="page-title">
          <h1>{block.title}</h1>
          <p>{block.outcome}</p>
        </header>

        <section className="block-overview">
          <h2>Урок</h2>
          {firstLesson ? (
            <p>
              Начните с урока «{firstLesson.title}», затем решите две задачи.
              <br />
              <Link className="button" href={`/learn/${firstLesson.slug}`}>
                Открыть урок
              </Link>
            </p>
          ) : (
            <p className="muted">Урок ещё не опубликован.</p>
          )}
        </section>

        <section className="block-overview" aria-labelledby="tasks-heading">
          <h2 id="tasks-heading">Задачи блока</h2>
          <TaskStatusList exerciseKeys={block.exerciseKeys} />
        </section>
      </BlockShell>
    </>
  );
}
