import { redirect } from 'next/navigation';

/** Legacy route — course overview moved to /courses/python */
export default function ProgramRedirect() {
  redirect('/courses/python');
}
