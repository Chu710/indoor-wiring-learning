import rawBank from './examBank.json';

export interface ExamQuestion {
  id: string;
  sourceCode: string;
  sourceNumber: number;
  sourcePage: number;
  prompt: string;
  choices: string[];
  answer: number;
}

export const examQuestions = rawBank as ExamQuestion[];
export const examDurationMs = 100 * 60 * 1000;
export const examDraftKey = 'indoor-wiring-mock-exam-draft-v1';
export const examResultsKey = 'indoor-wiring-mock-exam-results-v1';

export interface ExamDraft {
  startedAt: number;
  questionIndex: number;
  answers: (number | null)[];
}

export interface ExamResult extends ExamDraft {
  completedAt: number;
  correct: number;
  score: number;
  timedOut: boolean;
}

export function scoreExam(answers: (number | null)[]) {
  const correct = examQuestions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);
  return { correct, score: correct * 1.25, passed: correct >= 48 };
}

export function loadExamDraft(storage: Storage): ExamDraft | null {
  try {
    const value: unknown = JSON.parse(storage.getItem(examDraftKey) ?? 'null');
    if (!value || typeof value !== 'object') return null;
    const draft = value as Partial<ExamDraft>;
    if (typeof draft.startedAt !== 'number' || !Number.isFinite(draft.startedAt) || !Number.isInteger(draft.questionIndex) || draft.questionIndex! < 0 || draft.questionIndex! >= 80 || !Array.isArray(draft.answers) || draft.answers.length !== 80 || draft.answers.some((answer) => answer !== null && (!Number.isInteger(answer) || answer < 0 || answer > 3))) return null;
    return draft as ExamDraft;
  } catch { return null; }
}

export function loadExamResults(storage: Storage): ExamResult[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(examResultsKey) ?? '[]');
    return Array.isArray(value) ? value.filter((item): item is ExamResult => item && typeof item.startedAt === 'number' && typeof item.completedAt === 'number' && typeof item.correct === 'number' && typeof item.score === 'number' && Array.isArray(item.answers) && item.answers.length === 80) : [];
  } catch { return []; }
}
