import type { PracticalQuestionId, Wire } from './types';

const recordsKey = 'practical-records-v2';
const legacyDraftKey = 'b11-draft-v1';
const legacyRecordsKey = 'b11-records-v1';
const q2Aliases = new Set(['b11-q2-internal-wireway-v5', 'b11-q2-motor-control', 'b11-q2-control-circuit-v2', 'b11-q2-schematic-v3']);
const knownQuestionIds = new Set<PracticalQuestionId>(['b11-q1-liquid-level', 'b11-q2-internal-wireway-v5']);

export interface Draft {
  questionId: PracticalQuestionId;
  startedAt: number;
  wires: Wire[];
  positions: Record<string, { x: number; y: number }>;
  checkCount: number;
  errorCounts: { danger: number; structure: number; function: number };
  hintCount: number;
}

export interface PracticeRecord extends Draft {
  completedAt: number;
  completed: boolean;
  simulationResults: string[];
}

export function draftKey(id: PracticalQuestionId): string {
  return `practical-draft-v2:${id}`;
}

function isWire(value: unknown): value is Wire {
  if (!value || typeof value !== 'object') return false;
  const wire = value as Partial<Wire>;
  return typeof wire.id === 'string' && typeof wire.from === 'string' && typeof wire.to === 'string' && typeof wire.createdAt === 'number' && ['red', 'white', 'black', 'green'].includes(wire.color ?? '');
}

function parseDraft(value: unknown): (Omit<Draft, 'questionId'> & { questionId: string }) | null {
  if (!value || typeof value !== 'object') return null;
  const draft = value as Partial<Draft> & { questionId?: unknown };
  if (typeof draft.questionId !== 'string' || typeof draft.startedAt !== 'number' || !Array.isArray(draft.wires) || !draft.wires.every(isWire)) return null;
  if (!draft.positions || typeof draft.positions !== 'object' || !Object.values(draft.positions).every((point) => point && typeof point.x === 'number' && typeof point.y === 'number')) return null;
  if (typeof draft.checkCount !== 'number' || typeof draft.hintCount !== 'number' || !draft.errorCounts || ['danger', 'structure', 'function'].some((kind) => typeof draft.errorCounts?.[kind as keyof Draft['errorCounts']] !== 'number')) return null;
  return draft as Omit<Draft, 'questionId'> & { questionId: string };
}

function parseRecord(value: unknown): (Omit<PracticeRecord, 'questionId'> & { questionId: string }) | null {
  const draft = parseDraft(value);
  if (!draft || typeof (value as Partial<PracticeRecord>).completedAt !== 'number' || (value as Partial<PracticeRecord>).completed !== true || !Array.isArray((value as Partial<PracticeRecord>).simulationResults) || !(value as Partial<PracticeRecord>).simulationResults!.every((item) => typeof item === 'string')) return null;
  return value as Omit<PracticeRecord, 'questionId'> & { questionId: string };
}

function normalizeQuestionId(value: string): PracticalQuestionId | null {
  if (value === 'b11-q1-liquid-level') return value;
  if (q2Aliases.has(value)) return 'b11-q2-internal-wireway-v5';
  return null;
}

function readJson(storage: Storage, key: string): unknown {
  const raw = storage.getItem(key);
  return raw === null ? null : JSON.parse(raw);
}

export function loadQuestionDraft(storage: Storage, id: PracticalQuestionId): Draft | null {
  if (!knownQuestionIds.has(id)) return null;
  try {
    const currentRaw = storage.getItem(draftKey(id));
    if (currentRaw !== null) {
      const parsed = parseDraft(JSON.parse(currentRaw));
      return parsed?.questionId === id ? parsed as Draft : null;
    }
    if (id !== 'b11-q2-internal-wireway-v5') return null;
    const legacy = parseDraft(readJson(storage, legacyDraftKey));
    if (!legacy || normalizeQuestionId(legacy.questionId) !== id) return null;
    const migrated = { ...legacy, questionId: id } as Draft;
    storage.setItem(draftKey(id), JSON.stringify(migrated));
    return migrated;
  } catch { return null; }
}

export function saveQuestionDraft(storage: Storage, draft: Draft): boolean {
  if (!knownQuestionIds.has(draft.questionId) || !parseDraft(draft)) return false;
  try { storage.setItem(draftKey(draft.questionId), JSON.stringify(draft)); return true; } catch { return false; }
}

export function clearQuestionDraft(storage: Storage, id: PracticalQuestionId): void {
  try { storage.removeItem(draftKey(id)); } catch { /* unavailable storage is recoverable */ }
}

function loadAllRecords(storage: Storage): PracticeRecord[] | null {
  const current = storage.getItem(recordsKey);
  if (current !== null) {
    const parsed: unknown = JSON.parse(current);
    if (!Array.isArray(parsed)) return null;
    return parsed.map(parseRecord).filter((record): record is Omit<PracticeRecord, 'questionId'> & { questionId: string } => record !== null).map((record) => {
      const questionId = normalizeQuestionId(record.questionId);
      return questionId ? { ...record, questionId } as PracticeRecord : null;
    }).filter((record): record is PracticeRecord => record !== null);
  }
  const legacy: unknown = readJson(storage, legacyRecordsKey);
  if (legacy === null) return [];
  if (!Array.isArray(legacy)) return null;
  const migrated = legacy.map(parseRecord).filter((record): record is Omit<PracticeRecord, 'questionId'> & { questionId: string } => record !== null).map((record) => {
    const questionId = normalizeQuestionId(record.questionId);
    return questionId ? { ...record, questionId } as PracticeRecord : null;
  }).filter((record): record is PracticeRecord => record !== null);
  storage.setItem(recordsKey, JSON.stringify(migrated));
  return migrated;
}

export function loadQuestionRecords(storage: Storage, id: PracticalQuestionId): PracticeRecord[] {
  if (!knownQuestionIds.has(id)) return [];
  try { return (loadAllRecords(storage) ?? []).filter((record) => record.questionId === id); } catch { return []; }
}

export function appendQuestionRecord(storage: Storage, record: PracticeRecord): boolean {
  if (!knownQuestionIds.has(record.questionId) || !parseRecord(record)) return false;
  try {
    const records = loadAllRecords(storage);
    if (records === null) return false;
    storage.setItem(recordsKey, JSON.stringify([...records, record]));
    return true;
  } catch { return false; }
}
