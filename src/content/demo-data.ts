/** Explicitly fictional presentation data — never mix with live Attempt/Mastery. */

export const DEMO_PROFILE_NAME = 'Дадашев Иса';

export const demoRating = [
  { name: 'Даташа', points: 980 },
  { name: 'Виса', points: 860 },
  { name: 'Мерса', points: 740 },
  { name: 'Ахмад', points: 610 },
  { name: 'Кушпара Обулгамед', points: 520 },
  { name: 'Дадашев Иса', points: 450, highlight: true },
];

export const demoProgress = {
  courses: [
    { id: 'programming', title: 'Программирование и данные', accepted: 5, total: 12 },
    { id: 'ai-engineering', title: 'AI Engineering', accepted: 1, total: 8 },
  ],
  modules: [
    { id: 'python', title: 'Основы разработки', accepted: 5, total: 12 },
    { id: 'math', title: 'Математика и данные', accepted: 0, total: 8 },
    { id: 'ml', title: 'Машинное обучение', accepted: 0, total: 8 },
    { id: 'dl', title: 'Глубокое обучение', accepted: 0, total: 8 },
    { id: 'llm', title: 'LLM Engineering', accepted: 1, total: 8 },
    { id: 'production', title: 'От модели к сервису', accepted: 0, total: 6 },
    { id: 'capstone', title: 'AI Laboratory · выпускной проект', accepted: 0, total: 4 },
  ],
  acceptedTitles: [
    'План на неделю',
    'Минуты из текста',
    'Приветствие',
    'Следующий год',
    'Среднее двух чисел',
  ],
  points: 500,
  pointsMax: 1200,
  recentAttempts: [
    { title: 'Среднее двух чисел', at: '2026-11-07T18:20:00Z', verdict: 'Принято' },
    { title: 'Следующий год', at: '2026-11-07T17:55:00Z', verdict: 'Принято' },
    { title: 'План на неделю', at: '2026-11-06T21:10:00Z', verdict: 'Ошибка' },
  ],
  review: ['f-строки', 'Преобразование типов'],
};

export interface DemoSkillNode {
  id: string;
  label: string;
  level: 0 | 1 | 2 | 3;
  group: string;
  done: string;
  next: string;
  links: string[];
}

export const demoSkillNodes: DemoSkillNode[] = [
  {
    id: 'py',
    label: 'Python',
    level: 2,
    group: 'Python',
    done: 'Базовый синтаксис и переменные.',
    next: 'Условия и ветвление.',
    links: ['types', 'branch'],
  },
  {
    id: 'types',
    label: 'Типы и переменные',
    level: 3,
    group: 'Python',
    done: 'Приняты задачи про переменные и преобразование.',
    next: 'Условия if/else.',
    links: ['branch'],
  },
  {
    id: 'branch',
    label: 'Условия',
    level: 1,
    group: 'Python',
    done: 'Прочитан конспект.',
    next: 'Решить задачи на ветвление.',
    links: ['loops'],
  },
  {
    id: 'loops',
    label: 'Циклы',
    level: 0,
    group: 'Python',
    done: 'Пока нет подтверждения.',
    next: 'Урок «Циклы и коллекции».',
    links: ['pandas'],
  },
  {
    id: 'data',
    label: 'Работа с данными',
    level: 1,
    group: 'Данные',
    done: 'Знакомство с таблицами.',
    next: 'Практика pandas.',
    links: ['pandas', 'viz'],
  },
  {
    id: 'pandas',
    label: 'pandas',
    level: 0,
    group: 'Данные',
    done: '—',
    next: 'Фильтрация и группировка.',
    links: ['viz'],
  },
  {
    id: 'viz',
    label: 'Визуализация',
    level: 0,
    group: 'Данные',
    done: '—',
    next: 'Простые графики.',
    links: ['metrics'],
  },
  {
    id: 'ml',
    label: 'Машинное обучение',
    level: 1,
    group: 'ML',
    done: 'Обзор метрик.',
    next: 'Валидация моделей.',
    links: ['metrics', 'valid'],
  },
  {
    id: 'metrics',
    label: 'Метрики',
    level: 1,
    group: 'ML',
    done: 'Accuracy / precision в конспекте.',
    next: 'Практика на датасете.',
    links: ['valid'],
  },
  {
    id: 'valid',
    label: 'Валидация',
    level: 0,
    group: 'ML',
    done: '—',
    next: 'Train/test split.',
    links: ['emb'],
  },
  {
    id: 'llm',
    label: 'LLM',
    level: 1,
    group: 'LLM',
    done: 'Прочитан обзор embeddings.',
    next: 'Собрать простой RAG.',
    links: ['emb', 'rag'],
  },
  {
    id: 'emb',
    label: 'Embeddings',
    level: 1,
    group: 'LLM',
    done: 'Демо-конспект.',
    next: 'Поиск по близости.',
    links: ['rag'],
  },
  {
    id: 'rag',
    label: 'RAG',
    level: 0,
    group: 'LLM',
    done: '—',
    next: 'Индексация документов.',
    links: [],
  },
];
