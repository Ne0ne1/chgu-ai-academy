import { redirect } from 'next/navigation';

/** Legacy route from earlier cabinet iteration. */
export default function LegacyPythonCourseRedirect() {
  redirect('/courses/programming');
}
