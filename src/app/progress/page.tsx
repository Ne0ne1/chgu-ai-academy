import { Breadcrumbs } from '@/components/ui';
import { ProgressPanel } from '@/components/learning/progress-panel';

export const metadata = { title: 'Прогресс' };

export default function Page() {
  return (
    <div className="narrow-page">
      <Breadcrumbs items={[{ label: 'Моё обучение', href: '/' }, { label: 'Прогресс' }]} />
      <header className="page-title">
        <h1>Прогресс</h1>
        <p>Принятые задачи, баллы и подтверждённые навыки.</p>
      </header>
      <ProgressPanel />
    </div>
  );
}
