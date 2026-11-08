import Link from 'next/link';
import { HomeProgressSummary, HomeStartAction } from '@/components/learning/home-continue';
import { variablesLesson } from '@/content/lessons';

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-brand">
        <div className="home-hero-copy">
          <p className="home-kicker">CHGU AI Academy</p>
          <h1 id="home-brand">Учите Python с проверкой в браузере</h1>
          <p className="home-lead">
            Прочитайте урок, сдайте задачу, увидьте ошибку тестов, получите подсказку и исправьте код — без
            установки Python и без регистрации.
          </p>
          <div className="home-cta-row">
            <HomeStartAction />
          </div>
          <p className="home-scope">
            Сейчас открыто: 1 урок · 2 задачи ·{' '}
            <Link className="text-link" href="/about">
              подробнее о границах прототипа
            </Link>
          </p>
        </div>

        <aside className="home-cycle" aria-label="Пример учебного цикла">
          <p className="home-cycle-title">Как работает цикл</p>
          <ol className="cycle-steps">
            <li className="cycle-step">
              <span className="cycle-label">Код</span>
              <pre className="cycle-code" tabIndex={0}>
                {`total_hours = 15
print("За неделю: 15 ч")`}
              </pre>
            </li>
            <li className="cycle-step is-error">
              <span className="cycle-label">Ошибка проверки</span>
              <p>Пока не принято: значение должно зависеть от входа, а не от константы.</p>
            </li>
            <li className="cycle-step is-hint">
              <span className="cycle-label">Подсказка</span>
              <p>Пересчитайте произведение days × hours_per_day для каждого набора входных данных.</p>
            </li>
            <li className="cycle-step is-ok">
              <span className="cycle-label">Исправление</span>
              <pre className="cycle-code" tabIndex={0}>
                {`total_hours = days * hours_per_day
print(f"За неделю: {total_hours} ч")`}
              </pre>
            </li>
          </ol>
        </aside>
      </section>

      <section className="home-lesson-strip" aria-labelledby="current-lesson">
        <div>
          <p className="eyebrow">Доступный урок</p>
          <h2 id="current-lesson">{variablesLesson.title}</h2>
          <p>
            Короткое объяснение, самопроверка и две задачи с запуском Python через Pyodide. Оценка ставится только
            тестами — чтение и подсказка освоение не подтверждают.
          </p>
        </div>
        <div className="home-lesson-links">
          <Link className="text-link" href={`/learn/${variablesLesson.slug}`}>
            Открыть урок
          </Link>
          <Link className="text-link" href="/practice/variables">
            Сразу к задаче
          </Link>
          <Link className="text-link" href="/progress">
            Прогресс
          </Link>
        </div>
      </section>

      <section className="home-progress" aria-labelledby="home-progress-title">
        <h2 id="home-progress-title">Ваш прогресс</h2>
        <HomeProgressSummary />
      </section>
    </div>
  );
}
