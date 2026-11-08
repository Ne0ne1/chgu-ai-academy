import { describe, expect, it } from 'vitest';
import { exercises } from '../../src/content/lessons';
import { applyAttemptToMastery } from '../../src/lib/learning/mastery';
import { acceptedExerciseIds, topicStatusForLesson } from '../../src/lib/learning/progress';
import {
  compactAttempts,
  createEmptyLearningState,
  isValidEvidence,
  parseLearningState,
  reconcileMastery,
} from '../../src/lib/learning/storage';
import { LEARNING_STORAGE_KEY, MAX_STORED_ATTEMPTS } from '../../src/lib/learning/contracts';
import type { Attempt, Mastery } from '../../src/lib/contracts';

function passedAttempt(id: string, exerciseId: string, timestamp: string): Attempt {
  return {
    id,
    exerciseId,
    timestamp,
    code: 'ok',
    passed: true,
    testResults: [
      { testId: 'case-5-3', passed: true, actualOutput: 'За неделю: 15 ч' },
      { testId: 'case-4-2', passed: true, actualOutput: 'За неделю: 8 ч' },
    ],
  };
}

function failedAttempt(id: string, exerciseId: string, timestamp: string): Attempt {
  return {
    id,
    exerciseId,
    timestamp,
    code: 'bad',
    passed: false,
    testResults: [{ testId: 'case-5-3', passed: false, actualOutput: 'bad' }],
  };
}

