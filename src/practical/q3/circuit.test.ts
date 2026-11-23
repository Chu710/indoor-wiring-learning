import { describe, expect, it } from 'vitest';
import type { Wire } from '../types';
import { nextWiredFaultAlarmState } from './circuit';
import { b11Question3 } from './question';
import { initialFaultAlarmState } from './simulate';

const reference: Wire[] = b11Question3.referenceNets.flatMap((net, netIndex) => net.slice(1).map((to, index) => ({
  id: `q3-${netIndex}-${index}`,
  from: net[0],
  to,
  color: net.includes('earth.PE') ? 'green' : 'red',
  createdAt: 1,
})));
const step = (state: typeof initialFaultAlarmState, action: Parameters<typeof nextWiredFaultAlarmState>[1], wires = reference) =>
  nextWiredFaultAlarmState(state, action, b11Question3, wires);

describe('wired third-question fault alarm circuit', () => {
  it('runs only when the complete reference wiring is present', () => {
    expect(step(initialFaultAlarmState, 'start')).toMatchObject({ motor: true, contactor: true });

    const missingStopPath = reference.filter((wire) => wire.to !== 'pb2.1');
    expect(step(initialFaultAlarmState, 'start', missingStopPath)).toMatchObject({ motor: false, contactor: false });
  });

  it('never energizes a dangerous graph', () => {
    const shorted = [...reference, { id: 'short', from: 'supply.A', to: 'supply.B', color: 'red' as const, createdAt: 2 }];
    expect(step(initialFaultAlarmState, 'start', shorted)).toMatchObject({ motor: false, contactor: false });
  });

  it('blocks energizing when an extra wire bypasses the TH-RY control contact', () => {
    const bypassed = [...reference, { id: 'bypass', from: 'thry.95', to: 'thry.96', color: 'red' as const, createdAt: 2 }];
    expect(step(initialFaultAlarmState, 'start', bypassed)).toMatchObject({ motor: false, contactor: false });
  });

  it('preserves overload, alarm acknowledgement, and reset behavior', () => {
    const tripped = step(step(initialFaultAlarmState, 'start'), 'trip');
    expect(tripped).toMatchObject({ overloaded: true, buzzer: true, motor: false });
    expect(step(tripped, 'silence')).toMatchObject({ overloaded: true, acknowledged: true, buzzer: false, lamps: { yellow: true } });
    expect(step(step(tripped, 'silence'), 'reset')).toMatchObject({ overloaded: false, acknowledged: false, lamps: { green: true, yellow: false } });
  });
});
