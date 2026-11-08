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
        <ul className="cabinet-module-list">
          {planned.map((module) => (
            <li key={module.id} className="course-card course-card-planned" aria-disabled="true">
              <p className="course-card-badge">Пока недоступен</p>
              <p className="course-card-title">{module.title}</p>
              <div className="course-card-progress" aria-hidden="true">
                <span style={{ width: '0%' }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
