import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CourseModules } from '@/components/learning/course-modules';
import { academyCourses, getCourse } from '@/content/academy';

export function generateStaticParams() {
  return academyCourses.map((course) => ({ courseId: course.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = getCourse(courseId);
  return { title: course?.title ?? 'Курс' };
}

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = getCourse(courseId);
  if (!course) notFound();

  return (
    <div className="course-page">
      <p className="back-row">
        <Link className="text-link" href="/">
          Назад
        </Link>
      </p>
      <header className="page-title">
        <h1>{course.title}</h1>
      </header>
      <CourseModules courseId={course.id} moduleIds={course.moduleIds} />
    </div>
  );
}
