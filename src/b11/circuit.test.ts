import { describe, expect, it } from 'vitest';
import { b11Question } from './question';
import { initialMotorState } from './simulate';
import { nextWiredMotorState } from './circuit';
import type { Wire } from './types';

const reference: Wire[] = b11Question.referenceNets.flatMap((net) => net.slice(1).map((to, index) => ({
  id: `${net[0]}-${index}`, from: net[0], to,
  color: net.includes('earth.PE') ? 'green' : 'red', createdAt: 1,
})));
const step = (state: typeof initialMotorState, action: Parameters<typeof nextWiredMotorState>[1], wires = reference) => nextWiredMotorState(state, action, b11Question, wires);

describe('B11 wired circuit', () => {
  it('self-holds forward, blocks reverse and stops', () => {
    const forward = step(initialMotorState, 'forward');
    expect(forward).toMatchObject({ direction: 'forward', mcf: true, mcr: false, lamps: { forward: true, reverse: false, stopped: false } });
    expect(step(forward, 'reverse').direction).toBe('forward');
    expect(step(forward, 'interlock').tested).toContain('interlock');
    const stopped = step(forward, 'stop');
    expect(stopped).toMatchObject({ direction: 'stopped', mcf: false, mcr: false, lamps: { stopped: true } });
    expect(step(stopped, 'reverse').direction).toBe('reverse');
  });

  it('trips, sounds the buzzer and does not restart on reset', () => {
    const running = step(initialMotorState, 'reverse');
    const tripped = step(running, 'trip');
    expect(tripped).toMatchObject({ direction: 'stopped', overloaded: true, buzzer: true, lamps: { stopped: true } });
    expect(step(tripped, 'forward').direction).toBe('stopped');
    const reset = step(tripped, 'reset');
    expect(reset).toMatchObject({ direction: 'stopped', overloaded: false, buzzer: false, lamps: { stopped: true } });
  });

  it('cannot energize the motor when a required main wire is absent', () => {
    const missingMotorLead = reference.filter((wire) => wire.to !== 'motor.4');
    expect(step(initialMotorState, 'forward', missingMotorLead).direction).toBe('stopped');
  });
  it('cannot energize the coil when its control return wire is absent', () => {
    const missingControlReturn = reference.filter((wire) => wire.to !== 'thry.95');
    expect(step(initialMotorState, 'forward', missingControlReturn).mcf).toBe(false);
  });
});