describe('learning storage', () => {
  it('rejects corrupt JSON without throwing', () => {
    const result = parseLearningState('{not-json');
    expect(result.access).toBe('corrupt');
    expect(result.state.attempts).toEqual([]);
    expect(result.message).toMatch(/не сохранён/i);
  });

  it('drops unknown exercise ids and invalid locations', () => {
    const raw = JSON.stringify({
      version: 1,
      lastLocation: { lessonId: 'variables', exerciseKey: 'nope', sectionId: 'missing' },
      drafts: { nope: { code: 'x', updatedAt: '2026-01-01T00:00:00.000Z' } },
      attempts: [
        {
          id: 'a1',
          exerciseId: 'unknown',
          timestamp: '2026-01-01T00:00:00.000Z',
          code: 'print(1)',
          passed: true,
          testResults: [],
        },
        {
          id: 'a2',
          exerciseId: 'study-plan',
          timestamp: '2026-01-01T00:00:00.000Z',
          code: 'print(1)',
          passed: true,
          testResults: [{ testId: 'case-5-3', passed: true, actualOutput: 'ok' }],
        },
      ],
      mastery: [
        {
          skillId: 'python.variables',
          state: 'mastered',
          evidenceAttemptIds: ['a2', 'missing'],
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    const result = parseLearningState(raw);
    expect(result.access).toBe('ok');
    expect(result.state.attempts.map((item) => item.id)).toEqual(['a2']);
    expect(result.state.mastery[0].evidenceAttemptIds).toEqual(['a2']);
    expect(result.state.lastLocation?.exerciseKey).toBeUndefined();
    expect(result.state.drafts.nope).toBeUndefined();
  });

  it('keeps storage key stable', () => {
    expect(LEARNING_STORAGE_KEY).toBe('chgu-ai-academy:learning:v1');
  });

  it('preserves one valid pass per exercise when trimming past the history cap', () => {
    const success = passedAttempt('pass-1', 'study-plan', '2026-01-01T00:00:00.000Z');
    const failures = Array.from({ length: MAX_STORED_ATTEMPTS + 5 }, (_, index) =>
      failedAttempt(`fail-${index}`, 'study-plan', `2026-01-02T00:${String(index).padStart(2, '0')}:00.000Z`),
    );
    const compacted = compactAttempts([success, ...failures], MAX_STORED_ATTEMPTS);
    expect(compacted.length).toBeLessThanOrEqual(MAX_STORED_ATTEMPTS);
    expect(compacted.some((item) => item.id === 'pass-1')).toBe(true);
    expect(isValidEvidence(compacted.find((item) => item.id === 'pass-1')!)).toBe(true);
    expect(acceptedExerciseIds(compacted)).toEqual(['study-plan']);
  });

  it('reloads compacted history with intact evidence and accepted count', () => {
    const success = passedAttempt('pass-1', 'study-plan', '2026-01-01T00:00:00.000Z');
    const failures = Array.from({ length: MAX_STORED_ATTEMPTS + 10 }, (_, index) =>
      failedAttempt(`fail-${index}`, 'study-plan', `2026-01-03T00:${String(index).padStart(2, '0')}:00.000Z`),
    );
    const compacted = compactAttempts([success, ...failures], MAX_STORED_ATTEMPTS);
    const mastery: Mastery[] = [
      {
        skillId: 'python.variables',
        state: 'mastered',
        evidenceAttemptIds: ['pass-1'],
        updatedAt: success.timestamp,
      },
    ];
    const raw = JSON.stringify({
      version: 1,
      drafts: {},
      attempts: compacted,
      mastery,
      updatedAt: '2026-01-04T00:00:00.000Z',
    });
    const result = parseLearningState(raw);
    expect(acceptedExerciseIds(result.state.attempts)).toEqual(['study-plan']);
    expect(result.state.mastery[0].state).toBe('mastered');
    expect(result.state.mastery[0].evidenceAttemptIds).toEqual(['pass-1']);
    expect(topicStatusForLesson('variables', result.state)).not.toBe('not_started');
  });

  it('demotes mastered honestly when old v1 data lost all evidence', () => {
    const failures = Array.from({ length: 3 }, (_, index) =>
      failedAttempt(`fail-${index}`, 'study-plan', `2026-01-02T00:0${index}:00.000Z`),
    );
    const mastery = reconcileMastery(
      [
        {
          skillId: 'python.variables',
          state: 'mastered',
          evidenceAttemptIds: ['ghost-pass'],
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      failures,
    );
    expect(mastery[0].state).toBe('learning');
    expect(mastery[0].evidenceAttemptIds).toEqual([]);
    expect(acceptedExerciseIds(failures)).toEqual([]);
  });

  it('does not treat passed:true without test results as evidence', () => {
    const bare: Attempt = {
      id: 'bare',
      exerciseId: 'study-plan',
      timestamp: '2026-01-01T00:00:00.000Z',
      code: 'x',
      passed: true,
      testResults: [],
    };
    expect(isValidEvidence(bare)).toBe(false);
    expect(acceptedExerciseIds([bare])).toEqual([]);
  });
});

describe('mastery and progress rules', () => {
  const exercise = exercises.variables;

  it('does not mark mastery without a passed attempt', () => {
    const failed = failedAttempt('f1', exercise.id, '2026-01-01T00:00:00.000Z');
    const mastery = applyAttemptToMastery([], exercise, failed, [failed]);
    expect(mastery.every((item) => item.state !== 'mastered')).toBe(true);
    expect(acceptedExerciseIds([failed])).toEqual([]);
  });

  it('marks expected skills mastered only after pass, with evidence ids', () => {
    const passed = passedAttempt('p1', exercise.id, '2026-01-01T00:00:00.000Z');
    const mastery = applyAttemptToMastery([], exercise, passed, [passed]);
    expect(mastery).toHaveLength(exercise.expectedSkillIds.length);
    expect(mastery.every((item) => item.state === 'mastered')).toBe(true);
    expect(mastery.every((item) => item.evidenceAttemptIds.includes('p1'))).toBe(true);
  });

  it('keeps evidence but sets needs_review after a later failure', () => {
    const passed = passedAttempt('p1', exercise.id, '2026-01-01T00:00:00.000Z');
    const failed = failedAttempt('f2', exercise.id, '2026-01-02T00:00:00.000Z');
    const afterPass = applyAttemptToMastery([], exercise, passed, [passed]);
    const afterFail = applyAttemptToMastery(afterPass, exercise, failed, [passed, failed]);
    expect(afterFail.every((item) => item.state === 'needs_review')).toBe(true);
    expect(afterFail.every((item) => item.evidenceAttemptIds.includes('p1'))).toBe(true);
    expect(acceptedExerciseIds([passed, failed])).toEqual([exercise.id]);
  });

  it('counts a repeated pass once', () => {
    const a = passedAttempt('p1', exercise.id, '2026-01-01T00:00:00.000Z');
    const b = passedAttempt('p2', exercise.id, '2026-01-02T00:00:00.000Z');
    expect(acceptedExerciseIds([a, b])).toEqual([exercise.id]);
  });

  it('does not treat empty state reading as mastery', () => {
    const state = createEmptyLearningState();
    expect(topicStatusForLesson('variables', state)).toBe('not_started');
  });
});
