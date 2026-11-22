import { describe, expect, it } from 'vitest';
import { routeThroughWireway, horizontalWirewayCenters, verticalWirewayCenters } from '../../b11/wireway';
import { getPracticalQuestion } from '../questions';
import { b11Question1 } from './question';

const partHeight = (terminalCount: number) => Math.max(84, 60 + Math.ceil(terminalCount / 2) * 24);

function overlaps(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function segmentIntersectsRect(a: { x: number; y: number }, b: { x: number; y: number }, rect: { x: number; y: number; width: number; height: number }) {
  if (a.x === b.x) return a.x > rect.x && a.x < rect.x + rect.width && Math.max(Math.min(a.y, b.y), rect.y) < Math.min(Math.max(a.y, b.y), rect.y + rect.height);
  return a.y > rect.y && a.y < rect.y + rect.height && Math.max(Math.min(a.x, b.x), rect.x) < Math.min(Math.max(a.x, b.x), rect.x + rect.width);
}

describe('B11 first-question fixture', () => {
  it('contains the required official teaching devices and valid terminal references', () => {
    const required = ['mc', 'thry', 'level', 'cos', 'pb1', 'pb2', 'pb3', 'lamp-g', 'lamp-r', 'lamp-y', 'buzzer', 'tank-electrodes', 'source-electrodes', 'tb1', 'tb4', 'tb6', 'tb9', 'motor', 'earth'];
    const ids = b11Question1.parts.flatMap((part) => part.terminals.map((terminal) => terminal.id));
    const known = new Set(ids);

    expect(required.every((id) => b11Question1.parts.some((part) => part.id === id))).toBe(true);
    expect(known.size).toBe(ids.length);
    expect(b11Question1.referenceNets.flat().every((id) => known.has(id))).toBe(true);
    expect(b11Question1.fixedConnections.flat().every((id) => known.has(id))).toBe(true);
    expect(b11Question1.dangerPairs.flat().every((id) => known.has(id))).toBe(true);
    const referenced = b11Question1.referenceNets.flat();
    expect(new Set(referenced).size, 'a terminal cannot belong to two electrical nets').toBe(referenced.length);
  });

  it('connects protective earth through terminal blocks to the motor', () => {
    expect(b11Question1.referenceNets).toContainEqual(expect.arrayContaining([
      'earth.PE', 'tb9.PE', 'tb1.PE', 'motor.PE',
    ]));
  });

  it('replaces the hidden registry stub with the real available fixture', () => {
    expect(getPracticalQuestion('b11-q1-liquid-level')).toBe(b11Question1);
    expect(b11Question1).toMatchObject({ available: true, number: 1, simulatorKind: 'liquid-level' });
    expect(b11Question1.segments.map((segment) => segment.id)).toEqual(['power', 'manual', 'automatic', 'alarm', 'load']);
  });

  it('keeps every device inside a cell instead of covering a fixed wireway', () => {
    const wireways = [
      ...verticalWirewayCenters.map((x) => ({ x: x - 14, y: 24, width: 28, height: 847 })),
      ...horizontalWirewayCenters.map((y) => ({ x: 12, y: y - 16, width: 1356, height: 32 })),
    ];

    for (const part of b11Question1.parts) {
      const rect = { x: part.x, y: part.y, width: 108, height: partHeight(part.terminals.length) };
      expect(wireways.some((wireway) => overlaps(rect, wireway)), part.id).toBe(false);
    }
  });

  it('routes reference leads through internal ducts without crossing another device or cabinet frame', () => {
    const terminal = new Map(b11Question1.parts.flatMap((part) => part.terminals.map((pin) => [pin.id, { point: { x: part.x + pin.x, y: part.y + pin.y }, part }] as const)));
    let lane = 0;

    for (const net of b11Question1.referenceNets) {
      for (let index = 1; index < net.length; index += 1) {
        const from = terminal.get(net[index - 1])!;
        const to = terminal.get(net[index])!;
        const points = routeThroughWireway(from.point, to.point, from.part, to.part, lane++);
        expect(points.every((point) => point.x > 20 && point.x < 1370 && point.y > 20 && point.y < 880)).toBe(true);
        for (let pointIndex = 1; pointIndex < points.length; pointIndex += 1) {
          for (const part of b11Question1.parts.filter((item) => item.id !== from.part.id && item.id !== to.part.id)) {
            const rect = { x: part.x, y: part.y, width: 108, height: partHeight(part.terminals.length) };
            expect(segmentIntersectsRect(points[pointIndex - 1], points[pointIndex], rect), `${net[index - 1]} → ${net[index]} crosses ${part.id}`).toBe(false);
          }
        }
      }
    }
  });
});
