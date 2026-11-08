import type { Attempt } from '@/lib/contracts';

/** Passed attempt with real test evidence — not a bare flag. */
export function isValidEvidence(attempt: Attempt): boolean {
  return (
    attempt.passed === true &&
    attempt.testResults.length > 0 &&
    attempt.testResults.every((item) => item.passed === true)
  );
}

/**
 * Keep at most `max` attempts, preferring recent ones, while retaining
 * at least one valid successful evidence attempt per exercise when present.
 */
export function compactAttempts(attempts: Attempt[], max: number): Attempt[] {
  if (attempts.length <= max) return attempts;

  const latestEvidenceByExercise = new Map<string, Attempt>();
  for (const attempt of attempts) {
    if (!isValidEvidence(attempt)) continue;
    latestEvidenceByExercise.set(attempt.exerciseId, attempt);
  }
  const protectedIds = new Set(
    [...latestEvidenceByExercise.values()].map((attempt) => attempt.id),
  );

  if (protectedIds.size >= max) {
    // Extreme case: keep the most recent protected evidence only.
    return [...latestEvidenceByExercise.values()]
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .slice(-max);
  }

  const keptIds = new Set<string>(protectedIds);
  for (let index = attempts.length - 1; index >= 0 && keptIds.size < max; index -= 1) {
    keptIds.add(attempts[index].id);
  }

  return attempts.filter((attempt) => keptIds.has(attempt.id));
}
