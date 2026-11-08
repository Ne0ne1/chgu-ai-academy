import { modules } from '@/content/curriculum';
import { exercises, lessons } from '@/content/lessons';
import type { Module } from '@/lib/contracts';

export type CourseId = 'programming' | 'ai-engineering';

export interface AcademyCourse {
  id: CourseId;
  title: string;
  /** Short optional subtitle for home card — keep minimal. */
  blurb?: string;
  moduleIds: string[];
  href: string;
}

/** Two courses preserving all seven curriculum modules in pedagogical order. */
export const academyCourses: AcademyCourse[] = [
  {
    id: 'programming',
    title: 'Программирование и данные',
    moduleIds: ['python', 'math', 'ml'],
    href: '/courses/programming',
  },
  {
    id: 'ai-engineering',
    title: 'AI Engineering',
    moduleIds: ['dl', 'llm', 'production', 'capstone'],
    href: '/courses/ai-engineering',
  },
];

export function getCourse(courseId: string): AcademyCourse | undefined {
  return academyCourses.find((course) => course.id === courseId);
}

export function getModule(moduleId: string): Module | undefined {
  return modules.find((module) => module.id === moduleId);
}

export function courseForModule(moduleId: string): AcademyCourse | undefined {
  return academyCourses.find((course) => course.moduleIds.includes(moduleId));
}

/** Published lesson slugs attached to a curriculum module topic. */
export function publishedLessonSlugs(moduleId: string): string[] {
  const module = getModule(moduleId);
  if (!module) return [];
  return module.topics
    .filter((topic) => topic.status === 'available' && topic.lessonSlug)
    .map((topic) => topic.lessonSlug as string);
}

export function plannedTopicTitles(moduleId: string): string[] {
  const module = getModule(moduleId);
  if (!module) return [];
  return module.topics.filter((topic) => topic.status === 'planned').map((topic) => topic.title);
}

export function lessonBySlug(slugOrPath: string) {
  const key = slugOrPath.includes('/') ? slugOrPath : `python/${slugOrPath}`;
  return Object.hasOwn(lessons, key) ? lessons[key] : undefined;
}

/** Practice route keys for published lessons in this module. */
export function moduleExerciseKeys(moduleId: string): string[] {
  const keys: string[] = [];
  for (const slug of publishedLessonSlugs(moduleId)) {
    const lesson = lessonBySlug(slug);
    if (!lesson) continue;
    for (const exerciseId of lesson.exercises) {
      const route = Object.entries(exercises).find(([, exercise]) => exercise.id === exerciseId)?.[0];
      if (route) keys.push(route);
    }
  }
  return keys;
}

export function moduleForLessonSlug(slug: string): Module | undefined {
  const full = slug.includes('/') ? slug : `python/${slug}`;
  return modules.find((module) =>
    module.topics.some((topic) => topic.lessonSlug === full || topic.lessonSlug === slug),
  );
}

export function moduleForExerciseKey(exerciseKey: string): Module | undefined {
  const exercise = exercises[exerciseKey];
  if (!exercise) return undefined;
  const lesson = Object.values(lessons).find((item) => item.id === exercise.lessonId);
  if (!lesson) return undefined;
  return moduleForLessonSlug(lesson.slug);
}

export function allGradedExerciseKeys(): string[] {
  return modules.flatMap((module) => moduleExerciseKeys(module.id));
}

export function courseExerciseKeys(courseId: CourseId): string[] {
  const course = getCourse(courseId);
  if (!course) return [];
  return course.moduleIds.flatMap((moduleId) => moduleExerciseKeys(moduleId));
}
