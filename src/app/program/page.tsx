import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { modules } from '@/content/curriculum';
import { lessons } from '@/content/lessons';
import { Breadcrumbs } from '@/components/ui';
import { academicReferences } from '@/content/learning-support';
import { ProgramTopicStatus } from '@/components/learning/program-topic-status';

export const metadata = { title: 'Программа' };
export default function Program() {
  return <div className="program-page"><Breadcrumbs items={[{ label: 'Программа' }]}/>
    <header className="page-title"><h1>Программа обучения</h1><p>Карта пути · сейчас открыт первый урок Python</p></header>
    <p className="program-note">Доступный урок можно открыть сразу. Остальные темы — план на будущее; чтение само по себе навык не подтверждает.</p>
    <div className="module-list">{modules.map((module, index) => {
      const available = module.topics.filter(topic => topic.status === 'available' && topic.lessonSlug && lessons[topic.lessonSlug]).length;
      const availabilityLabel = available === 0 ? 'План' : available === 1 ? '1 урок открыт' : `${available} урока открыты`;
      return <details id={module.id} className="module" key={module.id} open={index === 0}>
        <summary><span className="module-number">{module.number}</span><div><h2>{module.title}</h2><p>Месяц {module.months} · {module.summary}</p></div><span className="module-availability">{availabilityLabel}</span><ChevronDown size={16}/></summary>
        <div className="module-body"><p className="module-outcome">Результат модуля: {module.artifact.toLowerCase()}.</p>
          <ol className="topic-list">{module.topics.map(topic => {
            const lesson = topic.lessonSlug ? lessons[topic.lessonSlug] : undefined;
            const ready = topic.status === 'available' && lesson;
            return <li className={`topic-row ${ready ? 'is-available' : 'is-planned'}`} key={topic.title}>
              <div>{ready ? <Link href={`/learn/${lesson.slug}`}>{topic.title}</Link> : <span className="topic-planned-title">{topic.title}</span>}
                {ready ? <p>{lesson.estimatedMinutes} мин · доступен сейчас</p> : <p>В плане · материал ещё готовится</p>}</div>
              {ready
                ? <ProgramTopicStatus lessonId={lesson.id} fallback="Не начато"/>
                : <span className="topic-status">План</span>}
            </li>;
          })}</ol>
        </div>
      </details>;
    })}</div>
    <details className="program-method"><summary>Как устроено обучение и на что мы опираемся</summary>
      <p>Каждая тема ведёт к измеримому результату: объяснить идею, применить её в задаче и перенести в новую ситуацию. Самопроверка помогает найти пробел; освоение требует проверенного самостоятельного решения.</p>
      <p>После ошибки — короткий разбор и возвращение к нужному фрагменту. Повторная проверка той же задачи не увеличивает число принятых задач. Финал каждого модуля — небольшой проект.</p>
      <ul>{academicReferences.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><span> — {source.purpose}</span></li>)}</ul>
      <p className="small">Это ориентиры последовательности тем и практической работы. Наши объяснения и задания оригинальны; чужие материалы не импортируются. Любое будущее заимствование требует отдельной проверки лицензии и атрибуции. Партнёрства с авторами курсов нет.</p>
    </details>
  </div>;
}
