import type { MentorIssuePayload, MentorRequestBody } from '@/lib/mentor/contracts';
import { lessonSupport, practiceErrorSupport } from '@/content/learning-support';

function withCheck(text: string, check?: string, example?: string): string {
  const parts = [text];
  if (example) parts.push(`Маленький пример:\n${example}`);
  if (check) parts.push(`Проверьте себя: ${check}`);
  return parts.join('\n\n');
}

export function preparedLessonHelp(lessonId: string, sectionId?: string, question?: string): {
  text: string;
  lessonAnchor: string;
} {
  const topics = lessonSupport[lessonId] ?? [];
  const topic =
    (sectionId ? topics.find((item) => item.sectionId === sectionId) : undefined) ??
    topics[0];
  if (!topic) {
    return {
      text: 'Подготовленные объяснения для этой темы ещё собираются. Вернитесь к тексту урока и разберите пример построчно.',
      lessonAnchor: '#lesson-help',
    };
  }
  const q = question?.trim().toLowerCase() ?? '';
  let focus = topic.explanation;
  if (q.includes('тип') || q.includes('строк') || q.includes('число')) {
    const types = topics.find((item) => item.sectionId === 'types');
    if (types) {
      return {
        text: withCheck(types.explanation, types.checkQuestion, types.example),
        lessonAnchor: `#${types.sectionId}`,
      };
    }
  }
  if (q.includes('ошиб') || q.includes('nameerror') || q.includes('typeerror')) {
    const mistakes = topics.find((item) => item.sectionId === 'mistakes');
    if (mistakes) {
      return {
        text: withCheck(mistakes.explanation, mistakes.checkQuestion, mistakes.example),
        lessonAnchor: `#${mistakes.sectionId}`,
      };
    }
  }
  return {
    text: withCheck(focus, topic.checkQuestion, topic.example),
    lessonAnchor: `#${topic.sectionId}`,
  };
}

const PRACTICE_ANCHOR_BY_LESSON: Record<string, Record<string, string>> = {
  conditions: {
    '#names': '#compare',
    '#types': '#bool',
    '#conversion': '#branch',
    '#mistakes': '#mistakes',
  },
};

function remapPracticeAnchor(lessonId: string | undefined, anchor: string): string {
  const normalized = anchor.startsWith('#') ? anchor : `#${anchor}`;
  if (!lessonId) return normalized;
  return PRACTICE_ANCHOR_BY_LESSON[lessonId]?.[normalized] ?? normalized;
}

export function preparedPracticeHelp(
  issue?: MentorIssuePayload,
  hasAttempt = false,
  lessonId?: string,
): {
  text: string;
  lessonAnchor: string;
} {
  if (!hasAttempt || !issue) {
    const orientation =
      lessonId === 'conditions'
        ? 'Общая ориентация: прочитайте вход, сравните значения, выберите ветку if/else и выведите результат решения.'
        : 'Общая ориентация: прочитайте входные данные, сохраните их под понятными именами, выполните нужное действие и соберите вывод через f-строку.';
    return {
      text: [
        'Пока нет результата проверки. Сначала попробуйте решить задачу самостоятельно, затем нажмите «Проверить».',
        orientation,
        'Готовое решение здесь не приводится — это часть обучения.',
      ].join('\n\n'),
      lessonAnchor: remapPracticeAnchor(lessonId, lessonId === 'conditions' ? '#branch' : '#conversion'),
    };
  }

  const mapped = practiceErrorSupport[issue.kind] ?? practiceErrorSupport.default;
  const anchor = issue.lessonAnchor ?? mapped.lessonAnchor;
  const explanation =
    lessonId === 'conditions' && issue.kind === 'variable_value'
      ? 'Тип подходит, но значение не совпало с входом теста. Часто печатают константу вместо ветвления или путают порог сравнения.'
      : mapped.explanation;
  const nextStep =
    lessonId === 'conditions' && issue.kind === 'variable_value'
      ? 'Возьмите один набор входных данных и вручную определите, какая ветка должна сработать, затем сверьте условие в коде.'
      : mapped.nextStep;
  const checkQuestion =
    lessonId === 'conditions' && issue.kind === 'variable_value'
      ? 'Для этого входа условие истинно или ложно?'
      : mapped.checkQuestion;
  return {
    text: [
      explanation,
      `Следующий шаг: ${nextStep}`,
      checkQuestion ? `Проверьте себя: ${checkQuestion}` : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
    lessonAnchor: remapPracticeAnchor(lessonId, anchor),
  };
}

export function buildPreparedResponse(request: MentorRequestBody): {
  text: string;
  lessonAnchor: string;
} {
  if (request.context === 'practice') {
    return preparedPracticeHelp(request.lastIssue, Boolean(request.hasAttempt), request.lessonId);
  }
  return preparedLessonHelp(request.lessonId, request.sectionId, request.question);
}
