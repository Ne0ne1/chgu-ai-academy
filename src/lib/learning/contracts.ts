import type { Attempt, Mastery } from '@/lib/contracts';

export const LEARNING_STORAGE_KEY = 'chgu-ai-academy:learning:v1';
export const LEARNING_STORAGE_VERSION = 1 as const;
export const MAX_STORED_ATTEMPTS = 80;
export const MAX_DRAFT_CHARS = 40_000;

export interface LearningLocation {
  lessonId: string;
  sectionId?: string;
  exerciseKey?: string;
}

export interface CodeDraft {
  code: string;
  updatedAt: string;
}

export interface LearningStateV1 {
  version: typeof LEARNING_STORAGE_VERSION;
  lastLocation?: LearningLocation;
  drafts: Record<string, CodeDraft>;
  attempts: Attempt[];
  mastery: Mastery[];
  updatedAt: string;
}

export type TopicLearningStatus = 'not_started' | 'learning' | 'needs_review' | 'mastered';

export const POINTS_PER_ACCEPTED_TASK = 100;

export interface ProgressSnapshot {
  acceptedExerciseIds: string[];
  masteredSkills: Mastery[];
  reviewSkills: Mastery[];
  nextStep: { label: string; href: string } | null;
  /** Derived: unique accepted tasks × POINTS_PER_ACCEPTED_TASK. Not a separate counter. */
  points: number;
  pointsMax: number;
  storageMessage?: string;
}

export type StorageAccess = 'ok' | 'unavailable' | 'quota' | 'corrupt';
