import { describe, expect, it } from 'vitest';
import { buildPreparedResponse, preparedPracticeHelp } from '../../src/lib/mentor/fallback';
import { MENTOR_SYSTEM_PROMPT } from '../../src/lib/mentor/prompt';
import { validateMentorRequest } from '../../src/lib/mentor/context';
import { answerMentorRequest } from '../../src/lib/mentor/service';

describe('mentor prepared help', () => {
  it('explains NameError-like runtime issues without a full solution', () => {
    const help = preparedPracticeHelp(
      {
        kind: 'runtime',
        message: 'NameError: name "total_hours" is not defined',
        actual: 'NameError: name "total_hours" is not defined',
        lessonAnchor: '#mistakes',
      },
      true,
    );
    expect(help.text.toLowerCase()).toMatch(/ошиб|name|имя/);
    expect(help.text).not.toMatch(/total_hours\s*=\s*days\s*\*\s*hours_per_day/);
    expect(help.lessonAnchor).toBe('#mistakes');
  });

  it('explains type mismatches with a next step', () => {
    const help = preparedPracticeHelp(
      {
        kind: 'variable_type',
        message: 'У «days» тип str, ожидался int.',
        expected: 'int',
        actual: 'str',
        lessonAnchor: '#types',
      },
      true,
    );
    expect(help.text.toLowerCase()).toMatch(/тип|строк|int/);
    expect(help.text).toMatch(/Следующий шаг/i);
    expect(help.text).not.toMatch(/days = int\(input\(\)\)\nhours_per_day = int\(input\(\)\)\ntotal_hours/);
  });

  it('explains wrong computed values without giving the answer constant path', () => {
    const help = preparedPracticeHelp(
      {
        kind: 'variable_value',
        message: 'Значение «total_hours» не совпало',
        expected: '8',
        actual: '15',
        lessonAnchor: '#names',
      },
      true,
    );
    expect(help.text.toLowerCase()).toMatch(/вычисл|констант|вход/);
    expect(help.text).not.toMatch(/print\("За неделю: 8 ч"\)/);
  });

  it('keeps general hints before the first attempt', () => {
    const help = buildPreparedResponse({
      context: 'practice',
      lessonId: 'variables',
      hasAttempt: false,
    });
    expect(help.text).toMatch(/Пока нет результата проверки/);
    expect(help.text).not.toMatch(/Решение принято/);
  });

  it('lesson help includes example and a check question', () => {
    const help = buildPreparedResponse({
      context: 'lesson',
      lessonId: 'variables',
      sectionId: 'types',
    });
    expect(help.text).toMatch(/Маленький пример/);
    expect(help.text).toMatch(/Проверьте себя/);
    expect(help.lessonAnchor).toBe('#types');
  });
});

describe('mentor prompt and validation', () => {
  it('system prompt forbids full solutions and fake acceptance', () => {
    expect(MENTOR_SYSTEM_PROMPT).toMatch(/полный код решения/i);
    expect(MENTOR_SYSTEM_PROMPT).toMatch(/принята/i);
  });

  it('rejects unknown lessons and overlong free-form fields via validation', () => {
    const badLesson = validateMentorRequest({ context: 'lesson', lessonId: 'nope' });
    expect(badLesson.ok).toBe(false);

    const longQuestion = 'q'.repeat(1000);
    const ok = validateMentorRequest({
      context: 'lesson',
      lessonId: 'variables',
      question: longQuestion,
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.body.question?.length).toBeLessThanOrEqual(400);
  });

  it('falls back to prepared mode when Ollama is down', async () => {
    const result = await answerMentorRequest({
      context: 'practice',
      lessonId: 'variables',
      exerciseId: 'study-plan',
      hasAttempt: true,
      lastIssue: {
        kind: 'stdout',
        message: 'Текст вывода не совпал',
        lessonAnchor: '#conversion',
      },
    });
    expect(result.mode).toBe('prepared');
    expect(result.notice).toMatch(/модель недоступна|подготовлен/i);
    expect(result.text.length).toBeGreaterThan(20);
  });
});
