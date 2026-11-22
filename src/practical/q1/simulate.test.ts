import { describe, expect, it } from 'vitest';
import { initialLiquidLevelState, nextLiquidLevelState, type LiquidLevelAction, type LiquidLevelState } from './simulate';

const step = (state: LiquidLevelState, ...actions: LiquidLevelAction[]) => actions.reduce(nextLiquidLevelState, state);

describe('liquid-level control state machine', () => {
  it('starts, self-holds, and stops in manual mode', () => {
    const running = step(initialLiquidLevelState, 'manual', 'start', 'release');
    expect(running).toMatchObject({ mode: 'manual', contactor: true, motor: true, lamps: { green: false, red: true, yellow: false } });

    expect(step(running, 'stop', 'release')).toMatchObject({ contactor: false, motor: false, lamps: { green: true, red: false, yellow: false } });
  });

  it('starts at low tank level and stops at high tank level in automatic mode', () => {
    const running = step(initialLiquidLevelState, 'automatic', 'tank-low');
    expect(running).toMatchObject({ mode: 'automatic', tank: 'low', motor: true, contactor: true });

    const stopped = step(running, 'tank-middle', 'tank-high');
    expect(stopped).toMatchObject({ tank: 'high', motor: false, contactor: false });
  });

  it('blocks a dry-source start and immediately stops a running motor with an alarm', () => {
    const dry = step(initialLiquidLevelState, 'source-dry', 'start');
    expect(dry).toMatchObject({ source: 'dry', motor: false, contactor: false, alarm: true });

    const running = step(initialLiquidLevelState, 'start');
    expect(step(running, 'source-dry')).toMatchObject({ source: 'dry', motor: false, contactor: false, alarm: true });
  });

  it('lets PB3 silence the buzzer without clearing dry source or starting the motor', () => {
    const silenced = step(initialLiquidLevelState, 'source-dry', 'silence', 'start');
    expect(silenced).toMatchObject({ source: 'dry', alarm: false, alarmSilenced: true, motor: false, contactor: false });
  });

  it('latches overload until reset and keeps the official lamp states', () => {
    const tripped = step(initialLiquidLevelState, 'start', 'trip', 'tank-low', 'start');
    expect(tripped).toMatchObject({ overloaded: true, motor: false, contactor: false, lamps: { green: true, red: false, yellow: true } });

    const reset = step(tripped, 'reset');
    expect(reset).toMatchObject({ overloaded: false, motor: false, contactor: false, lamps: { green: true, red: false, yellow: false } });
  });
});
