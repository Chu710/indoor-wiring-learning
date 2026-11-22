import { describe, expect, it } from 'vitest';
import type { Wire } from '../types';
import { nextWiredLiquidLevelState } from './circuit';
import { b11Question1 } from './question';
import { initialLiquidLevelState } from './simulate';

const reference: Wire[] = b11Question1.referenceNets.flatMap((net, netIndex) => net.slice(1).map((to, index) => ({
  id: `q1-${netIndex}-${index}`, from: net[0], to,
  color: net.includes('earth.PE') ? 'green' : 'red', createdAt: 1,
})));
const step = (state: typeof initialLiquidLevelState, action: Parameters<typeof nextWiredLiquidLevelState>[1], wires = reference) => nextWiredLiquidLevelState(state, action, b11Question1, wires);

describe('wired liquid-level circuit', () => {
  it('runs manual and automatic actions only when the reference paths are complete', () => {
    expect(step(initialLiquidLevelState, 'start').motor).toBe(true);
    const automatic = step(step(initialLiquidLevelState, 'automatic'), 'tank-low');
    expect(automatic.motor).toBe(true);

    for (const terminal of ['pb2.1', 'thry.95', 'level.U1']) {
      const incomplete = reference.filter((wire) => wire.to !== terminal);
      expect(step(initialLiquidLevelState, 'start', incomplete).motor, terminal).toBe(false);
    }
  });

  it('never energizes an unsafe graph', () => {
    const shorted = [...reference, { id: 'short', from: 'supply.A', to: 'supply.B', color: 'red' as const, createdAt: 2 }];
    expect(step(initialLiquidLevelState, 'start', shorted)).toMatchObject({ motor: false, contactor: false });
  });

  it('keeps overload latched across unrelated actions until reset', () => {
    const tripped = step(step(initialLiquidLevelState, 'start'), 'trip');
    const afterWaterActions = step(step(tripped, 'tank-low'), 'source-full');
    expect(afterWaterActions).toMatchObject({ overloaded: true, motor: false, contactor: false });
    expect(step(afterWaterActions, 'reset')).toMatchObject({ overloaded: false, motor: false });
  });
});
