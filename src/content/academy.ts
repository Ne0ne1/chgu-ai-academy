import { exercises, lessons, variablesLesson } from '@/content/lessons';

export type BlockReadiness = 'available' | 'coming';
export type CourseReadiness = 'available' | 'coming';

export interface AcademyBlock {
  id: string;
  title: string;
  outcome: string;
  readiness: BlockReadiness;
  lessonSlugs: string[];
  /** Practice route keys that count toward progress for this block. */
  exerciseKeys: string[];
}

export interface AcademyCourse {
  id: string;
  title: string;
  goal: string;
  readiness: CourseReadiness;
  href?: string;
  blocks?: AcademyBlock[];
}

/** Available graded tasks for the live Python course (first block only today). */
export const PYTHON_COURSE_ID = 'python-ai';
export const FIRST_BLOCK_ID = 'first-programs';

export const pythonBlocks: AcademyBlock[] = [
  {
    id: FIRST_BLOCK_ID,
    title: 'Первые программы',
    outcome: 'Сохранять значения в переменных, различать типы и преобразовывать текст в число.',
    readiness: 'available',
    lessonSlugs: [variablesLesson.slug],
    exerciseKeys: ['variables', 'variables-transfer'],
  },
  {
    id: 'conditions',
    title: 'Условия и логика',
    outcome: 'Выбирать действие по условию и соединять проверки.',
    readiness: 'coming',
    lessonSlugs: [],
    exerciseKeys: [],
  },
  {
    id: 'loops-data',
    title: 'Циклы и данные',
    outcome: 'Повторять шаги и работать с простыми коллекциями.',
    readiness: 'coming',
    lessonSlugs: [],
    exerciseKeys: [],
  },
  {
    id: 'functions-projects',
    title: 'Функции и небольшие проекты',
    outcome: 'Выделять повторяющуюся логику и собрать маленький проект.',
    readiness: 'coming',
    lessonSlugs: [],
    exerciseKeys: [],
  },
];

export const academyCourses: AcademyCourse[] = [
  {
    id: PYTHON_COURSE_ID,
    title: 'Python для AI',
    goal: 'Освоить базовый Python так, чтобы уверенно читать и писать учебные программы для следующих курсов по данным и моделям.',
    readiness: 'available',
    href: '/courses/python',
    blocks: pythonBlocks,
  },
  {
    id: 'ai-foundations',
    title: 'Основы AI',
    goal: 'Понять, как устроены модели, данные и проверка качества — без обещания, что курс уже открыт.',
    readiness: 'coming',
  },
];

export function getPythonCourse(): AcademyCourse {
  return academyCourses[0];
}

export function getBlock(blockId: string): AcademyBlock | undefined {
  return pythonBlocks.find((block) => block.id === blockId);
}

export function blockForLessonSlug(slug: string): AcademyBlock | undefined {
  return pythonBlocks.find((block) => block.lessonSlugs.includes(slug) || block.lessonSlugs.includes(`python/${slug}`));
}

export function blockForExerciseKey(exerciseKey: string): AcademyBlock | undefined {
  return pythonBlocks.find((block) => block.exerciseKeys.includes(exerciseKey));
}

export function availablePythonExerciseKeys(): string[] {
  return pythonBlocks.flatMap((block) => (block.readiness === 'available' ? block.exerciseKeys : []));
}

export function lessonBySlug(slugOrPath: string) {
  const key = slugOrPath.includes('/') ? slugOrPath : `python/${slugOrPath}`;
  return Object.hasOwn(lessons, key) ? lessons[key] : undefined;
}

export function exerciseTitle(exerciseKey: string): string {
  return exercises[exerciseKey]?.title ?? exerciseKey;
}
