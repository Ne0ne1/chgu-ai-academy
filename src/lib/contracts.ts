export type Availability = 'available' | 'planned';
export interface LessonSection { id: string; title: string; paragraphs: string[]; code?: string; output?: string; note?: string }
export interface Lesson { id: string; slug: string; title: string; summary: string; estimatedMinutes: number; difficulty: 'beginner' | 'intermediate'; prerequisites: string[]; objectives: string[]; sections: LessonSection[]; exercises: string[]; references: { title: string; url: string; attribution: string }[]; selfCheck: { question: string; choices: string[]; correctIndex: number; explanation: string } }
export interface Module { id: string; number: string; title: string; months: string; summary: string; artifact: string; topics: { title: string; lessonSlug?: string; status: Availability }[] }
/** Optional check against the executed Python namespace (value/type), not against source text. */
export interface VariableCheck {
  name: string;
  expectedType: 'int' | 'float' | 'str' | 'bool';
  expectedValue: number | string | boolean;
}
export interface TestCase {
  id: string;
  description: string;
  expectedStdout: string;
  stdin?: string;
  /** Inspect these names in the runtime after execution. Browser demo: tests are visible. */
  variableChecks?: VariableCheck[];
}
export interface Exercise { id: string; lessonId: string; title: string; statement: string; starterCode: string; expectedSkillIds: string[]; visibleTests: TestCase[]; hiddenTests: TestCase[]; hints: string[] }
export interface Attempt { id: string; exerciseId: string; timestamp: string; code: string; testResults: { testId: string; passed: boolean; actualOutput: string }[]; passed: boolean; timeSpentSeconds?: number }
export interface Mastery { skillId: string; state: 'not_started' | 'learning' | 'needs_review' | 'mastered'; evidenceAttemptIds: string[]; updatedAt: string }
export interface DiagnosticQuestion { id: string; skillId: string; prompt: string; choices: { id: string; text: string }[]; correctChoiceId: string; explanation: string }
export interface DiagnosticResult { id: string; completedAt: string; answers: { questionId: string; choiceId: string }[]; score: number; total: number; recommendedLessonSlug: string; skillScores: { skillId: string; correct: number; total: number }[] }
export interface LaboratoryProject { id: string; title: string; area: string; description: string; deliverable: string; skills: string[] }
