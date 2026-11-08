'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { demoSkillNodes, type DemoSkillNode } from '@/content/demo-data';
import { buildProgressSnapshot, skillLabel } from '@/lib/learning/progress';
import { readLearningState } from '@/lib/learning/storage';
import type { Mastery } from '@/lib/contracts';

export function SkillsMap() {
  const [tab, setTab] = useState<'demo' | 'mine'>('demo');
  const [selected, setSelected] = useState<DemoSkillNode>(demoSkillNodes[1]);
  const [mastered, setMastered] = useState<Mastery[]>([]);

  useEffect(() => {
    const { state } = readLearningState();
    setMastered(buildProgressSnapshot(state).masteredSkills);
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, DemoSkillNode[]>();
    for (const node of demoSkillNodes) {
      const list = map.get(node.group) ?? [];
      list.push(node);
      map.set(node.group, list);
    }
    return [...map.entries()];
  }, []);

  return (
    <div className="skills-screen">
      <div className="tab-row" role="tablist">
        <button
          type="button"
          className={tab === 'demo' ? 'is-active' : undefined}
          onClick={() => setTab('demo')}
        >
          Пример карты навыков · Демо
        </button>
        <button
          type="button"
          className={tab === 'mine' ? 'is-active' : undefined}
          onClick={() => setTab('mine')}
        >
          Мои навыки
        </button>
      </div>

      {tab === 'demo' ? (
        <>
          <p className="demo-banner" role="note">
            Пример карты навыков · Демо
          </p>
          <div className="skills-demo-layout">
            <div className="skills-groups">
              {groups.map(([group, nodes]) => (
                <section key={group}>
                  <h2>{group}</h2>
                  <ul className="skill-node-list">
                    {nodes.map((node) => (
                      <li key={node.id}>
                        <button
                          type="button"
                          className={`skill-node level-${node.level} ${selected.id === node.id ? 'is-selected' : ''}`}
                          onClick={() => setSelected(node)}
                        >
                          <span>{node.label}</span>
                          <span className="skill-level" aria-label={`Уровень ${node.level}`}>
                            {'●'.repeat(node.level)}
                            {'○'.repeat(3 - node.level)}
                          </span>
                        </button>
                        {node.links.length > 0 && (
                          <p className="skill-links small muted">
                            связано: {node.links.map((id) => demoSkillNodes.find((n) => n.id === id)?.label).join(', ')}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <aside className="skill-detail">
              <h2>{selected.label}</h2>
              <p>
                <strong>Уже сделано:</strong> {selected.done}
              </p>
              <p>
                <strong>Дальше:</strong> {selected.next}
              </p>
            </aside>
          </div>
        </>
      ) : (
        <section className="empty-state">
          <h2>Подтверждено тестами</h2>
          {mastered.length === 0 ? (
            <>
              <p>Пока нет навыков с доказательством успешной попытки в этом браузере.</p>
              <Link className="text-link" href="/modules/python">
                К модулю «Основы разработки»
              </Link>
            </>
          ) : (
            <ul className="progress-list">
              {mastered.map((item) => (
                <li key={item.skillId}>{skillLabel(item.skillId)}</li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
