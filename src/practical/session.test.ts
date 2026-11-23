import { describe, expect, it } from 'vitest';
import type { PracticalQuestionId } from './types';
import {
  appendQuestionRecord,
  clearQuestionDraft,
  draftKey,
  loadQuestionDraft,
  loadQuestionRecords,
  saveQuestionDraft,
} from './session';

const q1 = 'b11-q1-liquid-level' as const;
const q2 = 'b11-q2-internal-wireway-v5' as const;
const q3 = 'b11-q3-motor-fault-alarm' as const;

const makeStorage = (): Storage => {
  const values = new Map<string, string>();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: (key) => { values.delete(key); }, clear: () => values.clear(), key: (index) => [...values.keys()][index] ?? null, get length() { return values.size; } };
};

const draft = (questionId: PracticalQuestionId, startedAt: number) => ({
  questionId, startedAt, wires: [], positions: {}, checkCount: 0,
  errorCounts: { danger: 0, structure: 0, function: 0 }, hintCount: 0,
});

describe('per-question practical sessions', () => {
  it('stores, restores, and clears three drafts independently', () => {
    const storage = makeStorage();
    expect(saveQuestionDraft(storage, draft(q1, 100))).toBe(true);
    expect(saveQuestionDraft(storage, draft(q2, 200))).toBe(true);
    expect(saveQuestionDraft(storage, draft(q3, 300))).toBe(true);

    expect(loadQuestionDraft(storage, q1)?.startedAt).toBe(100);
    expect(loadQuestionDraft(storage, q2)?.startedAt).toBe(200);
    expect(loadQuestionDraft(storage, q3)?.startedAt).toBe(300);
    clearQuestionDraft(storage, q1);
    expect(loadQuestionDraft(storage, q1)).toBeNull();
    expect(loadQuestionDraft(storage, q2)?.startedAt).toBe(200);
    expect(loadQuestionDraft(storage, q3)?.startedAt).toBe(300);
  });

  it('filters completed records by question', () => {
    const storage = makeStorage();
    expect(appendQuestionRecord(storage, { ...draft(q1, 1), completedAt: 10, completed: true, simulationResults: ['manual'] })).toBe(true);
    expect(appendQuestionRecord(storage, { ...draft(q2, 2), completedAt: 20, completed: true, simulationResults: ['forward'] })).toBe(true);
    expect(appendQuestionRecord(storage, { ...draft(q3, 3), completedAt: 30, completed: true, simulationResults: ['trip'] })).toBe(true);

    expect(loadQuestionRecords(storage, q1).map((record) => record.completedAt)).toEqual([10]);
    expect(loadQuestionRecords(storage, q2).map((record) => record.completedAt)).toEqual([20]);
    expect(loadQuestionRecords(storage, q3).map((record) => record.completedAt)).toEqual([30]);
  });

  it('migrates a valid historical second-question draft without deleting the original', () => {
    const storage = makeStorage();
    const old = { ...draft(q2, 300), questionId: 'b11-q2-motor-control' };
    storage.setItem('b11-draft-v1', JSON.stringify(old));

    expect(loadQuestionDraft(storage, q2)).toEqual({ ...old, questionId: q2 });
    expect(JSON.parse(storage.getItem(draftKey(q2))!).questionId).toBe(q2);
    expect(storage.getItem('b11-draft-v1')).toBe(JSON.stringify(old));
  });

  it('migrates valid legacy records once and normalizes their question ID', () => {
    const storage = makeStorage();
    const oldRecord = { ...draft(q2, 3), questionId: 'b11-q2-schematic-v3', completedAt: 30, completed: true, simulationResults: ['stop'] };
    storage.setItem('b11-records-v1', JSON.stringify([oldRecord]));

    expect(loadQuestionRecords(storage, q2)).toEqual([{ ...oldRecord, questionId: q2 }]);
    expect(loadQuestionRecords(storage, q2)).toHaveLength(1);
  });

  it('rejects malformed, unknown, and cross-question drafts', () => {
    const storage = makeStorage();
    storage.setItem(draftKey(q1), JSON.stringify({ ...draft(q1, 1), wires: [null] }));
    storage.setItem(draftKey(q2), JSON.stringify({ ...draft(q1, 2), questionId: q1 }));

    expect(loadQuestionDraft(storage, q1)).toBeNull();
    expect(loadQuestionDraft(storage, q2)).toBeNull();
    expect(loadQuestionDraft(storage, 'unknown' as PracticalQuestionId)).toBeNull();
  });

  it('does not load a corrupt first-question draft into the second question', () => {
    const storage = makeStorage();
    storage.setItem(draftKey(q1), '{broken');
    expect(loadQuestionDraft(storage, q2)).toBeNull();
    expect(storage.getItem(draftKey(q1))).toBe('{broken');
  });
});
