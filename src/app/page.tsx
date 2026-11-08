import { HomeCourses } from '@/components/learning/home-courses';

export default function Home() {
  return (
    <div className="cabinet-home">
      <header className="cabinet-home-header">
        <h1>Моё обучение</h1>
        <p className="cabinet-home-lead">Два курса. Сейчас открыт только первый блок Python.</p>
      </header>
      <HomeCourses />
    </div>
  );
}
