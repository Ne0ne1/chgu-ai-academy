import type { MentorIssuePayload } from '@/lib/mentor/contracts';

/** Lines that look like student source or traceback frames pointing at source. */
export function looksLikeSourceLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^File\s+"/i.test(trimmed)) return true;
  if (/^File\s+</i.test(trimmed)) return true;
  if (/^\^+~*$/.test(trimmed)) return true;
  if (/^(print|input|def|class|import|from|async|await|return|for|while|if|elif|else|try|except|with)\b/.test(trimmed)) {
    return true;
  }
  if (/^[A-Za-z_][\w]*\s*=/.test(trimmed)) return true;
  // Indented traceback code snippet
  if (/^\s{2,}\S/.test(line) && /[()=]/.test(trimmed) && !/Error\b|Exception\b/.test(trimmed)) {
    return true;
  }
  return false;
}

export function sanitizeDiagnosticText(text: string, maxLen = 240): string {
  const kept = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => !looksLikeSourceLine(line))
    .map((line) => line.trim())
    .filter(Boolean);
  return kept.join(' ').replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

function summarizeKind(kind: string): string {
  switch (kind) {
    case 'runtime':
      return 'Ошибка выполнения программы.';
    case 'variable_missing':
      return 'После выполнения отсутствует ожидаемая переменная.';
    case 'variable_type':
      return 'Тип переменной не совпал с ожидаемым.';
    case 'variable_value':
      return 'Значение переменной не совпало с ожидаемым.';
    case 'stdout':
      return 'Текст вывода не совпал с ожидаемым.';
    case 'truncated':
      return 'Вывод был обрезан по лимиту.';
    default:
      return 'Проверка не приняла решение.';
  }
}

/**
 * Without includeCode consent: keep error kind + safe brief text,
 * drop editor snapshot (handled elsewhere) and source lines from diagnostics.
 */
export function sanitizeIssuePayload(
  issue: MentorIssuePayload,
  includeCode: boolean,
): MentorIssuePayload {
  if (includeCode) {
    return {
      kind: issue.kind.slice(0, 80),
      message: issue.message.slice(0, 500),
      expected: issue.expected?.slice(0, 200),
      actual: issue.actual?.slice(0, 200),
      lessonAnchor: issue.lessonAnchor?.slice(0, 40),
    };
  }

  const message = sanitizeDiagnosticText(issue.message) || summarizeKind(issue.kind);
  const expected = issue.expected ? sanitizeDiagnosticText(issue.expected, 120) : undefined;
  const actual = issue.actual ? sanitizeDiagnosticText(issue.actual, 120) : undefined;

  return {
    kind: issue.kind.slice(0, 80),
    message,
    expected: expected || undefined,
    actual: actual || undefined,
    lessonAnchor: issue.lessonAnchor?.slice(0, 40),
  };
}

export function assertNoSourceLeak(text: string): boolean {
  return !text.split('\n').some((line) => looksLikeSourceLine(line));
}
