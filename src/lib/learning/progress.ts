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
import { isValidEvidence } from '@/lib/learning/evidence';

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
    nextStep = { label: 'Вернуться к программе', href: '/program' };
  } else {
    const lesson = lessons['python/variables'];
    nextStep = { label: 'Открыть первый урок', href: `/learn/${lesson.slug}` };
  }

  if (state.lastLocation) {
    const href = locationToHref(state.lastLocation);
    if (href && accepted.length === 0) {
      nextStep = { label: 'Продолжить обучение', href };
    }
  }

  return {
    acceptedExerciseIds: accepted,
    masteredSkills,
    reviewSkills,
    nextStep,
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
  return { label: 'К программе', href: '/program' };
}

export function skillLabel(skillId: string): string {
  const labels: Record<string, string> = {
    'python.variables': 'Переменные',
    'python.arithmetic': 'Арифметика',
    'python.fstrings': 'f-строки',
    'python.conversion': 'Преобразование типов',
    'python.conditions': 'Условия',
    'python.bool': 'Логика',
    'python.comparisons': 'Сравнения',
  };
  return labels[skillId] ?? skillId;
}

export function summarizeMastery(mastery: Mastery[]): string {
  if (mastery.length === 0) return 'Пока нет подтверждённых навыков.';
  return mastery.map((item) => skillLabel(item.skillId)).join(', ');
}
