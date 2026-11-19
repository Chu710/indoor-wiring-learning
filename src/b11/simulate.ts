import type { Diagnostic } from './types';

export type MotorAction = 'forward' | 'reverse' | 'release' | 'stop' | 'trip' | 'reset' | 'interlock';
export interface MotorState {
  direction: 'stopped' | 'forward' | 'reverse';
  overloaded: boolean;
  mcf: boolean;
  mcr: boolean;
  lamps: { forward: boolean; reverse: boolean; stopped: boolean };
  buzzer: boolean;
  tested: MotorAction[];
}

export const initialMotorState: MotorState = {
  direction: 'stopped', overloaded: false, mcf: false, mcr: false,
  lamps: { forward: false, reverse: false, stopped: true }, buzzer: false, tested: [],
};

export function canEnergize(diagnostics: Diagnostic[]): boolean { return diagnostics.length === 0; }

export function nextMotorState(state: MotorState, action: MotorAction): MotorState {
  let direction = state.direction;
  let overloaded = state.overloaded;
  if (action === 'trip') { direction = 'stopped'; overloaded = true; }
  if (action === 'reset') overloaded = false;
  if (action === 'stop') direction = 'stopped';
  if (!overloaded && direction === 'stopped' && (action === 'forward' || action === 'reverse')) direction = action;
  return {
    direction, overloaded, mcf: direction === 'forward', mcr: direction === 'reverse',
    lamps: { forward: direction === 'forward', reverse: direction === 'reverse', stopped: direction === 'stopped' && !overloaded },
    buzzer: overloaded,
    tested: (action === 'interlock' && state.direction === 'stopped') || state.tested.includes(action) ? state.tested : [...state.tested, action],
  };
}
