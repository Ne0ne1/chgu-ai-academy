'use client';

import { useEffect, useState } from 'react';
import { buildProgressSnapshot } from '@/lib/learning/progress';
import { readLearningState } from '@/lib/learning/storage';

/** Real browser points — kept separate from fictional rating/demo maps. */
export function LivePointsNote() {
  const [points, setPoints] = useState(0);
  const [max, setMax] = useState(0);

  useEffect(() => {
    const { state } = readLearningState();
    const snapshot = buildProgressSnapshot(state);
    setPoints(snapshot.points);
    setMax(snapshot.pointsMax);
  }, []);

  return (
    <p className="live-points-note">
      Ваши баллы в этом браузере (не из демо-рейтинга): <strong>{points}</strong> / {max}
    </p>
  );
}
