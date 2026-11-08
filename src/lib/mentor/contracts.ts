export type MentorMode = 'local_model' | 'prepared';
export type MentorContext = 'lesson' | 'practice';

export interface MentorIssuePayload {
  kind: string;
  message: string;
  expected?: string;
  actual?: string;
  lessonAnchor?: string;
}

export interface MentorRequestBody {
  context: MentorContext;
  lessonId: string;
  sectionId?: string;
  question?: string;
  exerciseId?: string;
  includeCode?: boolean;
  code?: string;
  lastIssue?: MentorIssuePayload;
  hasAttempt?: boolean;
}

export interface MentorResponseBody {
  mode: MentorMode;
  text: string;
  lessonAnchor: string;
  modelName?: string;
  notice?: string;
}

export const MENTOR_LIMITS = {
  questionChars: 400,
  codeChars: 4_000,
  answerChars: 1_800,
  timeoutMs: 20_000,
} as const;
