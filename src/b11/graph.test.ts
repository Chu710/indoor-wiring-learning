import { describe, expect, it } from 'vitest';
import { b11Question } from './question';
import { getConnectedNets } from './graph';
import type { Wire } from './types';

const wire = (from: string, to: string): Wire => ({ id: `${from}-${to}`, from, to, color: 'red', createdAt: 1 });

describe('connection graph', () => {
  it('treats wire direction and branching as the same electrical node', () => {
    const nets = getConnectedNets(b11Question, [wire('nfb.L1', 'supply.A'), wire('nfb.L1', 'stop.1')]);
    expect(nets.find((net) => net.has('supply.A'))).toEqual(new Set(['supply.A', 'nfb.L1', 'stop.1']));
  });
});
