'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface LessonMaterialSection {
  id: string;
  title: string;
  body: ReactNode;
}

export function LessonMaterials({ sections }: { sections: LessonMaterialSection[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const baseId = useId();

  return (
    <div className="lesson-materials-col">
      <h2 id="materials-side-title">Материалы</h2>
      <ul className="materials-accordion" aria-labelledby="materials-side-title">
        {sections.map((section) => {
          const expanded = openId === section.id;
          const panelId = `${baseId}-${section.id}-panel`;
          const buttonId = `${baseId}-${section.id}-btn`;
          return (
            <li key={section.id} className={expanded ? 'is-open' : undefined}>
              <button
                type="button"
                id={buttonId}
                className="materials-accordion-trigger"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpenId(expanded ? null : section.id)}
              >
                <span>{section.title}</span>
                <ChevronDown size={16} aria-hidden="true" className="materials-chevron" />
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!expanded}
                className="materials-accordion-panel"
              >
                {section.body}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
