import { describe, expect, it } from 'vitest';
import { b11Question } from './question';
import { validateWiring } from './validate';
import type { Wire } from './types';

const wire = (from: string, to: string): Wire => ({ id: `${from}-${to}`, from, to, color: 'red', createdAt: 1 });
const reference = b11Question.referenceNets.flatMap((net) => net.slice(1).map((pin) => wire(net[0], pin)));

describe('wiring diagnostics', () => {
  it('accepts the reference topology in any wire direction', () => {
    expect(validateWiring(b11Question, reference.map((item) => ({ ...item, from: item.to, to: item.from })))).toEqual([]);
  });
  it('accepts a different branch arrangement within a reference net', () => {
    const changed = reference.filter((item) => !(item.from === 'stop.2' && item.to === 'reverse.1'));
    changed.push(wire('forward.1', 'reverse.1'));
    expect(validateWiring(b11Question, changed)).toEqual([]);
  });
  it('reports an incomplete net', () => {
    expect(validateWiring(b11Question, reference.slice(1)).some((item) => item.kind === 'structure')).toBe(true);
  });
  it('puts a phase short ahead of missing-wire issues', () => {
    const result = validateWiring(b11Question, [wire('nfb.T1', 'nfb.T2')]);
    expect(result[0].kind).toBe('danger');
  });
  it('rejects an extra connection between distinct nets', () => {
    expect(validateWiring(b11Question, [...reference, wire('mcf.A1', 'mcr.A1')]).length).toBeGreaterThan(0);
  });
});
