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
  lamps: { forward: false, reverse: false, stopped: false }, buzzer: false, tested: [],
};
