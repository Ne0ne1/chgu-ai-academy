import type { VariableCheck } from '@/lib/contracts';
import type { InspectedVariable, RuntimeErrorKind } from '@/lib/runtime/contracts';

export interface GradeIssue {
  testId: string;
  kind: 'stdout' | 'variable_missing' | 'variable_type' | 'variable_value' | 'runtime' | 'truncated';
  message: string;
  expected?: string;
  actual?: string;
  lessonAnchor?: '#names' | '#types' | '#conversion' | '#mistakes';
}

export function runtimeIssue(testId: string, errorKind: RuntimeErrorKind | undefined, message: string): GradeIssue {
  if (errorKind === 'timeout') {
    return {
      testId,
      kind: 'runtime',
      message: 'Программа не завершилась за 5 секунд. Проверьте циклы и повторный ввод.',
      actual: message,
      lessonAnchor: '#mistakes',
    };
  }
  if (errorKind === 'truncated_output' || message.includes('обрез')) {
    return {
      testId,
      kind: 'truncated',
      message: 'Вывод обрезан: больше 20 КБ. Уменьшите объём print.',
      actual: message,
    };
  }
  const lower = message.toLowerCase();
  if (lower.includes('nameerror')) {
    return {
      testId,
      kind: 'runtime',
      message: 'NameError: имя ещё не определено или написано иначе. Проверьте порядок строк.',
      actual: message,
      lessonAnchor: '#mistakes',
    };
  }
  if (lower.includes('syntaxerror')) {
    return {
      testId,
      kind: 'runtime',
      message: 'SyntaxError: Python не смог разобрать код. Проверьте скобки, кавычки и двоеточия.',
      actual: message,
      lessonAnchor: '#mistakes',
    };
  }
  if (lower.includes('typeerror')) {
    return {
      testId,
      kind: 'runtime',
      message: 'TypeError: операция применена к неподходящим типам.',
      actual: message,
      lessonAnchor: '#types',
    };
  }
  if (lower.includes('valueerror')) {
    return {
      testId,
      kind: 'runtime',
      message: 'ValueError: значение нельзя преобразовать ожидаемым способом.',
      actual: message,
      lessonAnchor: '#conversion',
    };
  }
  return {
    testId,
    kind: 'runtime',
    message: 'Программа завершилась с ошибкой.',
    actual: message,
    lessonAnchor: '#mistakes',
  };
}

export function variableIssue(
  testId: string,
  check: VariableCheck,
  actual: InspectedVariable | undefined,
): GradeIssue | null {
  if (!actual?.present) {
    return {
      testId,
      kind: 'variable_missing',
      message: `После выполнения нет переменной «${check.name}». Создайте её и сохраните нужное значение.`,
      expected: `${check.name}: ${check.expectedType} = ${String(check.expectedValue)}`,
      actual: 'переменная отсутствует',
      lessonAnchor: '#names',
    };
  }
  if (actual.typeName !== check.expectedType) {
    return {
      testId,
      kind: 'variable_type',
      message: `У «${check.name}» тип ${actual.typeName || 'неизвестен'}, ожидался ${check.expectedType}.`,
      expected: check.expectedType,
      actual: actual.typeName || '—',
      lessonAnchor: '#types',
    };
  }
  if (!Object.is(actual.value, check.expectedValue)) {
    return {
      testId,
      kind: 'variable_value',
      message: `Значение «${check.name}» не совпало с ожидаемым для этого набора входных данных.`,
      expected: String(check.expectedValue),
      actual: String(actual.value),
      lessonAnchor: check.expectedType === 'str' ? '#conversion' : '#names',
    };
  }
  return null;
}

export function stdoutIssue(testId: string, expected: string, actual: string): GradeIssue {
  return {
    testId,
    kind: 'stdout',
    message: 'Текст вывода не совпал с ожидаемым. Сверьте пробелы, число и f-строку.',
    expected,
    actual: actual || '(пусто)',
    lessonAnchor: '#conversion',
  };
}

export function lessonHref(lessonSlug: string, anchor?: GradeIssue['lessonAnchor']) {
  return `/learn/${lessonSlug}${anchor ?? '#lesson-help'}`;
}
