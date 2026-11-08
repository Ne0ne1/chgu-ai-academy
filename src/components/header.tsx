'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Moon, Sun, UserRound } from 'lucide-react';
import { useTheme } from './theme-provider';
import { buildProgressSnapshot, courseExerciseProgress } from '@/lib/learning/progress';
import { readLearningState, resetLearningState } from '@/lib/learning/storage';

const PROFILE_NAME = 'Иса Дадашев';

export function Header() {
  const { theme, setTheme } = useTheme();
  const menu = useRef<HTMLDetailsElement>(null);
  const [accepted, setAccepted] = useState(0);
  const [total, setTotal] = useState(2);
  const [points, setPoints] = useState(0);
  const [pointsMax, setPointsMax] = useState(200);
  const [note, setNote] = useState<string | undefined>();

  function refreshProgress() {
    const { state } = readLearningState();
    const snapshot = buildProgressSnapshot(state);
    const course = courseExerciseProgress(state);
    setAccepted(course.accepted);
    setTotal(course.total);
    setPoints(snapshot.points);
    setPointsMax(snapshot.pointsMax);
  }

  useEffect(() => {
    refreshProgress();
    function onStorage(event: StorageEvent) {
      if (event.key === null || event.key?.includes('chgu-ai-academy:learning')) refreshProgress();
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refreshProgress);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refreshProgress);
    };
  }, []);

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !menu.current?.contains(event.target) && menu.current) {
        menu.current.open = false;
      }
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);

  function handleReset() {
    if (!window.confirm('Сбросить только учебные данные этого сайта? Тема оформления не изменится.')) return;
    const result = resetLearningState();
    refreshProgress();
    setNote(result.ok ? 'Учебные данные очищены.' : result.message);
  }

  function closeMenu() {
    if (menu.current) menu.current.open = false;
  }

  return (
    <header className="site-header">
      <div className="header-inner header-cabinet">
        <Link className="brand" href="/" aria-label="CHGU AI Academy — моё обучение">
          CHGU <span>AI Academy</span>
        </Link>
        <details
          className="user-menu"
          ref={menu}
          onToggle={() => {
            if (menu.current?.open) {
              refreshProgress();
              setNote(undefined);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && menu.current?.open) {
              menu.current.open = false;
              menu.current.querySelector('summary')?.focus();
            }
          }}
          onBlur={(event) => {
            if (
              event.relatedTarget instanceof Node &&
              !event.currentTarget.contains(event.relatedTarget)
            ) {
              event.currentTarget.open = false;
            }
          }}
        >
          <summary aria-label={`Профиль: ${PROFILE_NAME}`}>
            <span className="profile-avatar" aria-hidden="true">
              <UserRound size={17} />
            </span>
            <span className="profile-name">{PROFILE_NAME}</span>
            <ChevronDown size={13} />
          </summary>
          <div className="user-popover profile-panel">
            <div className="profile-panel-head">
              <p className="profile-panel-name">{PROFILE_NAME}</p>
              <p className="small muted">Учебный профиль на этом устройстве</p>
            </div>

            <div className="profile-progress-block">
              <p className="profile-block-title">Мой прогресс</p>
              <p>
                Принято задач: <strong>{accepted}</strong> из {total}
              </p>
              <p>
                Баллы: <strong>{points}</strong> / {pointsMax}
              </p>
              <p className="small muted">
                100 баллов за каждую уникальную принятую задачу. Баллы учебного прототипа, не университетская оценка.
              </p>
              <Link className="text-link" href="/progress" onClick={closeMenu}>
                Подробный прогресс
              </Link>
            </div>

            <fieldset className="theme-options">
              <legend>Тема</legend>
              <label>
                <input
                  type="radio"
                  name="theme"
                  checked={theme === 'light'}
                  onChange={() => setTheme('light')}
                />
                <Sun size={15} />
                Светлая
              </label>
              <label>
                <input
                  type="radio"
                  name="theme"
                  checked={theme === 'dark'}
                  onChange={() => setTheme('dark')}
                />
                <Moon size={15} />
                Тёмная
              </label>
            </fieldset>

            <div className="profile-panel-foot">
              {note && <p className="small muted">{note}</p>}
              <button className="text-link profile-reset" type="button" onClick={handleReset}>
                Сбросить учебные данные
              </button>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
