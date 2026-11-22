import { getConnectedNets } from '../graph';
import type { PracticalQuestion, Wire } from '../types';
import { nextLiquidLevelState, type LiquidLevelAction, type LiquidLevelState } from './simulate';

function inspectGraph(question: PracticalQuestion, wires: Wire[]) {
  const groups = getConnectedNets(question, wires);
  const group = new Map<string, number>();
  groups.forEach((net, index) => net.forEach((terminal) => group.set(terminal, index)));
  const joined = (a: string, b: string) => group.get(a) !== undefined && group.get(a) === group.get(b);
  const complete = question.referenceNets.every((net) => net.every((terminal) => joined(net[0], terminal)));
  const dangerous = question.dangerPairs.some(([a, b]) => joined(a, b));
  return { complete, dangerous };
}

function deenergized(state: LiquidLevelState): LiquidLevelState {
  return {
    ...state,
    contactor: false,
    motor: false,
    lamps: { green: true, red: false, yellow: state.overloaded },
  };
}

export function nextWiredLiquidLevelState(state: LiquidLevelState, action: LiquidLevelAction, question: PracticalQuestion, wires: Wire[]): LiquidLevelState {
  const graph = inspectGraph(question, wires);
  if (!graph.complete || graph.dangerous) return deenergized(state);
  return nextLiquidLevelState(state, action);
}
