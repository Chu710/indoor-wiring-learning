import { describe, expect, it } from 'vitest';
import {
  initialFaultAlarmState,
  nextFaultAlarmState,
  type FaultAlarmAction,
  type FaultAlarmState,
} from './simulate';

const step = (state: FaultAlarmState, ...actions: FaultAlarmAction[]) => actions.reduce(nextFaultAlarmState, state);

describe('third-question motor fault alarm', () => {
  it('starts and stops the motor with the official green and red lamp states', () => {
    const running = step(initialFaultAlarmState, 'start', 'release');
    expect(running).toMatchObject({
      contactor: true,
      motor: true,
      lamps: { green: false, red: true, yellow: false },
      buzzer: false,
    });

    expect(step(running, 'stop', 'release')).toMatchObject({
      contactor: false,
      motor: false,
      lamps: { green: true, red: false, yellow: false },
      buzzer: false,
    });
  });

  it('latches an overload alarm until PB3 acknowledges it and TH-RY is reset', () => {
    const tripped = step(initialFaultAlarmState, 'start', 'trip');
    expect(tripped).toMatchObject({
      overloaded: true,
      acknowledged: false,
      contactor: false,
      motor: false,
      lamps: { green: true, red: false, yellow: false },
      buzzer: true,
    });

    const acknowledged = step(tripped, 'silence', 'start');
    expect(acknowledged).toMatchObject({
      overloaded: true,
      acknowledged: true,
      contactor: false,
      motor: false,
      lamps: { green: true, red: false, yellow: true },
      buzzer: false,
    });

    expect(step(acknowledged, 'reset')).toMatchObject({
      overloaded: false,
      acknowledged: false,
      contactor: false,
      motor: false,
      lamps: { green: true, red: false, yellow: false },
      buzzer: false,
    });
  });

  it('records only observable operating checks', () => {
    const state = step(initialFaultAlarmState, 'start', 'release', 'stop', 'start', 'trip', 'silence', 'reset');
    expect(state.tested).toEqual(['start', 'stop', 'trip', 'silence', 'reset']);
  });

  it('does not count blocked or ineffective controls as completed tests', () => {
    const state = step(initialFaultAlarmState, 'trip', 'start', 'stop', 'silence', 'reset');
    expect(state.tested).toEqual(['silence', 'reset']);
  });

  it('does not award the overload test unless the motor was running when it tripped', () => {
    const state = step(initialFaultAlarmState, 'start', 'stop', 'trip', 'silence', 'reset');
    expect(state.tested).toEqual(['start', 'stop', 'silence', 'reset']);
  });
});
