import { HomeCourses } from '@/components/learning/home-courses';

export default function Home() {
  return (
    <div className="cabinet-home">
      <header className="cabinet-home-header">
        <h1>Моё обучение</h1>
      </header>
      <HomeCourses />
    </div>
  );
}
