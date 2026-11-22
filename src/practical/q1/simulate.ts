export type WaterLevel = 'low' | 'middle' | 'high';
export type SourceLevel = 'dry' | 'allowed' | 'full';
export type LiquidLevelAction =
  | 'manual' | 'automatic' | 'start' | 'stop' | 'silence'
  | 'tank-low' | 'tank-middle' | 'tank-high'
  | 'source-dry' | 'source-allowed' | 'source-full'
  | 'trip' | 'reset' | 'release';

export interface LiquidLevelState {
  mode: 'manual' | 'automatic';
  tank: WaterLevel;
  source: SourceLevel;
  contactor: boolean;
  motor: boolean;
  alarm: boolean;
  alarmSilenced: boolean;
  overloaded: boolean;
  lamps: { green: boolean; red: boolean; yellow: boolean };
  tested: LiquidLevelAction[];
}

export const initialLiquidLevelState: LiquidLevelState = {
  mode: 'manual', tank: 'middle', source: 'allowed',
  contactor: false, motor: false, alarm: false, alarmSilenced: false,
  overloaded: false, lamps: { green: true, red: false, yellow: false }, tested: [],
};

function withOutputs(state: Omit<LiquidLevelState, 'motor' | 'alarm' | 'lamps'>): LiquidLevelState {
  const contactor = state.overloaded || state.source === 'dry' ? false : state.contactor;
  return {
    ...state,
    contactor,
    motor: contactor,
    alarm: state.source === 'dry' && !state.alarmSilenced,
    lamps: { green: !contactor, red: contactor, yellow: state.overloaded },
  };
}

function remember(state: LiquidLevelState, action: LiquidLevelAction, observed: boolean): LiquidLevelState {
  if (!observed || state.tested.includes(action)) return state;
  return { ...state, tested: [...state.tested, action] };
}

export function nextLiquidLevelState(state: LiquidLevelState, action: LiquidLevelAction): LiquidLevelState {
  let next = { ...state, tested: [...state.tested] };
  switch (action) {
    case 'manual':
      next = { ...next, mode: 'manual', contactor: false };
      break;
    case 'automatic':
      next = { ...next, mode: 'automatic', contactor: next.tank === 'low' && next.source !== 'dry' && !next.overloaded };
      break;
    case 'start':
      if (next.mode === 'manual' && next.source !== 'dry' && !next.overloaded) next = { ...next, contactor: true };
      break;
    case 'stop':
      next = { ...next, contactor: false };
      break;
    case 'tank-low':
      next = { ...next, tank: 'low', contactor: next.mode === 'automatic' && next.source !== 'dry' && !next.overloaded ? true : next.contactor };
      break;
    case 'tank-middle':
      next = { ...next, tank: 'middle' };
      break;
    case 'tank-high':
      next = { ...next, tank: 'high', contactor: next.mode === 'automatic' ? false : next.contactor };
      break;
    case 'source-dry':
      next = { ...next, source: 'dry', contactor: false, alarmSilenced: false };
      break;
    case 'source-allowed':
    case 'source-full': {
      const source = action === 'source-allowed' ? 'allowed' : 'full';
      next = { ...next, source, alarmSilenced: false, contactor: next.mode === 'automatic' && next.tank === 'low' && !next.overloaded ? true : next.contactor };
      break;
    }
    case 'silence':
      if (next.source === 'dry') next = { ...next, alarmSilenced: true };
      break;
    case 'trip':
      next = { ...next, overloaded: true, contactor: false };
      break;
    case 'reset':
      next = { ...next, overloaded: false, contactor: false };
      break;
    case 'release':
      break;
  }
  const derived = withOutputs(next);
  const observed = JSON.stringify({ ...state, tested: [] }) !== JSON.stringify({ ...derived, tested: [] });
  return remember(derived, action, observed && action !== 'release');
}
