'use client';

import { useEffect, useState } from 'react';
import { Action } from '@/components/ui';
import { exercises, variablesLesson } from '@/content/lessons';
import { acceptedExerciseIds, continueHref, hasStartedLearning } from '@/lib/learning/progress';
import { readLearningState } from '@/lib/learning/storage';

export function HomeStartAction() {
  const [href, setHref] = useState(`/learn/${variablesLesson.slug}`);
  const [label, setLabel] = useState('Попробовать урок');

  useEffect(() => {
    const { state } = readLearningState();
    if (hasStartedLearning(state)) {
      setLabel('Продолжить обучение');
      setHref(continueHref(state));
    }
  }, []);

  return <Action href={href}>{label}</Action>;
}

export function HomeProgressSummary() {
  const [text, setText] = useState('Проверенных решений пока нет.');

  useEffect(() => {
    const { state, message } = readLearningState();
    const accepted = acceptedExerciseIds(state.attempts);
    if (accepted.length > 0) {
      const titles = accepted
        .map((id) => Object.values(exercises).find((item) => item.id === id)?.title ?? id)
        .join(', ');
      setText(`Принято задач: ${accepted.length}. ${titles}.`);
      return;
    }
    if (message) {
      setText(message);
      return;
    }
    if (hasStartedLearning(state)) {
      setText('Есть сохранённое место обучения. Принятых решений пока нет.');
    }
  }, []);

  return <p>{text}</p>;
}
