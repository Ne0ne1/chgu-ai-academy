'use client';

import { useEffect, useState } from 'react';
import { statusLabel, topicStatusForLesson } from '@/lib/learning/progress';
import { createEmptyLearningState, readLearningState } from '@/lib/learning/storage';

export function ProgramTopicStatus({ lessonId, fallback }: { lessonId?: string; fallback: string }) {
  const [label, setLabel] = useState(fallback);

  useEffect(() => {
    if (!lessonId) return;
    const { state } = readLearningState();
    setLabel(statusLabel(topicStatusForLesson(lessonId, state ?? createEmptyLearningState())));
  }, [lessonId]);

  return <span className="topic-status">{label}</span>;
}
