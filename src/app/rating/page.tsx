import { Breadcrumbs } from '@/components/ui';

export const metadata = { title: 'Демо рейтинга' };

const DEMO_ROWS = [
  { label: 'Участник 1', points: 200 },
  { label: 'Участник 2', points: 100 },
  { label: 'Участник 3', points: 100 },
  { label: 'Участник 4', points: 0 },
  { label: 'Участник 5', points: 0 },
];

export default function RatingPage() {
  return (
    <div className="narrow-page">
      <Breadcrumbs items={[{ label: 'Моё обучение', href: '/' }, { label: 'Демо рейтинга' }]} />
      <header className="page-title">
        <h1>Рейтинг</h1>
      </header>

      <p className="demo-banner" role="note">
        Демо: пример того, как может выглядеть рейтинг после появления аккаунтов
      </p>

      <p className="small muted">
        Это вымышленные обозначения. Они не связаны с вашими локальными баллами и не показывают реальных студентов.
      </p>

      <ol className="demo-rating-list">
        {DEMO_ROWS.map((row, index) => (
          <li key={row.label}>
            <span className="demo-rank">{index + 1}</span>
            <span className="demo-name">{row.label}</span>
            <span className="demo-points">{row.points}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
