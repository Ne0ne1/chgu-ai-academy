import Link from 'next/link';
import { HomeProgressSummary, HomeStartAction } from '@/components/learning/home-continue';
import { variablesLesson } from '@/content/lessons';

export default function Home() {
  return (
    <div className="home-page home-page-simple">
      <header className="home-simple-header">
        <p className="home-kicker">CHGU AI Academy</p>
        <h1>Учите Python с проверкой в браузере</h1>
        <p className="home-lead">
          Урок → задача → проверка тестами → подсказка при ошибке. Без установки Python и без регистрации.
        </p>
        <div className="home-cta-row">
          <HomeStartAction />
        </div>
      </header>

      <section className="home-available" aria-labelledby="current-lesson">
        <h2 id="current-lesson">Сейчас доступно</h2>
        <p>
          Урок «{variablesLesson.title}» и две задачи с запуском Python в браузере. Оценка только по тестам —
          чтение и подсказка освоение не подтверждают.
        </p>
        <HomeProgressSummary />
        <p className="home-scope small muted">
          Это учебный прототип, не годовая программа.{' '}
          <Link className="text-link" href="/about">
            О границах
          </Link>
        </p>
      </section>
    </div>
  );
}
