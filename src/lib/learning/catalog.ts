import { allGradedExerciseKeys } from '@/content/academy';
import { exercises, lessons } from '@/content/lessons';
import type { LearningLocation } from '@/lib/learning/contracts';

const SECTION_IDS = new Set(
  Object.values(lessons).flatMap((lesson) => lesson.sections.map((section) => `${lesson.id}:${section.id}`)),
);

export function getExerciseRouteKey(exerciseId: string): string | undefined {
  return Object.entries(exercises).find(([, exercise]) => exercise.id === exerciseId)?.[0];
}

export function listAvailableExerciseKeys(): string[] {
  const fromCurriculum = allGradedExerciseKeys();
  return fromCurriculum.length > 0 ? fromCurriculum : Object.keys(exercises);
}

export function getLessonExerciseKeys(lessonId: string): string[] {
  return Object.entries(exercises)
    .filter(([, exercise]) => exercise.lessonId === lessonId)
    .map(([key]) => key);
}

export function getNextExerciseKey(currentKey: string): string | undefined {
  const current = exercises[currentKey];
  if (!current) return undefined;
  const lesson = Object.values(lessons).find((item) => item.id === current.lessonId);
  if (!lesson) return undefined;
  const index = lesson.exercises.indexOf(current.id);
  if (index < 0 || index >= lesson.exercises.length - 1) return undefined;
  const nextId = lesson.exercises[index + 1];
  return getExerciseRouteKey(nextId);
}

export function locationToHref(location: LearningLocation): string | null {
  if (location.exerciseKey) {
    if (!Object.hasOwn(exercises, location.exerciseKey)) return null;
    return `/practice/${location.exerciseKey}`;
  }
  const lesson = Object.values(lessons).find((item) => item.id === location.lessonId);
  if (!lesson) return null;
  if (location.sectionId) {
    if (!SECTION_IDS.has(`${lesson.id}:${location.sectionId}`)) return `/learn/${lesson.slug}`;
    return `/learn/${lesson.slug}#${location.sectionId}`;
  }
  return `/learn/${lesson.slug}`;
}

export function isValidLocation(location: LearningLocation): boolean {
  return locationToHref(location) !== null;
}

export function knownAttemptIds(attempts: { id: string }[]): Set<string> {
  return new Set(attempts.map((item) => item.id));
}
