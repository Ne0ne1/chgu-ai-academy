'use client';

import type { MentorMode } from '@/lib/mentor/contracts';

export function MentorModeLabel({ mode, modelName }: { mode: MentorMode; modelName?: string }) {
  if (mode === 'local_model') {
    return <p className="small muted" role="status">Режим: локальная модель{modelName ? ` · ${modelName}` : ''}</p>;
  }
  return <p className="small muted" role="status">Режим: подготовленные подсказки</p>;
}

/** Plain-text answer only — never interpret HTML/scripts from the model. */
export function MentorAnswerText({ text }: { text: string }) {
  return (
    <div className="help-content" role="status">
      {text.split(/\n{2,}/).map((block, index) => (
        <p key={`${index}-${block.slice(0, 24)}`} style={{ whiteSpace: 'pre-wrap' }}>{block}</p>
      ))}
    </div>
  );
}
