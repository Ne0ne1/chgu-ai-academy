import type { MentorRequestBody } from '@/lib/mentor/contracts';

export const MENTOR_SYSTEM_PROMPT = `Ты учебный наставник CHGU AI Academy для начинающих.
Отвечай только на русском, кратко (до 8 предложений).
Обязательно:
1) объясни причину затруднения простыми словами;
2) дай один диагностический вопрос ИЛИ один следующий шаг без готового решения;
3) укажи раздел урока для возврата (например #names, #types, #conversion, #mistakes).
Запрещено:
- писать полный код решения задачи;
- утверждать, что работа принята или оценка выставлена;
- просить секреты, ключи или данные вне текущего вопроса;
- выдумывать факты об университете или партнёрствах.
Если не хватает данных — скажи, что проверить, а не угадывай.`;

export function buildMentorUserPrompt(input: {
  request: MentorRequestBody;
  lessonTitle: string;
  lessonExcerpt: string;
  exerciseStatement?: string;
}): string {
  const parts = [
    `Урок: ${input.lessonTitle}`,
    `Контекст: ${input.request.context}`,
    `Фрагмент урока:\n${input.lessonExcerpt}`,
  ];
  if (input.exerciseStatement) {
    parts.push(`Краткое условие задачи:\n${input.exerciseStatement}`);
  }
  if (input.request.sectionId) {
    parts.push(`Выбранный раздел: #${input.request.sectionId}`);
  }
  if (input.request.question?.trim()) {
    parts.push(`Вопрос студента:\n${input.request.question.trim()}`);
  }
  if (input.request.lastIssue) {
    const issue = input.request.lastIssue;
    parts.push(
      [
        'Последний результат проверки (не оценка наставника):',
        `вид: ${issue.kind}`,
        `сообщение: ${issue.message}`,
        issue.expected ? `ожидалось: ${issue.expected}` : '',
        issue.actual ? `получено: ${issue.actual}` : '',
        issue.lessonAnchor ? `якорь: ${issue.lessonAnchor}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }
  if (input.request.includeCode && input.request.code) {
    parts.push(`Код студента (передан явно):\n${input.request.code}`);
  } else {
    parts.push('Код студента не передан.');
  }
  parts.push('Сформулируй ответ по правилам системного промпта.');
  return parts.join('\n\n');
}
