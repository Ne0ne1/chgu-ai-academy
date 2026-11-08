import { exercises, lessons } from '@/content/lessons';
import type { MentorIssuePayload, MentorRequestBody } from '@/lib/mentor/contracts';
import { MENTOR_LIMITS } from '@/lib/mentor/contracts';
import { sanitizeIssuePayload } from '@/lib/mentor/sanitize';

export function findLesson(lessonId: string) {
  return Object.values(lessons).find((item) => item.id === lessonId);
}

export function findExercise(exerciseId?: string) {
  if (!exerciseId) return undefined;
  return Object.values(exercises).find((item) => item.id === exerciseId);
}

export function lessonExcerpt(lessonId: string, sectionId?: string): string {
  const lesson = findLesson(lessonId);
  if (!lesson) return '';
  const sections = sectionId
    ? lesson.sections.filter((section) => section.id === sectionId)
    : lesson.sections.slice(0, 2);
  const text = sections
    .map((section) => {
      const body = section.paragraphs.join(' ');
      return `#${section.id} ${section.title}\n${body}`;
    })
    .join('\n\n');
  return text.slice(0, 2_400);
}

/** Anchors that exist for the current lesson page. */
export function lessonAnchors(lessonId: string): Set<string> {
  const anchors = new Set(['#lesson-help', '#self-check', '#practice']);
  const lesson = findLesson(lessonId);
  if (lesson) {
    for (const section of lesson.sections) anchors.add(`#${section.id}`);
  }
  return anchors;
}

export function resolveMentorAnchor(
  lessonId: string,
  candidate: string | undefined,
  fallback: string,
): string {
  const anchors = lessonAnchors(lessonId);
  const normalized = !candidate
    ? ''
    : candidate.startsWith('#')
      ? candidate
      : `#${candidate}`;
  if (normalized && anchors.has(normalized)) return normalized;
  const safeFallback = fallback.startsWith('#') ? fallback : `#${fallback}`;
  return anchors.has(safeFallback) ? safeFallback : '#lesson-help';
}

export function validateMentorRequest(raw: unknown): { ok: true; body: MentorRequestBody } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'Некорректный запрос' };
  const body = raw as Record<string, unknown>;
  if (body.context !== 'lesson' && body.context !== 'practice') {
    return { ok: false, error: 'Неизвестный контекст помощи' };
  }
  if (typeof body.lessonId !== 'string' || !findLesson(body.lessonId)) {
    return { ok: false, error: 'Урок не найден' };
  }
  const question = typeof body.question === 'string' ? body.question.slice(0, MENTOR_LIMITS.questionChars) : undefined;
  const code = typeof body.code === 'string' ? body.code.slice(0, MENTOR_LIMITS.codeChars) : undefined;
  const includeCode = body.includeCode === true;
  if (includeCode && !code?.trim()) {
    return { ok: false, error: 'Чтобы отправить код, отметьте согласие и передайте снимок кода' };
  }

  let lastIssue: MentorIssuePayload | undefined;
  if (body.lastIssue && typeof body.lastIssue === 'object') {
    const issue = body.lastIssue as Record<string, unknown>;
    if (typeof issue.kind === 'string' && typeof issue.message === 'string') {
      lastIssue = sanitizeIssuePayload(
        {
          kind: issue.kind,
          message: issue.message,
          expected: typeof issue.expected === 'string' ? issue.expected : undefined,
          actual: typeof issue.actual === 'string' ? issue.actual : undefined,
          lessonAnchor: typeof issue.lessonAnchor === 'string' ? issue.lessonAnchor : undefined,
        },
        includeCode,
      );
    }
  }

  return {
    ok: true,
    body: {
      context: body.context,
      lessonId: body.lessonId,
      sectionId: typeof body.sectionId === 'string' ? body.sectionId.slice(0, 64) : undefined,
      question,
      exerciseId: typeof body.exerciseId === 'string' ? body.exerciseId.slice(0, 64) : undefined,
      includeCode,
      code: includeCode ? code : undefined,
      lastIssue,
      hasAttempt: body.hasAttempt === true,
    },
  };
}
