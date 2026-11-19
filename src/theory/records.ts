import { motorTheoryQuestions } from './questions';

const key = 'indoor-wiring-theory-results-v1';
const draftKey = 'indoor-wiring-theory-draft-v1';

export interface TheoryDraft {
  startedAt: number;
  index: number;
  selection: number | null;
  submitted: boolean;
  answers: number[];
}

export interface TheoryResult {
  source: '007003A13';
  startedAt: number;
  completedAt: number;
  answers: number[];
  score: number;
  total: number;
}

export function loadTheoryResults(storage: Storage): TheoryResult[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(key) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is TheoryResult => item && item.source === '007003A13' && typeof item.startedAt === 'number' && typeof item.completedAt === 'number' && Array.isArray(item.answers) && item.answers.every((answer: unknown) => Number.isInteger(answer) && Number(answer) >= 0 && Number(answer) <= 3) && typeof item.score === 'number' && typeof item.total === 'number');
  } catch { return []; }
}

export function appendTheoryResult(storage: Storage, result: TheoryResult): boolean {
  try {
    const raw = storage.getItem(key);
    const parsed: unknown = raw === null ? [] : JSON.parse(raw);
    if (!Array.isArray(parsed)) return false;
    storage.setItem(key, JSON.stringify([...parsed, result]));
    return true;
  } catch { return false; }
}

export function loadTheoryDraft(storage: Storage): TheoryDraft | null {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(draftKey) ?? 'null');
    if (!parsed || typeof parsed !== 'object') return null;
    const draft = parsed as Partial<TheoryDraft>;
    if (typeof draft.startedAt !== 'number' || !Number.isInteger(draft.index) || draft.index! < 0 || draft.index! >= motorTheoryQuestions.length || typeof draft.submitted !== 'boolean' || !Array.isArray(draft.answers) || draft.answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 3) || draft.answers.length !== draft.index! + (draft.submitted ? 1 : 0) || !(draft.selection === null || Number.isInteger(draft.selection) && draft.selection! >= 0 && draft.selection! <= 3)) return null;
    return draft as TheoryDraft;
  } catch { return null; }
}

export function saveTheoryDraft(storage: Storage, draft: TheoryDraft): boolean {
  try { storage.setItem(draftKey, JSON.stringify(draft)); return true; } catch { return false; }
}

export function clearTheoryDraft(storage: Storage): boolean {
  try { storage.removeItem(draftKey); return true; } catch { return false; }
}
