import { Breadcrumbs } from '@/components/ui';
import { SkillsMap } from '@/components/learning/skills-map';

export const metadata = { title: 'Карта навыков' };

export default function SkillsPage() {
  return (
    <div className="narrow-page">
      <Breadcrumbs items={[{ label: 'Моё обучение', href: '/' }, { label: 'Карта навыков' }]} />
      <header className="page-title">
        <h1>Карта навыков</h1>
        <p>Только навыки, подтверждённые принятыми тестами. Без искусственных процентов.</p>
      </header>
      <SkillsMap />
    </div>
  );
}
