import type { Wire } from './types';
import type { MotorAction } from './simulate';

const draftKey = 'b11-draft-v1';
const recordsKey = 'b11-records-v1';
const corruptDraftKey = 'b11-draft-corrupt-v1';

export interface Draft {
  questionId: string;
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
  simulationResults: MotorAction[];
}

export function loadDraft(storage: Storage): Draft | null {
  try {
    const raw = storage.getItem(draftKey);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const value = parsed as Partial<Draft>;
    if (typeof value.questionId !== 'string' || typeof value.startedAt !== 'number' || !Array.isArray(value.wires) || !value.positions || typeof value.positions !== 'object') return null;
    if (!value.wires.every((wire) => wire && typeof wire.id === 'string' && typeof wire.from === 'string' && typeof wire.to === 'string' && ['red', 'white', 'black', 'green'].includes(wire.color))) return null;
    if (!Object.values(value.positions).every((point) => point && typeof point.x === 'number' && typeof point.y === 'number')) return null;
    if (typeof value.checkCount !== 'number' || typeof value.hintCount !== 'number' || !value.errorCounts || ['danger', 'structure', 'function'].some((kind) => typeof value.errorCounts?.[kind as keyof Draft['errorCounts']] !== 'number')) return null;
    return value as Draft;
  } catch { return null; }
}

export function saveDraft(storage: Storage, draft: Draft): boolean {
  try {
    const existing = storage.getItem(draftKey);
    if (existing) {
      try { loadDraft(storage); if (loadDraft(storage) === null) storage.setItem(corruptDraftKey, existing); } catch { return false; }
    }
    storage.setItem(draftKey, JSON.stringify(draft)); return true;
  } catch { return false; }
}

export function clearDraft(storage: Storage): boolean {
  try { storage.removeItem(draftKey); return true; } catch { return false; }
}

export function loadRecords(storage: Storage): PracticeRecord[] {
  try { const value: unknown = JSON.parse(storage.getItem(recordsKey) ?? '[]'); return Array.isArray(value) ? value as PracticeRecord[] : []; } catch { return []; }
}

export function appendRecord(storage: Storage, record: PracticeRecord): boolean {
  try {
    const raw = storage.getItem(recordsKey);
    const current: unknown = raw === null ? [] : JSON.parse(raw);
    if (!Array.isArray(current)) return false;
    storage.setItem(recordsKey, JSON.stringify([...current, record])); return true;
  } catch { return false; }
}

export function getBrowserStorage(accessor: () => Storage): Storage | null {
  try { return accessor(); } catch { return null; }
}
