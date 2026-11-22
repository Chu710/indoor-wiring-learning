import { nextWiredMotorState } from '../b11/circuit';
import { initialMotorState, type MotorAction, type MotorState } from '../b11/simulate';
import { nextWiredLiquidLevelState } from './q1/circuit';
import { initialLiquidLevelState, type LiquidLevelAction, type LiquidLevelState } from './q1/simulate';
import type { PracticalQuestion, Wire } from './types';

export type PracticalSimulation =
  | { kind: 'liquid-level'; state: LiquidLevelState }
  | { kind: 'reverse-motor'; state: MotorState };
export type PracticalSimulationAction = LiquidLevelAction | MotorAction;

export function initialPracticalSimulation(question: PracticalQuestion): PracticalSimulation {
  return question.simulatorKind === 'liquid-level'
    ? { kind: 'liquid-level', state: initialLiquidLevelState }
    : { kind: 'reverse-motor', state: initialMotorState };
}

export function nextPracticalSimulation(simulation: PracticalSimulation, action: PracticalSimulationAction, question: PracticalQuestion, wires: Wire[]): PracticalSimulation {
  if (simulation.kind === 'liquid-level' && question.simulatorKind === 'liquid-level') {
    return { kind: 'liquid-level', state: nextWiredLiquidLevelState(simulation.state, action as LiquidLevelAction, question, wires) };
  }
  if (simulation.kind === 'reverse-motor' && question.simulatorKind === 'reverse-motor') {
    return { kind: 'reverse-motor', state: nextWiredMotorState(simulation.state, action as MotorAction, question, wires) };
  }
  return initialPracticalSimulation(question);
}
