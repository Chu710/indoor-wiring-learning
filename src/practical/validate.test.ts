import { describe, expect, it } from 'vitest';
import { b11Question1 } from './q1/question';
import type { Wire } from './types';
import { validatePracticalWiring } from './validate';

const wire = (from: string, to: string, color: Wire['color'] = 'red'): Wire => ({ id: `${from}-${to}`, from, to, color, createdAt: 1 });
const reference: Wire[] = b11Question1.referenceNets.flatMap((net) => net.slice(1).map((terminal) => wire(net[0], terminal, net.includes('earth.PE') ? 'green' : 'red')));

describe('first-question wiring diagnostics', () => {
  it('accepts the complete official teaching topology', () => {
    expect(validatePracticalWiring(b11Question1, reference)).toEqual([]);
  });

  it.each([
    ['pb2.1', '手動控制'],
    ["source-electrodes.E2'", '給水源液位'],
    ['pb3.1', '缺水警報'],
  ])('identifies the affected function when %s is missing', (terminal, area) => {
    const result = validatePracticalWiring(b11Question1, reference.filter((item) => item.to !== terminal));
    expect(result.some((issue) => issue.kind === 'function' && issue.area === area)).toBe(true);
  });

  it('blocks an overload bypass as a danger', () => {
    const result = validatePracticalWiring(b11Question1, [...reference, wire('mc.A2', 'fuse-b.T')]);
    expect(result.some((issue) => issue.kind === 'danger' && issue.message.includes('過載'))).toBe(true);
  });

  it('blocks live-to-earth and direct source shorts before missing-wire guidance', () => {
    for (const unsafe of [wire('earth.PE', 'nfb.T1', 'green'), wire('supply.A', 'supply.B')]) {
      const result = validatePracticalWiring(b11Question1, [unsafe]);
      expect(result[0].kind).toBe('danger');
      expect(result.findIndex((issue) => issue.kind === 'danger')).toBeLessThan(result.findIndex((issue) => issue.kind !== 'danger'));
    }
  });
});
