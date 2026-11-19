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
  kind: 'supply' | 'breaker' | 'fuse' | 'contactor' | 'overload' | 'button' | 'lamp' | 'buzzer' | 'motor';
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

export interface B11Question {
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
