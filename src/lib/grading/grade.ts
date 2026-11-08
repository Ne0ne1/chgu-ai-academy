import type { Attempt, Exercise, TestCase } from '@/lib/contracts';
import { normalizeStdout, valuesEqual } from '@/lib/grading/normalize';
import {
  runtimeIssue,
  stdoutIssue,
  variableIssue,
  type GradeIssue,
} from '@/lib/grading/feedback';
import type { RuntimeRunResult } from '@/lib/runtime/contracts';

export interface GradeTestResult {
  testId: string;
  passed: boolean;
  actualOutput: string;
  issues: GradeIssue[];
}

export interface GradeReport {
  passed: boolean;
  testResults: GradeTestResult[];
  issues: GradeIssue[];
  attempt: Omit<Attempt, 'id'>;
}

export type CodeRunner = (input: {
  code: string;
  stdin?: string;
  inspectVariables?: string[];
}) => Promise<RuntimeRunResult>;

function collectInspectNames(tests: TestCase[]): string[] {
  const names = new Set<string>();
  for (const test of tests) {
    for (const check of test.variableChecks ?? []) names.add(check.name);
  }
  return [...names];
}

function evaluateCase(test: TestCase, result: RuntimeRunResult): GradeTestResult {
  const issues: GradeIssue[] = [];
  if (result.truncated) {
    issues.push({
      testId: test.id,
      kind: 'truncated',
      message: 'Вывод обрезан по лимиту 20 КБ.',
      actual: result.stdout,
    });
  }
  if (!result.ok) {
    issues.push(runtimeIssue(test.id, result.errorKind, result.errorMessage || result.stderr || 'Ошибка выполнения'));
    return {
      testId: test.id,
      passed: false,
      actualOutput: result.stdout || result.stderr || result.errorMessage || '',
      issues,
    };
  }

  for (const check of test.variableChecks ?? []) {
    const issue = variableIssue(test.id, check, result.variables[check.name]);
    if (issue) issues.push(issue);
  }

  const expected = normalizeStdout(test.expectedStdout);
  const actual = normalizeStdout(result.stdout);
  if (expected !== actual) {
    issues.push(stdoutIssue(test.id, expected, actual));
  }

  return {
    testId: test.id,
    passed: issues.length === 0,
    actualOutput: result.stdout,
    issues,
  };
}

/** Run every visible+hidden test against the executed Python state. */
export async function gradeExercise(
  exercise: Exercise,
  code: string,
  run: CodeRunner,
): Promise<GradeReport> {
  const tests = [...exercise.visibleTests, ...exercise.hiddenTests];
  const inspectVariables = collectInspectNames(tests);
  const testResults: GradeTestResult[] = [];

  for (const test of tests) {
    const result = await run({
      code,
      stdin: test.stdin,
      inspectVariables,
    });
    testResults.push(evaluateCase(test, result));
  }

  const issues = testResults.flatMap((item) => item.issues);
  const passed = testResults.length > 0 && testResults.every((item) => item.passed);

  return {
    passed,
    testResults,
    issues,
    attempt: {
      exerciseId: exercise.id,
      timestamp: new Date().toISOString(),
      code,
      testResults: testResults.map((item) => ({
        testId: item.testId,
        passed: item.passed,
        actualOutput: item.actualOutput,
      })),
      passed,
    },
  };
}

/** Lightweight helper for unit tests without a browser worker. */
export function evaluateVariables(
  checks: NonNullable<TestCase['variableChecks']>,
  variables: RuntimeRunResult['variables'],
): boolean {
  return checks.every((check) => {
    const actual = variables[check.name];
    return (
      actual?.present &&
      actual.typeName === check.expectedType &&
      valuesEqual(check.expectedValue, actual.value)
    );
  });
}
