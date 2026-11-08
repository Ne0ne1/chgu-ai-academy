import { getMentorConfig } from '@/lib/mentor/config';
import { buildPreparedResponse } from '@/lib/mentor/fallback';
import { findExercise, findLesson, lessonExcerpt, resolveMentorAnchor } from '@/lib/mentor/context';
import type { MentorRequestBody, MentorResponseBody } from '@/lib/mentor/contracts';
import { MENTOR_LIMITS } from '@/lib/mentor/contracts';
import { chatWithOllama, MentorModelError } from '@/lib/mentor/ollama';
import { buildMentorUserPrompt, MENTOR_SYSTEM_PROMPT } from '@/lib/mentor/prompt';

function clipAnswer(text: string) {
  return text.trim().slice(0, MENTOR_LIMITS.answerChars);
}

export function extractAnchorCandidate(text: string): string | undefined {
  const match = text.match(/#[a-z0-9_-]+/i);
  return match?.[0];
}

export async function answerMentorRequest(request: MentorRequestBody): Promise<MentorResponseBody> {
  const prepared = buildPreparedResponse(request);
  const preparedAnchor = resolveMentorAnchor(request.lessonId, prepared.lessonAnchor, '#lesson-help');
  const lesson = findLesson(request.lessonId);
  if (!lesson) {
    return {
      mode: 'prepared',
      text: prepared.text,
      lessonAnchor: preparedAnchor,
      notice: 'Урок не найден — показано подготовленное объяснение.',
    };
  }

  if (!getMentorConfig().ollamaEnabled) {
    return {
      mode: 'prepared',
      text: prepared.text,
      lessonAnchor: preparedAnchor,
      notice: 'Режим публичной среды: показаны подготовленные подсказки. Локальная модель здесь не вызывается.',
    };
  }

  try {
    const exercise = findExercise(request.exerciseId);
    const userPrompt = buildMentorUserPrompt({
      request,
      lessonTitle: lesson.title,
      lessonExcerpt: lessonExcerpt(request.lessonId, request.sectionId),
      exerciseStatement: exercise?.statement.slice(0, 700),
    });
    const modelAnswer = await chatWithOllama(MENTOR_SYSTEM_PROMPT, userPrompt);
    const candidate = extractAnchorCandidate(modelAnswer.text);
    return {
      mode: 'local_model',
      text: clipAnswer(modelAnswer.text),
      lessonAnchor: resolveMentorAnchor(request.lessonId, candidate, preparedAnchor),
      modelName: modelAnswer.model,
    };
  } catch (error) {
    const detail =
      error instanceof MentorModelError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Модель недоступна';
    return {
      mode: 'prepared',
      text: prepared.text,
      lessonAnchor: preparedAnchor,
      notice: `Локальная модель недоступна (${detail}). Показаны подготовленные подсказки. Можно повторить запрос позже.`,
    };
  }
}
