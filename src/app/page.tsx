import Link from 'next/link';
import { HomeProgressSummary, HomeStartAction } from '@/components/learning/home-continue';
import { variablesLesson } from '@/content/lessons';

export default function Home() {
  return <div className="home-page">
    <header className="home-heading">
      <h1>CHGU AI Academy</h1>
      <p>
        Проблема: студенту сложно учиться Python без быстрой объективной проверки и понятной помощи после ошибки.
        Этот прототип даёт один рабочий цикл прямо в браузере — без регистрации.
      </p>
    </header>
    <section className="learning-start" aria-labelledby="current-lesson">
      <p className="eyebrow">Модуль 1 · Основы Python · доступно сейчас</p>
      <h2 id="current-lesson">{variablesLesson.title}</h2>
      <p>
        Прочитайте короткий урок, намеренно сдайте неверное решение, разберите ошибку, исправьте код и посмотрите,
        как сохраняется прогресс. Оценка ставится только реальными тестами Python в браузере.
      </p>
      <ol className="learning-steps" aria-label="Демонстрационный путь">
        <li>Урок</li>
        <li>Неверная попытка</li>
        <li>Подсказка</li>
        <li>Исправление</li>
        <li>Прогресс</li>
      </ol>
      <HomeStartAction/>
      <p className="small muted" style={{ marginTop: 16 }}>
        Сразу к практике:{' '}
        <Link className="text-link" href="/practice/variables">задача «План на учебную неделю»</Link>
        {' · '}
        <Link className="text-link" href="/progress">прогресс</Link>
      </p>
    </section>
    <div className="home-progress"><h2>Ваш прогресс</h2><HomeProgressSummary/></div>
    <p className="small muted">
      Сейчас доступен один полноценный урок и две проверяемые задачи. Это рабочий прототип учебного цикла, а не готовая
      12‑месячная программа. В публичной среде помощь идёт в режиме подготовленных подсказок.
    </p>
  </div>;
}
