import Link from 'next/link';
import { demoRating } from '@/content/demo-data';
import { LivePointsNote } from '@/components/learning/live-points-note';

export const metadata = { title: 'Рейтинг · Демо' };

export default function RatingPage() {
  return (
    <div className="narrow-page">
      <p className="back-row">
        <Link className="text-link" href="/">
          Назад
        </Link>
      </p>
      <header className="page-title">
        <h1>Рейтинг</h1>
      </header>

      <p className="demo-banner" role="note">
        Демо: участники и баллы вымышлены
      </p>

      <LivePointsNote />

      <ol className="demo-rating-list">
        {demoRating.map((row, index) => (
          <li key={row.name} className={row.highlight ? 'is-me' : undefined}>
            <span className="demo-rank">{index + 1}</span>
            <span className="demo-name">{row.name}</span>
            <span className="demo-points">{row.points}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
