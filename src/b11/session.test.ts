import { describe, expect, it } from 'vitest';
import { appendRecord, loadDraft, saveDraft, loadRecords, clearDraft } from './session';

const makeStorage = (): Storage => {
  const values = new Map<string, string>();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: (key) => { values.delete(key); }, clear: () => values.clear(), key: (index) => [...values.keys()][index] ?? null, get length() { return values.size; } };
};

describe('local practice records', () => {
  it('restores a draft and keeps completed records after clearing it', () => {
    const storage = makeStorage();
    const draft = { questionId: 'b11-q2-motor-control', startedAt: 100, wires: [], positions: {}, checkCount: 0, errorCounts: { danger: 0, structure: 0, function: 0 }, hintCount: 0 };
    expect(saveDraft(storage, draft)).toBe(true);
    expect(loadDraft(storage)).toEqual(draft);
    expect(appendRecord(storage, { ...draft, completedAt: 200, completed: true, simulationResults: ['forward', 'stop', 'reverse', 'interlock', 'trip'] })).toBe(true);
    clearDraft(storage);
    expect(loadDraft(storage)).toBeNull();
    expect(loadRecords(storage)).toHaveLength(1);
  });
  it('treats malformed and unavailable storage as recoverable', () => {
    const storage = makeStorage();
    storage.setItem('b11-draft-v1', '{broken');
    expect(loadDraft(storage)).toBeNull();
    const unavailable = { ...storage, getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } } as Storage;
    expect(loadDraft(unavailable)).toBeNull();
    expect(saveDraft(unavailable, { questionId: 'x', startedAt: 1, wires: [], positions: {}, checkCount: 0, errorCounts: { danger: 0, structure: 0, function: 0 }, hintCount: 0 })).toBe(false);
  });
  it('preserves an earlier question draft when the exercise changes', () => {
    const storage = makeStorage();
    const oldDraft = { questionId: 'b11-q2-motor-control', startedAt: 100, wires: [], positions: {}, checkCount: 0, errorCounts: { danger: 0, structure: 0, function: 0 }, hintCount: 0 };
    const newDraft = { ...oldDraft, questionId: 'b11-q2-control-circuit-v2' };
    saveDraft(storage, oldDraft);
    expect(saveDraft(storage, newDraft)).toBe(true);
    expect(storage.getItem('b11-draft-legacy-b11-q2-motor-control')).toBe(JSON.stringify(oldDraft));
    expect(loadDraft(storage)).toEqual(newDraft);
    const finalDraft = { ...oldDraft, questionId: 'b11-q2-schematic-v3' };
    expect(saveDraft(storage, finalDraft)).toBe(true);
    expect(storage.getItem('b11-draft-legacy-b11-q2-motor-control')).toBe(JSON.stringify(oldDraft));
    expect(storage.getItem('b11-draft-legacy-b11-q2-control-circuit-v2')).toBe(JSON.stringify(newDraft));
  });
  it('does not restore malformed wire entries', () => {
    const storage = makeStorage();
    storage.setItem('b11-draft-v1', JSON.stringify({ questionId: 'b11-q2-motor-control', startedAt: 1, wires: [null], positions: {}, checkCount: 0, errorCounts: { danger: 0, structure: 0, function: 0 }, hintCount: 0 }));
    expect(loadDraft(storage)).toBeNull();
  });
  it('does not overwrite malformed completed history', () => {
    const storage = makeStorage();
    storage.setItem('b11-records-v1', '{broken');
    const record = { questionId: 'x', startedAt: 1, completedAt: 2, completed: true, wires: [], positions: {}, checkCount: 0, errorCounts: { danger: 0, structure: 0, function: 0 }, hintCount: 0, simulationResults: [] };
    expect(appendRecord(storage, record)).toBe(false);
    expect(storage.getItem('b11-records-v1')).toBe('{broken');
  });
});
