import { describe, expect, it } from 'vitest';
import { resolveMentorAnchor, validateMentorRequest } from '../../src/lib/mentor/context';
import { buildMentorUserPrompt } from '../../src/lib/mentor/prompt';
import { assertNoSourceLeak, sanitizeIssuePayload } from '../../src/lib/mentor/sanitize';
import { extractAnchorCandidate } from '../../src/lib/mentor/service';

describe('code consent sanitization', () => {
  const traceback = [
    'Traceback (most recent call last):',
    '  File "<exec>", line 3, in <module>',
    '    print(total_hours)',
    'NameError: name \'total_hours\' is not defined',
  ].join('\n');

  it('drops editor code and traceback source lines when includeCode is false', () => {
    const validated = validateMentorRequest({
      context: 'practice',
      lessonId: 'variables',
      exerciseId: 'study-plan',
      hasAttempt: true,
      includeCode: false,
      code: 'days = int(input())\nprint(total_hours)\n',
      lastIssue: {
        kind: 'runtime',
        message: traceback,
        actual: traceback,
        expected: 'days = 5\nhours_per_day = 3',
        lessonAnchor: '#mistakes',
      },
    });
    expect(validated.ok).toBe(true);
    if (!validated.ok) return;

    expect(validated.body.code).toBeUndefined();
    expect(validated.body.includeCode).toBe(false);
    expect(validated.body.lastIssue?.kind).toBe('runtime');
    expect(validated.body.lastIssue?.message).toMatch(/NameError/i);
    expect(assertNoSourceLeak(validated.body.lastIssue?.message ?? '')).toBe(true);
    expect(assertNoSourceLeak(validated.body.lastIssue?.actual ?? '')).toBe(true);
    expect(validated.body.lastIssue?.message).not.toMatch(/print\(total_hours\)/);
    expect(validated.body.lastIssue?.actual ?? '').not.toMatch(/print\(total_hours\)/);
    expect(validated.body.lastIssue?.expected).toBeUndefined();

    const prompt = buildMentorUserPrompt({
      request: validated.body,
      lessonTitle: 'Переменные',
      lessonExcerpt: '#names\nПример',
      exerciseStatement: 'Условие',
    });
    expect(prompt).toMatch(/Код студента не передан/);
    expect(prompt).not.toMatch(/print\(total_hours\)/);
    expect(prompt).not.toMatch(/days = int\(input\(\)\)/);
  });

  it('keeps code snapshot only when consent is explicit', () => {
    const validated = validateMentorRequest({
      context: 'practice',
      lessonId: 'variables',
      includeCode: true,
      code: 'print(1)',
      lastIssue: {
        kind: 'runtime',
        message: traceback,
        actual: traceback,
        lessonAnchor: '#mistakes',
      },
    });
    expect(validated.ok).toBe(true);
    if (!validated.ok) return;
    expect(validated.body.code).toBe('print(1)');
    expect(validated.body.lastIssue?.actual).toContain('print(total_hours)');
  });

  it('sanitizeIssuePayload preserves kind with a brief safe description', () => {
    const safe = sanitizeIssuePayload(
      {
        kind: 'variable_type',
        message: 'У «days» тип str, ожидался int.',
        expected: 'int',
        actual: 'str',
        lessonAnchor: '#types',
      },
      false,
    );
    expect(safe.kind).toBe('variable_type');
    expect(safe.message).toMatch(/тип|int|str/i);
    expect(safe.expected).toBe('int');
    expect(safe.actual).toBe('str');
  });
});

describe('mentor anchor resolution', () => {
  it('accepts only anchors that exist in the current lesson', () => {
    expect(resolveMentorAnchor('variables', '#types', '#mistakes')).toBe('#types');
    expect(resolveMentorAnchor('variables', '#lesson-help', '#mistakes')).toBe('#lesson-help');
  });

  it('rejects nonexistent model anchors and falls back to prepared anchor', () => {
    expect(resolveMentorAnchor('variables', '#not-a-real-section', '#conversion')).toBe('#conversion');
    expect(resolveMentorAnchor('variables', '#ghost', '#also-missing')).toBe('#lesson-help');
    expect(extractAnchorCandidate('Смотрите раздел #ghost и ещё #types')).toBe('#ghost');
    expect(
      resolveMentorAnchor(
        'variables',
        extractAnchorCandidate('Смотрите раздел #ghost и ещё #types'),
        '#conversion',
      ),
    ).toBe('#conversion');
  });
});
