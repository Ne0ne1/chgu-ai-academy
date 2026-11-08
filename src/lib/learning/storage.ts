import type { Attempt, Mastery } from '@/lib/contracts';
import { exercises, lessons } from '@/content/lessons';
import {
  LEARNING_STORAGE_KEY,
  LEARNING_STORAGE_VERSION,
  MAX_DRAFT_CHARS,
  MAX_STORED_ATTEMPTS,
  type LearningLocation,
  type LearningStateV1,
  type StorageAccess,
} from '@/lib/learning/contracts';
import { isValidLocation } from '@/lib/learning/catalog';
import { compactAttempts, isValidEvidence } from '@/lib/learning/evidence';

export interface StorageReadResult {
  state: LearningStateV1;
  access: StorageAccess;
  message?: string;
}

function emptyState(): LearningStateV1 {
  return {
    version: LEARNING_STORAGE_VERSION,
    drafts: {},
    attempts: [],
    mastery: [],
    updatedAt: new Date(0).toISOString(),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isMasteryState(value: unknown): value is Mastery['state'] {
  return value === 'not_started' || value === 'learning' || value === 'needs_review' || value === 'mastered';
}

function sanitizeLocation(raw: unknown): LearningLocation | undefined {
  if (!isObject(raw) || typeof raw.lessonId !== 'string') return undefined;
  const location: LearningLocation = { lessonId: raw.lessonId };
  if (typeof raw.sectionId === 'string') location.sectionId = raw.sectionId;
  if (typeof raw.exerciseKey === 'string') location.exerciseKey = raw.exerciseKey;
  if (!Object.values(lessons).some((lesson) => lesson.id === location.lessonId)) return undefined;
  if (location.exerciseKey && !Object.hasOwn(exercises, location.exerciseKey)) {
    delete location.exerciseKey;
  }
  if (location.sectionId) {
    const lesson = Object.values(lessons).find((item) => item.id === location.lessonId);
    if (!lesson?.sections.some((section) => section.id === location.sectionId)) {
      delete location.sectionId;
    }
  }
  return isValidLocation(location) ? location : undefined;
}

function sanitizeAttempt(raw: unknown, knownExerciseIds: Set<string>): Attempt | null {
  if (!isObject(raw)) return null;
  if (typeof raw.id !== 'string' || typeof raw.exerciseId !== 'string') return null;
  if (!knownExerciseIds.has(raw.exerciseId)) return null;
  if (typeof raw.timestamp !== 'string' || typeof raw.code !== 'string') return null;
  if (typeof raw.passed !== 'boolean') return null;
  if (!Array.isArray(raw.testResults)) return null;
  const testResults = raw.testResults
    .filter(isObject)
    .map((item) => ({
      testId: typeof item.testId === 'string' ? item.testId : '',
      passed: Boolean(item.passed),
      actualOutput: typeof item.actualOutput === 'string' ? item.actualOutput : '',
    }))
    .filter((item) => item.testId);
  const attempt: Attempt = {
    id: raw.id,
    exerciseId: raw.exerciseId,
    timestamp: raw.timestamp,
    code: raw.code.slice(0, MAX_DRAFT_CHARS),
    testResults,
    passed: raw.passed,
  };
  if (typeof raw.timeSpentSeconds === 'number' && Number.isFinite(raw.timeSpentSeconds)) {
    attempt.timeSpentSeconds = raw.timeSpentSeconds;
  }
  return attempt;
}

/**
 * Keep evidence ids that still resolve to valid passed attempts.
 * If mastery claimed mastered but evidence was already lost in older data — demote honestly.
 */
export function reconcileMastery(mastery: Mastery[], attempts: Attempt[]): Mastery[] {
  const byId = new Map(attempts.map((attempt) => [attempt.id, attempt]));
  return mastery.map((item) => {
    const evidenceAttemptIds = item.evidenceAttemptIds.filter((id) => {
      const attempt = byId.get(id);
      return Boolean(attempt && isValidEvidence(attempt));
    });
    if (item.state === 'mastered' && evidenceAttemptIds.length === 0) {
      return {
        ...item,
        state: 'learning',
        evidenceAttemptIds: [],
      };
    }
    return { ...item, evidenceAttemptIds };
  });
}

function sanitizeMastery(raw: unknown): Mastery | null {
  if (!isObject(raw)) return null;
  if (typeof raw.skillId !== 'string' || !isMasteryState(raw.state)) return null;
  if (typeof raw.updatedAt !== 'string' || !Array.isArray(raw.evidenceAttemptIds)) return null;
  const evidenceAttemptIds = raw.evidenceAttemptIds.filter((id): id is string => typeof id === 'string');
  return {
    skillId: raw.skillId,
    state: raw.state,
    evidenceAttemptIds,
    updatedAt: raw.updatedAt,
  };
}

export function parseLearningState(rawText: string): StorageReadResult {
  try {
    const parsed = JSON.parse(rawText) as unknown;
    if (!isObject(parsed) || parsed.version !== LEARNING_STORAGE_VERSION) {
      return { state: emptyState(), access: 'corrupt', message: 'Результат не сохранён: повреждённые данные.' };
    }

    const knownExerciseIds = new Set(Object.values(exercises).map((item) => item.id));
    const sanitizedAttempts = Array.isArray(parsed.attempts)
      ? parsed.attempts
          .map((item) => sanitizeAttempt(item, knownExerciseIds))
          .filter((item): item is Attempt => item !== null)
      : [];
    const attempts = compactAttempts(sanitizedAttempts, MAX_STORED_ATTEMPTS);
    const rawMastery = Array.isArray(parsed.mastery)
      ? parsed.mastery
          .map((item) => sanitizeMastery(item))
          .filter((item): item is Mastery => item !== null)
      : [];
    const mastery = reconcileMastery(rawMastery, attempts);

    const drafts: LearningStateV1['drafts'] = {};
    if (isObject(parsed.drafts)) {
      for (const [key, value] of Object.entries(parsed.drafts)) {
        if (!Object.hasOwn(exercises, key) || !isObject(value)) continue;
        if (typeof value.code !== 'string' || typeof value.updatedAt !== 'string') continue;
        drafts[key] = { code: value.code.slice(0, MAX_DRAFT_CHARS), updatedAt: value.updatedAt };
      }
    }

    return {
      state: {
        version: LEARNING_STORAGE_VERSION,
        lastLocation: sanitizeLocation(parsed.lastLocation),
        drafts,
        attempts,
        mastery,
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
      },
      access: 'ok',
    };
  } catch {
    return { state: emptyState(), access: 'corrupt', message: 'Результат не сохранён: повреждённые данные.' };
  }
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readLearningState(): StorageReadResult {
  if (!canUseStorage()) {
    return { state: emptyState(), access: 'unavailable', message: 'Результат не сохранён: хранилище недоступно.' };
  }
  try {
    const raw = window.localStorage.getItem(LEARNING_STORAGE_KEY);
    if (!raw) return { state: emptyState(), access: 'ok' };
    return parseLearningState(raw);
  } catch {
    return { state: emptyState(), access: 'unavailable', message: 'Результат не сохранён: хранилище недоступно.' };
  }
}

export function writeLearningState(state: LearningStateV1): { ok: boolean; access: StorageAccess; message?: string } {
  if (!canUseStorage()) {
    return { ok: false, access: 'unavailable', message: 'Результат не сохранён: хранилище недоступно.' };
  }
  const attempts = compactAttempts(state.attempts, MAX_STORED_ATTEMPTS);
  const mastery = reconcileMastery(state.mastery, attempts);
  const payload: LearningStateV1 = {
    ...state,
    version: LEARNING_STORAGE_VERSION,
    attempts,
    mastery,
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(payload));
    return { ok: true, access: 'ok' };
  } catch (error) {
    const quota = error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22);
    return {
      ok: false,
      access: quota ? 'quota' : 'unavailable',
      message: quota
        ? 'Результат не сохранён: недостаточно места в браузере.'
        : 'Результат не сохранён: хранилище недоступно.',
    };
  }
}

/** Clears only the learning key. Theme cookie and other keys stay untouched. */
export function resetLearningState(): { ok: boolean; message?: string } {
  if (!canUseStorage()) {
    return { ok: false, message: 'Хранилище недоступно.' };
  }
  try {
    window.localStorage.removeItem(LEARNING_STORAGE_KEY);
    return { ok: true };
  } catch {
    return { ok: false, message: 'Не удалось очистить учебные данные.' };
  }
}

export function createEmptyLearningState(): LearningStateV1 {
  return emptyState();
}

export { compactAttempts, isValidEvidence } from '@/lib/learning/evidence';
