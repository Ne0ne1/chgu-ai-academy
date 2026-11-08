import type { Attempt, Exercise, Mastery } from '@/lib/contracts';

/**
 * Mastery rules (explicit):
 * - Reading, self-check, hints, and plain «Запустить» do not change mastery.
 * - Only a passed Attempt with testResults evidence can mark expectedSkillIds as mastered.
 * - evidenceAttemptIds keep only existing attempt ids.
 * - Re-passing the same exercise does not duplicate accepted-exercise counting (handled in progress).
 * - Failing after a prior pass keeps evidence but sets related skills to needs_review.
 */
export function applyAttemptToMastery(
  mastery: Mastery[],
  exercise: Exercise,
  attempt: Attempt,
  allAttempts: Attempt[],
): Mastery[] {
  const attemptIds = new Set(allAttempts.map((item) => item.id));
  const next = mastery.map((item) => ({
    ...item,
    evidenceAttemptIds: item.evidenceAttemptIds.filter((id) => attemptIds.has(id)),
  }));

  const hadPriorPass = allAttempts.some(
    (item) => item.exerciseId === exercise.id && item.passed && item.id !== attempt.id,
  );

  for (const skillId of exercise.expectedSkillIds) {
    const index = next.findIndex((item) => item.skillId === skillId);
    const current = index >= 0
      ? next[index]
      : { skillId, state: 'not_started' as const, evidenceAttemptIds: [], updatedAt: attempt.timestamp };

    if (attempt.passed) {
      const evidence = [...new Set([...current.evidenceAttemptIds, attempt.id])].filter((id) => attemptIds.has(id));
      const updated: Mastery = {
        skillId,
        state: 'mastered',
        evidenceAttemptIds: evidence,
        updatedAt: attempt.timestamp,
      };
      if (index >= 0) next[index] = updated;
      else next.push(updated);
      continue;
    }

    if (hadPriorPass || current.state === 'mastered') {
      const updated: Mastery = {
        skillId,
        state: 'needs_review',
        evidenceAttemptIds: current.evidenceAttemptIds.filter((id) => attemptIds.has(id)),
        updatedAt: attempt.timestamp,
      };
      if (index >= 0) next[index] = updated;
      else next.push(updated);
      continue;
    }

    if (current.state === 'not_started') {
      const updated: Mastery = {
        skillId,
        state: 'learning',
        evidenceAttemptIds: current.evidenceAttemptIds,
        updatedAt: attempt.timestamp,
      };
      if (index >= 0) next[index] = updated;
      else next.push(updated);
    }
  }

  return next;
}

export function markLearningStarted(mastery: Mastery[], skillIds: string[], timestamp: string): Mastery[] {
  const next = [...mastery];
  for (const skillId of skillIds) {
    const index = next.findIndex((item) => item.skillId === skillId);
    if (index >= 0) {
      if (next[index].state === 'not_started') {
        next[index] = { ...next[index], state: 'learning', updatedAt: timestamp };
      }
      continue;
    }
    next.push({ skillId, state: 'learning', evidenceAttemptIds: [], updatedAt: timestamp });
  }
  return next;
}
