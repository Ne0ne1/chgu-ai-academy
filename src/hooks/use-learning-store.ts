'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Attempt, Exercise } from '@/lib/contracts';
import type { LearningLocation, LearningStateV1 } from '@/lib/learning/contracts';
import { applyAttemptToMastery } from '@/lib/learning/mastery';
import {
  createEmptyLearningState,
  readLearningState,
  resetLearningState,
  writeLearningState,
} from '@/lib/learning/storage';

function newAttemptId() {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useLearningStore() {
  const [state, setState] = useState<LearningStateV1>(() => createEmptyLearningState());
  const [hydrated, setHydrated] = useState(false);
  const [storageMessage, setStorageMessage] = useState<string | undefined>();

  useEffect(() => {
    const result = readLearningState();
    setState(result.state);
    setStorageMessage(result.message);
    setHydrated(true);
  }, []);

  const persist = useCallback((next: LearningStateV1) => {
    setState(next);
    const result = writeLearningState(next);
    setStorageMessage(result.ok ? undefined : result.message);
    return result;
  }, []);

  const updateLocation = useCallback((location: LearningLocation) => {
    setState((current) => {
      const next = { ...current, lastLocation: location, updatedAt: new Date().toISOString() };
      const result = writeLearningState(next);
      setStorageMessage(result.ok ? undefined : result.message);
      return next;
    });
  }, []);

  const saveDraft = useCallback((exerciseKey: string, code: string) => {
    setState((current) => {
      const next: LearningStateV1 = {
        ...current,
        drafts: {
          ...current.drafts,
          [exerciseKey]: { code, updatedAt: new Date().toISOString() },
        },
        lastLocation: {
          lessonId: current.lastLocation?.lessonId ?? 'variables',
          exerciseKey,
        },
        updatedAt: new Date().toISOString(),
      };
      const result = writeLearningState(next);
      setStorageMessage(result.ok ? undefined : result.message);
      return next;
    });
  }, []);

  const recordAttempt = useCallback((exercise: Exercise, attemptInput: Omit<Attempt, 'id'>) => {
    const attempt: Attempt = { ...attemptInput, id: newAttemptId() };
    setState((current) => {
      const attempts = [...current.attempts, attempt];
      const mastery = applyAttemptToMastery(current.mastery, exercise, attempt, attempts);
      const next: LearningStateV1 = {
        ...current,
        attempts,
        mastery,
        updatedAt: attempt.timestamp,
      };
      const result = writeLearningState(next);
      setStorageMessage(result.ok ? undefined : result.message);
      return next;
    });
    return attempt;
  }, []);

  const reset = useCallback(() => {
    const result = resetLearningState();
    setState(createEmptyLearningState());
    setStorageMessage(result.ok ? undefined : result.message);
    return result;
  }, []);

  return {
    state,
    hydrated,
    storageMessage,
    persist,
    updateLocation,
    saveDraft,
    recordAttempt,
    reset,
  };
}
