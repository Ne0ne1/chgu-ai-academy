'use client';

import { useEffect } from 'react';
import { readLearningState, writeLearningState } from '@/lib/learning/storage';

export function LessonObserver({ lessonId, sectionIds }: { lessonId: string; sectionIds: string[] }) {
  useEffect(() => {
    const { state } = readLearningState();
    writeLearningState({
      ...state,
      lastLocation: { lessonId, sectionId: state.lastLocation?.sectionId },
      updatedAt: new Date().toISOString(),
    });

    if (typeof IntersectionObserver === 'undefined') return;

    const seen = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          if (!sectionIds.includes(id)) continue;
          seen.set(id, entry.intersectionRatio);
        }
        let best: string | undefined;
        let ratio = 0;
        for (const [id, value] of seen) {
          if (value >= ratio) {
            best = id;
            ratio = value;
          }
        }
        if (!best) return;
        const current = readLearningState().state;
        writeLearningState({
          ...current,
          lastLocation: { lessonId, sectionId: best },
          updatedAt: new Date().toISOString(),
        });
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.25, 0.5] },
    );

    for (const id of sectionIds) {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [lessonId, sectionIds]);

  return null;
}
