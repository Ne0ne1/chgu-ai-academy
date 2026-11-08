import Link from 'next/link';
import { SkillsMap } from '@/components/learning/skills-map';

export const metadata = { title: 'Карта навыков' };

export default function SkillsPage() {
  return (
    <div className="skills-page">
      <p className="back-row">
        <Link className="text-link" href="/">
          Назад
        </Link>
      </p>
      <header className="page-title">
        <h1>Карта навыков</h1>
      </header>
      <SkillsMap />
    </div>
  );
}
