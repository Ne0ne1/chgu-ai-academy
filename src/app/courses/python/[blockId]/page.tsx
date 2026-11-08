import { redirect } from 'next/navigation';

/** Legacy block route → Основы разработки */
export default function LegacyBlockRedirect() {
  redirect('/modules/python');
}
