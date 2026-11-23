export type FaultAlarmAction = 'start' | 'stop' | 'trip' | 'silence' | 'reset' | 'release';

export interface FaultAlarmState {
  contactor: boolean;
  motor: boolean;
  overloaded: boolean;
  acknowledged: boolean;
  lamps: { green: boolean; red: boolean; yellow: boolean };
  buzzer: boolean;
  tested: FaultAlarmAction[];
}

export const initialFaultAlarmState: FaultAlarmState = {
  contactor: false,
  motor: false,
  overloaded: false,
  acknowledged: false,
  lamps: { green: true, red: false, yellow: false },
  buzzer: false,
  tested: [],
};

function withOutputs(state: Omit<FaultAlarmState, 'motor' | 'lamps' | 'buzzer'>): FaultAlarmState {
  const contactor = state.overloaded ? false : state.contactor;
  return {
    ...state,
    contactor,
    motor: contactor,
    lamps: state.overloaded
      ? { green: true, red: false, yellow: state.acknowledged }
      : { green: !contactor, red: contactor, yellow: false },
    buzzer: state.overloaded && !state.acknowledged,
  };
}

function remember(state: FaultAlarmState, action: FaultAlarmAction, observable: boolean): FaultAlarmState {
  if (!observable || action === 'release' || state.tested.includes(action)) return state;
  return { ...state, tested: [...state.tested, action] };
}

export function nextFaultAlarmState(state: FaultAlarmState, action: FaultAlarmAction): FaultAlarmState {
  let next = { ...state, tested: [...state.tested] };
  let observable = false;
  switch (action) {
    case 'start':
      if (!next.overloaded && !next.contactor) { next = { ...next, contactor: true }; observable = true; }
      break;
    case 'stop':
      if (next.contactor) { next = { ...next, contactor: false }; observable = true; }
      break;
    case 'trip':
      if (!next.overloaded) {
        const trippedWhileRunning = next.contactor;
        next = { ...next, overloaded: true, acknowledged: false, contactor: false };
        observable = trippedWhileRunning;
      }
      break;
    case 'silence':
      if (next.overloaded && !next.acknowledged) { next = { ...next, acknowledged: true }; observable = true; }
      break;
    case 'reset':
      if (next.overloaded) { next = { ...next, overloaded: false, acknowledged: false, contactor: false }; observable = true; }
      break;
    case 'release':
      break;
  }
  return remember(withOutputs(next), action, observable);
}
