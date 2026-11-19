import { describe, expect, it } from 'vitest';
import { canEnergize, initialMotorState, nextMotorState } from './simulate';

describe('motor control simulation', () => {
  it('holds forward after releasing the start button and stops on OFF', () => {
    const running = nextMotorState(initialMotorState, 'forward');
    expect(nextMotorState(running, 'release').direction).toBe('forward');
    expect(nextMotorState(running, 'stop').direction).toBe('stopped');
  });
  it('does not run forward and reverse contactors together', () => {
    const running = nextMotorState(initialMotorState, 'forward');
    const blocked = nextMotorState(running, 'reverse');
    expect(blocked.direction).toBe('forward');
    expect(blocked.mcf && blocked.mcr).toBe(false);
  });
  it('locks out after overload until reset', () => {
    const tripped = nextMotorState(nextMotorState(initialMotorState, 'reverse'), 'trip');
    expect(tripped.direction).toBe('stopped');
    expect(nextMotorState(tripped, 'forward').direction).toBe('stopped');
    expect(nextMotorState(nextMotorState(tripped, 'reset'), 'forward').direction).toBe('forward');
  });
  it('blocks power when wiring diagnostics exist', () => {
    expect(canEnergize([{ kind: 'danger', message: '短路', terminals: [], area: '電源', guidance: '' }])).toBe(false);
    expect(canEnergize([])).toBe(true);
  });
  it('records an interlock test only when the opposite start is blocked', () => {
    expect(nextMotorState(initialMotorState, 'interlock').tested).not.toContain('interlock');
    const running = nextMotorState(initialMotorState, 'forward');
    const blocked = nextMotorState(running, 'interlock');
    expect(blocked.direction).toBe('forward');
    expect(blocked.tested).toContain('interlock');
  });
});
