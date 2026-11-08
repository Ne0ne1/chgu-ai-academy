export type TaskDifficulty = 'basic' | 'medium' | 'hard';

export interface LessonTaskSlot {
  id: string;
  title: string;
  difficulty: TaskDifficulty;
  /** Practice route key when grading is live; omit = not yet graded. */
  practiceKey?: string;
}

/** 4 + 4 + 4 slots for the published Variables lesson. Only slots with practiceKey award points. */
export const variablesTaskSlots: LessonTaskSlot[] = [
  { id: 'v-b1', title: 'План на неделю', difficulty: 'basic', practiceKey: 'variables' },
  { id: 'v-b2', title: 'Минуты из текста', difficulty: 'basic', practiceKey: 'variables-transfer' },
  { id: 'v-b3', title: 'Приветствие', difficulty: 'basic', practiceKey: 'variables-greeting' },
  { id: 'v-b4', title: 'Следующий год', difficulty: 'basic', practiceKey: 'variables-next-year' },
  { id: 'v-m1', title: 'Среднее двух чисел', difficulty: 'medium', practiceKey: 'variables-average' },
  { id: 'v-m2', title: 'Обмен значениями', difficulty: 'medium' },
  { id: 'v-m3', title: 'Тип значения', difficulty: 'medium' },
  { id: 'v-m4', title: 'Длина строки', difficulty: 'medium' },
  { id: 'v-h1', title: 'Формат отчёта', difficulty: 'hard' },
  { id: 'v-h2', title: 'Смешанные типы', difficulty: 'hard' },
  { id: 'v-h3', title: 'Бюджет недели', difficulty: 'hard' },
  { id: 'v-h4', title: 'Мини-калькулятор', difficulty: 'hard' },
];

export const difficultyLabels: Record<TaskDifficulty, string> = {
  basic: 'Базовые',
  medium: 'Средние',
  hard: 'Повышенные',
};

export function slotsByDifficulty(slots: LessonTaskSlot[]) {
  return {
    basic: slots.filter((slot) => slot.difficulty === 'basic'),
    medium: slots.filter((slot) => slot.difficulty === 'medium'),
    hard: slots.filter((slot) => slot.difficulty === 'hard'),
  };
}

export function livePracticeKeys(slots: LessonTaskSlot[]): string[] {
  return slots.map((slot) => slot.practiceKey).filter((key): key is string => Boolean(key));
}
