import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ModuleWorkspace } from '@/components/learning/module-workspace';
import { courseForModule, getModule } from '@/content/academy';
import { modules } from '@/content/curriculum';

export function generateStaticParams() {
  return modules.map((module) => ({ moduleId: module.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const module = getModule(moduleId);
  return { title: module?.title ?? 'Модуль' };
}

export default async function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const module = getModule(moduleId);
  if (!module) notFound();
  const course = courseForModule(moduleId);

  return (
    <div className="module-page">
      <p className="back-row">
        <Link className="text-link" href={course?.href ?? '/'}>
          Назад
        </Link>
      </p>
      <header className="page-title module-page-title">
        <h1>{module.title}</h1>
      </header>
      <ModuleWorkspace moduleId={moduleId} />
    </div>
  );
}
