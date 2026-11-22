export type WireColor = 'red' | 'white' | 'black' | 'green';

export interface Terminal {
  id: string;
  label: string;
  partId: string;
  x: number;
  y: number;
  allowedColors: WireColor[];
}

export interface Part {
  id: string;
  name: string;
  kind: 'supply' | 'breaker' | 'fuse' | 'contactor' | 'overload' | 'button' | 'lamp' | 'buzzer' | 'motor' | 'terminal-block' | 'earth';
  x: number;
  y: number;
  terminals: Terminal[];
}

export interface Wire {
  id: string;
  from: string;
  to: string;
  color: WireColor;
  createdAt: number;
}

export interface WiringQuestion {
  id: string;
  title: string;
  source: string;
  parts: Part[];
  referenceNets: string[][];
  fixedConnections: [string, string][];
  dangerPairs: [string, string][];
}

export interface Diagnostic {
  kind: 'danger' | 'structure' | 'function';
  message: string;
  terminals: string[];
  area: string;
  guidance: string;
}

export interface WiringSegment {
  id: string;
  title: string;
  description: string;
  netIndexes: number[];
}

export type PracticalQuestionId = 'b11-q1-liquid-level' | 'b11-q2-internal-wireway-v5';
export type SimulatorKind = 'liquid-level' | 'reverse-motor';

export interface PracticalQuestion extends WiringQuestion {
  id: PracticalQuestionId;
  number: 1 | 2;
  available: boolean;
  simulatorKind: SimulatorKind;
  schematic: { src: string; alt: string; sourceLabel: string };
  segments: WiringSegment[];
}
