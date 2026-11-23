import { getConnectedNets } from '../graph';
import { validatePracticalWiring } from '../validate';
import type { PracticalQuestion, Wire } from '../types';
import { nextFaultAlarmState, type FaultAlarmAction, type FaultAlarmState } from './simulate';

function inspectGraph(question: PracticalQuestion, wires: Wire[]) {
  const groups = getConnectedNets(question, wires);
  const group = new Map<string, number>();
  groups.forEach((net, index) => net.forEach((terminal) => group.set(terminal, index)));
  const joined = (a: string, b: string) => group.get(a) !== undefined && group.get(a) === group.get(b);
  const complete = question.referenceNets.every((net) => net.every((terminal) => joined(net[0], terminal)));
  const dangerous = validatePracticalWiring(question, wires).length > 0;
  return { complete, dangerous };
}

function deenergized(state: FaultAlarmState): FaultAlarmState {
  return {
    ...state,
    contactor: false,
    motor: false,
    lamps: state.overloaded && state.acknowledged
      ? { green: true, red: false, yellow: true }
      : { green: true, red: false, yellow: false },
    buzzer: state.overloaded && !state.acknowledged,
  };
}

export function nextWiredFaultAlarmState(
  state: FaultAlarmState,
  action: FaultAlarmAction,
  question: PracticalQuestion,
  wires: Wire[],
): FaultAlarmState {
  const graph = inspectGraph(question, wires);
  if (!graph.complete || graph.dangerous) return deenergized(state);
  return nextFaultAlarmState(state, action);
}
