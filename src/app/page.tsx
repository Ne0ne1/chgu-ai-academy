import { CourseCard } from '@/components/learning/home-continue';
import { modules } from '@/content/curriculum';

export default function Home() {
  const planned = modules.filter((module) => module.id !== 'python');

  return (
    <div className="cabinet-home">
      <header className="cabinet-home-header">
        <h1>Моё обучение</h1>
      </header>

      <section aria-labelledby="available-course">
        <h2 id="available-course" className="sr-only">
          Доступный курс
        </h2>
        <CourseCard />
      </section>

      <section className="cabinet-plan" aria-labelledby="plan-title">
        <h2 id="plan-title">Дальше по плану</h2>
        <ul className="cabinet-plan-list">
          {planned.map((module) => (
            <li key={module.id}>
              <span className="cabinet-plan-name">{module.title}</span>
              <span className="cabinet-plan-status">Пока недоступен</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
