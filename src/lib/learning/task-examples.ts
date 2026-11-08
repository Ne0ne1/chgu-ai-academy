import type { Exercise, TestCase } from '@/lib/contracts';

export interface ProgramExample {
  stdin: string;
  expectedStdout: string;
  explanation: string;
}

const EXPLANATIONS: Record<string, string[]> = {
  'study-plan': ['5 дней × 3 часа = 15 часов', '4 дня × 2 часа = 8 часов'],
  'session-minutes': ['25 минут × 3 сессии = 75 минут', '10 минут × 3 сессии = 30 минут'],
  'name-greeting': ['Имя Амина подставляется в приветствие', 'Имя Иса подставляется в приветствие'],
  'next-year': ['18 + 1 = 19', '20 + 1 = 21'],
  'two-average': ['(3 + 6) / 2 = 4.5', '(2 + 2) / 2 = 1.0'],
};

function defaultExplanation(test: TestCase, index: number): string {
  const lines = (test.stdin ?? '').trim().split('\n').filter(Boolean);
  if (lines.length >= 2) {
    return `При вводе ${lines.join(' и ')} программа должна вывести «${test.expectedStdout}».`;
  }
  if (lines.length === 1) {
    return `При вводе ${lines[0]} программа должна вывести «${test.expectedStdout}».`;
  }
  return test.description || `Пример ${index + 1}`;
}

/** Build display examples from real visibleTests so they never diverge from grading. */
export function programExamples(exercise: Exercise, limit = 2): ProgramExample[] {
  const custom = EXPLANATIONS[exercise.id] ?? [];
  return exercise.visibleTests.slice(0, limit).map((test, index) => ({
    stdin: test.stdin ?? '',
    expectedStdout: test.expectedStdout,
    explanation: custom[index] ?? defaultExplanation(test, index),
  }));
}
