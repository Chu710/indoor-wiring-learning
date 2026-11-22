import { describe, expect, it } from 'vitest';
import { b11Question } from '../b11/question';
import { getConnectedNets as getLegacyConnectedNets } from '../b11/graph';
import type { Wire } from './types';
import { getConnectedNets } from './graph';

describe('shared practical graph', () => {
  it('preserves the connectivity exposed by the old B11 import path', () => {
    const wires: Wire[] = [
      { id: 'w1', from: 'supply.A', to: 'nfb.L1', color: 'red', createdAt: 1 },
      { id: 'w2', from: 'nfb.L1', to: 'nfb.T1', color: 'red', createdAt: 2 },
    ];
    const normalize = (nets: ReadonlyArray<ReadonlySet<string>>) => nets
      .map((net) => [...net].sort().join('|'))
      .sort();

    expect(normalize(getConnectedNets(b11Question, wires)))
      .toEqual(normalize(getLegacyConnectedNets(b11Question, wires)));
  });
});
