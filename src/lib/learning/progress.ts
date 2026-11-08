import { exercises, lessons } from '@/content/lessons';
import type { Attempt, Mastery } from '@/lib/contracts';
import {
  getLessonExerciseKeys,
  getNextExerciseKey,
  locationToHref,
} from '@/lib/learning/catalog';
import type {
  LearningStateV1,
  ProgressSnapshot,
  TopicLearningStatus,
} from '@/lib/learning/contracts';
import { POINTS_PER_ACCEPTED_TASK } from '@/lib/learning/contracts';
import { isValidEvidence } from '@/lib/learning/evidence';
import { listAvailableExerciseKeys } from '@/lib/learning/catalog';

/** Points from unique accepted tasks only — same evidence as mastery. */
export function pointsFromAccepted(acceptedIds: string[]): number {
  return acceptedIds.length * POINTS_PER_ACCEPTED_TASK;
}

export function pointsMaximum(): number {
  return listAvailableExerciseKeys().length * POINTS_PER_ACCEPTED_TASK;
}

export function courseExerciseProgress(state: LearningStateV1): {
  accepted: number;
  total: number;
  titles: string[];
} {
  const keys = listAvailableExerciseKeys();
  const acceptedSet = new Set(acceptedExerciseIds(state.attempts));
  const acceptedTitles = keys
    .map((key) => exercises[key])
    .filter((item) => acceptedSet.has(item.id))
    .map((item) => item.title);
  return { accepted: acceptedTitles.length, total: keys.length, titles: acceptedTitles };
}

export type TaskRowStatus = 'not_started' | 'has_error' | 'accepted';

export function taskRowStatus(exerciseId: string, state: LearningStateV1): TaskRowStatus {
  const accepted = new Set(acceptedExerciseIds(state.attempts));
  if (accepted.has(exerciseId)) return 'accepted';
  const related = state.attempts.filter((attempt) => attempt.exerciseId === exerciseId);
  if (related.length === 0) return 'not_started';
  const latest = related[related.length - 1];
  return latest.passed ? 'accepted' : 'has_error';
}

export function taskRowLabel(status: TaskRowStatus): string {
  switch (status) {
    case 'accepted':
      return 'Принято';
    case 'has_error':
      return 'В работе';
    default:
      return 'Не начато';
  }
}

export function recentAttemptsForExercise(exerciseId: string, state: LearningStateV1, limit = 5) {
  return state.attempts
    .filter((attempt) => attempt.exerciseId === exerciseId)
    .slice(-limit)
    .reverse();
}

export function blockExerciseProgress(exerciseKeys: string[], state: LearningStateV1) {
  const accepted = new Set(acceptedExerciseIds(state.attempts));
  let done = 0;
  for (const key of exerciseKeys) {
    const exercise = exercises[key];
    if (exercise && accepted.has(exercise.id)) done += 1;
  }
  return { accepted: done, total: exerciseKeys.length };
}

/** Accepted exercises are derived only from stored valid evidence attempts. */
export function acceptedExerciseIds(attempts: Attempt[]): string[] {
  const ids: string[] = [];
  for (const attempt of attempts) {
    if (!isValidEvidence(attempt)) continue;
    if (!ids.includes(attempt.exerciseId)) ids.push(attempt.exerciseId);
  }
  return ids;
}

export function topicStatusForLesson(lessonId: string, state: LearningStateV1): TopicLearningStatus {
  const keys = getLessonExerciseKeys(lessonId);
  const exerciseList = keys.map((key) => exercises[key]);
  const exerciseIds = exerciseList.map((item) => item.id);
  const skillIds = new Set(exerciseList.flatMap((item) => item.expectedSkillIds));
  const accepted = new Set(acceptedExerciseIds(state.attempts));
  const lessonMastery = state.mastery.filter((item) => skillIds.has(item.skillId));

  if (exerciseIds.length > 0 && exerciseIds.every((id) => accepted.has(id))) {
    return lessonMastery.some((item) => item.state === 'needs_review') ? 'needs_review' : 'mastered';
  }

  const touched =
    state.attempts.some((attempt) => exerciseIds.includes(attempt.exerciseId)) ||
    keys.some((key) => Boolean(state.drafts[key])) ||
    state.lastLocation?.lessonId === lessonId;

  if (!touched) return 'not_started';
  if (lessonMastery.some((item) => item.state === 'needs_review')) return 'needs_review';
  return 'learning';
}

export function statusLabel(status: TopicLearningStatus): string {
  switch (status) {
    case 'mastered':
      return 'Освоено';
    case 'needs_review':
      return 'Нужно повторить';
    case 'learning':
      return 'Изучается';
    default:
      return 'Не начато';
  }
}

export function buildProgressSnapshot(state: LearningStateV1, storageMessage?: string): ProgressSnapshot {
  const accepted = acceptedExerciseIds(state.attempts);
  const masteredSkills = state.mastery.filter(
    (item) => item.state === 'mastered' && item.evidenceAttemptIds.length > 0,
  );
  const reviewSkills = state.mastery.filter((item) => item.state === 'needs_review');

  let nextStep: ProgressSnapshot['nextStep'] = null;
  const firstIncomplete = Object.entries(exercises).find(([, exercise]) => !accepted.includes(exercise.id));
  if (firstIncomplete) {
    nextStep = {
      label: `Решить: ${firstIncomplete[1].title}`,
      href: `/practice/${firstIncomplete[0]}`,
    };
  } else if (accepted.length > 0) {
    nextStep = { label: 'К модулю', href: '/modules/python' };
  } else {
    nextStep = { label: 'К модулю', href: '/modules/python' };
  }

  if (state.lastLocation) {
    const href = locationToHref(state.lastLocation);
    if (href && accepted.length === 0) {
      nextStep = { label: 'Продолжить', href };
    }
  }

  return {
    acceptedExerciseIds: accepted,
    masteredSkills,
    reviewSkills,
    nextStep,
    points: pointsFromAccepted(accepted),
    pointsMax: pointsMaximum(),
    storageMessage,
  };
}

export function continueHref(state: LearningStateV1): string {
  if (state.lastLocation) {
    const href = locationToHref(state.lastLocation);
    if (href) return href;
  }
  return `/learn/${lessons['python/variables'].slug}`;
}

export function hasStartedLearning(state: LearningStateV1): boolean {
  return Boolean(
    state.lastLocation ||
      Object.keys(state.drafts).length > 0 ||
      state.attempts.length > 0 ||
      state.mastery.some((item) => item.state !== 'not_started'),
  );
}

export function nextStepAfterPass(exerciseKey: string): { label: string; href: string } {
  const nextKey = getNextExerciseKey(exerciseKey);
  if (nextKey) {
    return { label: `Следующая задача: ${exercises[nextKey].title}`, href: `/practice/${nextKey}` };
  }
  return { label: 'К модулю', href: '/modules/python' };
}

export function skillLabel(skillId: string): string {
  const labels: Record<string, string> = {
    'python.variables': 'Переменные',
    'python.arithmetic': 'Арифметика',
    'python.fstrings': 'f-строки',
    'python.conversion': 'Преобразование типов',
  };
  return labels[skillId] ?? skillId;
}

export function summarizeMastery(mastery: Mastery[]): string {
  if (mastery.length === 0) return 'Пока нет подтверждённых навыков.';
  return mastery.map((item) => skillLabel(item.skillId)).join(', ');
}
