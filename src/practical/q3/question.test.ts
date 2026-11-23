import { describe, expect, it } from 'vitest';
import { getPracticalQuestion } from '../questions';
import { b11Question3 } from './question';

describe('B11 third-question fixture', () => {
  it('contains the official fault-alarm devices with valid unique terminal references', () => {
    const required = [
      'nfb', 'fuse-a', 'fuse-b', 'mc', 'thry', 'relay-x1', 'relay-x2',
      'pb1', 'pb2', 'pb3', 'lamp-g', 'lamp-r', 'lamp-y', 'buzzer',
      'tb1', 'tb5', 'motor', 'earth',
    ];
    const terminalIds = b11Question3.parts.flatMap((part) => part.terminals.map((terminal) => terminal.id));
    const known = new Set(terminalIds);

    expect(required.every((id) => b11Question3.parts.some((part) => part.id === id))).toBe(true);
    expect(known.size).toBe(terminalIds.length);
    expect(b11Question3.referenceNets.flat().every((id) => known.has(id))).toBe(true);
    expect(b11Question3.dangerPairs.flat().every((id) => known.has(id))).toBe(true);
    expect(new Set(b11Question3.referenceNets.flat()).size).toBe(b11Question3.referenceNets.flat().length);
  });

  it('connects both motor conductors and protective earth through TB5 and TB1', () => {
    expect(b11Question3.referenceNets).toContainEqual(expect.arrayContaining(['thry.H1O', 'tb5.1', 'tb1.1', 'motor.L1']));
    expect(b11Question3.referenceNets).toContainEqual(expect.arrayContaining(['thry.H2O', 'tb5.2', 'tb1.2', 'motor.L2']));
    expect(b11Question3.referenceNets).toContainEqual(expect.arrayContaining(['earth.PE', 'tb5.PE', 'tb1.PE', 'motor.PE']));
  });

  it('uses the official TH-RY changeover and X1/X2 alarm contact sequence', () => {
    const terminals = new Set(b11Question3.parts.flatMap((part) => part.terminals.map((terminal) => terminal.id)));
    expect(terminals.has('thry.98')).toBe(true);
    expect(terminals.has('relay-x2.23')).toBe(true);
    expect(terminals.has('relay-x2.24')).toBe(true);
    expect(b11Question3.referenceNets).toContainEqual(expect.arrayContaining(['relay-x1.A2', 'thry.98']));
    expect(b11Question3.referenceNets).toContainEqual(expect.arrayContaining(['relay-x1.14', 'relay-x2.13']));
    expect(b11Question3.referenceNets).toContainEqual(expect.arrayContaining(['relay-x2.14', 'buzzer.1']));
    expect(b11Question3.referenceNets).toContainEqual(expect.arrayContaining(['relay-x2.22', 'relay-x1.23']));
    expect(b11Question3.referenceNets).toContainEqual(expect.arrayContaining(['mc.22', 'lamp-g.1']));
  });

  it('is available from the practical registry with five guided segments', () => {
    expect(getPracticalQuestion('b11-q3-motor-fault-alarm')).toBe(b11Question3);
    expect(b11Question3).toMatchObject({ number: 3, available: true, simulatorKind: 'fault-alarm' });
    expect(b11Question3.segments.map((segment) => segment.id)).toEqual(['power', 'start-stop', 'overload', 'alarm', 'load']);
  });
});
