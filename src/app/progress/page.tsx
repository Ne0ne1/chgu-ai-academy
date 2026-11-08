import { Breadcrumbs } from '@/components/ui';
import { ProgressPanel } from '@/components/learning/progress-panel';

export const metadata = { title: 'Прогресс' };
export default function Page() {
  return <div className="narrow-page"><Breadcrumbs items={[{ label: 'Прогресс' }]}/>
    <header className="page-title"><h1>Прогресс обучения</h1><p>Навыки и задачи, подтверждённые автоматической проверкой.</p></header>
    <ProgressPanel/>
    <p className="small muted progress-rule">Чтение, просмотр подсказки и ответ на самопроверку не дают статус «освоено». Для него нужны самостоятельные решения с проверкой.</p>
  </div>;
}
