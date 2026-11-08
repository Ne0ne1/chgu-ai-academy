import { describe, expect, it } from 'vitest';
import { exercises } from '../../src/content/lessons';
import { gradeExercise } from '../../src/lib/grading/grade';
import { runPythonNode } from './node-python-runner';

const studyPlan = exercises.variables;
const transfer = exercises['variables-transfer'];
const practicePass = exercises.conditions;
const studyMode = exercises['conditions-logic'];

describe('grading with real Pyodide (node)', () => {
  it('accepts a correct study-plan solution across two input sets', async () => {
    const code = [
      'days = int(input())',
      'hours_per_day = int(input())',
      'total_hours = days * hours_per_day',
      'print(f"За неделю: {total_hours} ч")',
    ].join('\n');
    const report = await gradeExercise(studyPlan, code, runPythonNode);
    expect(report.passed).toBe(true);
    expect(report.testResults).toHaveLength(2);
  });

  it('rejects printing a constant instead of computing', async () => {
    const code = [
      'days = int(input())',
      'hours_per_day = int(input())',
      'total_hours = 15',
      'print("За неделю: 15 ч")',
    ].join('\n');
    const report = await gradeExercise(studyPlan, code, runPythonNode);
    expect(report.passed).toBe(false);
    expect(report.issues.some((issue) => issue.kind === 'variable_value' || issue.kind === 'stdout')).toBe(true);
  });

  it('rejects wrong stdout even with plausible variables on first case only', async () => {
    const code = [
      'days = int(input())',
      'hours_per_day = int(input())',
      'total_hours = days * hours_per_day',
      'print("готово")',
    ].join('\n');
    const report = await gradeExercise(studyPlan, code, runPythonNode);
    expect(report.passed).toBe(false);
    expect(report.issues.some((issue) => issue.kind === 'stdout')).toBe(true);
  });

  it('rejects wrong types when values stay as strings', async () => {
    const code = [
      'days = input()',
      'hours_per_day = input()',
      'total_hours = days + hours_per_day',
      'print(f"За неделю: {total_hours} ч")',
    ].join('\n');
    const report = await gradeExercise(studyPlan, code, runPythonNode);
    expect(report.passed).toBe(false);
    expect(report.issues.some((issue) => issue.kind === 'variable_type' || issue.kind === 'stdout')).toBe(true);
  });

  it('surfaces SyntaxError and NameError distinctly', async () => {
    const syntax = await gradeExercise(studyPlan, 'days = int(input()\n', runPythonNode);
    expect(syntax.passed).toBe(false);
    expect(syntax.issues[0]?.actual?.toLowerCase() ?? '').toContain('syntax');

    const name = await gradeExercise(
      studyPlan,
      'print(total_hours)\ndays = int(input())\nhours_per_day = int(input())\ntotal_hours = days * hours_per_day',
      runPythonNode,
    );
    expect(name.passed).toBe(false);
    expect((name.issues[0]?.actual ?? name.issues[0]?.message).toLowerCase()).toContain('nameerror');
  });

  it('accepts the transfer exercise and rejects a hardcoded answer', async () => {
    const good = [
      'minutes_text = input()',
      'minutes = int(minutes_text)',
      'total_minutes = minutes * 3',
      'print(f"Три сессии: {total_minutes} мин")',
    ].join('\n');
    const ok = await gradeExercise(transfer, good, runPythonNode);
    expect(ok.passed).toBe(true);

    const bad = [
      'minutes_text = input()',
      'minutes = 25',
      'total_minutes = 75',
      'print("Три сессии: 75 мин")',
    ].join('\n');
    const fail = await gradeExercise(transfer, bad, runPythonNode);
    expect(fail.passed).toBe(false);
  });

  it('accepts conditions pass exercise across threshold cases', async () => {
    const code = [
      'score = int(input())',
      'if score >= 60:',
      '    decision = "Допуск"',
      'else:',
      '    decision = "Повторить"',
      'print(decision)',
    ].join('\n');
    const report = await gradeExercise(practicePass, code, runPythonNode);
    expect(report.passed).toBe(true);
    expect(report.testResults).toHaveLength(3);
  });

  it('rejects hardcoded decision for conditions exercise', async () => {
    const code = [
      'score = int(input())',
      'decision = "Допуск"',
      'print(decision)',
    ].join('\n');
    const report = await gradeExercise(practicePass, code, runPythonNode);
    expect(report.passed).toBe(false);
  });

  it('accepts study-mode logic exercise and rejects one-sided condition', async () => {
    const good = [
      'temperature = int(input())',
      'is_rainy = int(input())',
      'if temperature >= 10 and is_rainy == 0:',
      '    mode = "На улице"',
      'else:',
      '    mode = "В помещении"',
      'print(mode)',
    ].join('\n');
    const ok = await gradeExercise(studyMode, good, runPythonNode);
    expect(ok.passed).toBe(true);
    expect(ok.testResults).toHaveLength(3);

    const bad = [
      'temperature = int(input())',
      'is_rainy = int(input())',
      'if temperature >= 10:',
      '    mode = "На улице"',
      'else:',
      '    mode = "В помещении"',
      'print(mode)',
    ].join('\n');
    const fail = await gradeExercise(studyMode, bad, runPythonNode);
    expect(fail.passed).toBe(false);
  });
});
