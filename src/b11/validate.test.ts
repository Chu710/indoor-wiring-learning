import { describe, expect, it } from 'vitest';
import { b11Question } from './question';
import { validateWiring } from './validate';
import { wiringSegments } from './segments';
import type { Wire } from './types';

const wire = (from: string, to: string): Wire => ({ id: `${from}-${to}`, from, to, color: ['earth.PE', 'tb5.1', 'tb1.1', 'motor.PE'].includes(from) ? 'green' : 'red', createdAt: 1 });
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
  it('rejects a live connection to earth and a non-green earth wire', () => {
    const short = validateWiring(b11Question, [wire('earth.PE', 'nfb.T1')]);
    expect(short[0].kind).toBe('danger');
    const wrongColor = validateWiring(b11Question, [{ ...wire('earth.PE', 'tb5.1'), color: 'red' }]);
    expect(wrongColor.some((issue) => issue.message.includes('綠色'))).toBe(true);
  });
  it('rejects an extra connection between distinct nets', () => {
    expect(validateWiring(b11Question, [...reference, wire('mcf.A1', 'mcr.A1')]).length).toBeGreaterThan(0);
  });
  it('checks only the selected segment nets', () => {
    const segment = wiringSegments[0];
    const stageWires = segment.netIndexes.flatMap((index) => {
      const net = b11Question.referenceNets[index];
      return net.slice(1).map((pin, offset) => wire(net[offset], pin));
    });
    expect(validateWiring(b11Question, stageWires, segment.netIndexes.map((index) => b11Question.referenceNets[index]))).toEqual([]);
  });
});
