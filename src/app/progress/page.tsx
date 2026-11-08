import Link from 'next/link';
import { ProgressTabs } from '@/components/learning/progress-tabs';

export const metadata = { title: 'Прогресс' };

export default function Page() {
  return (
    <div className="progress-page">
      <p className="back-row">
        <Link className="text-link" href="/">
          Назад
        </Link>
      </p>
      <header className="page-title">
        <h1>Прогресс</h1>
      </header>
      <ProgressTabs />
    </div>
  );
}
