import { describe, expect, it } from 'vitest';
import { b11Question, validateQuestion } from './question';
import { horizontalWirewayCenters, routeThroughWireway, verticalWirewayCenters } from './wireway';

describe('B11 question fixture', () => {
  it('contains the single-phase forward and reverse control components', () => {
    expect(b11Question.title).toContain('單相');
    expect(b11Question.parts.map((part) => part.id)).toEqual(expect.arrayContaining([
      'nfb', 'pf-a', 'pf-b', 'mcf', 'mcr', 'thry', 'stop', 'forward', 'reverse', 'lamp-f', 'lamp-r', 'lamp-g', 'buzzer',
    ]));
  });
  it('places cabinet devices like the supplied panel photo and keeps external controls outside', () => {
    const at = (id: string) => b11Question.parts.find((part) => part.id === id)!;
    expect(at('nfb').y).toBeLessThan(at('mcf').y);
    expect(at('mcf').y).toBe(at('mcr').y);
    expect(at('tb5').x).toBeGreaterThan(at('mcr').x);
    expect(at('tb1').y).toBeGreaterThan(at('mcf').y);
    for (const id of ['stop', 'forward', 'reverse', 'lamp-f', 'lamp-r', 'lamp-g', 'buzzer', 'motor']) expect(at(id).x).toBeGreaterThanOrEqual(1000);
  });

  it('places every device inside a cell without covering the fixed wireways', () => {
    for (const part of b11Question.parts) {
      const height = Math.max(84, 60 + Math.ceil(part.terminals.length / 2) * 24);
      expect(verticalWirewayCenters.every((center) => center + 14 <= part.x || center - 14 >= part.x + 108), `${part.id} crosses a vertical wireway`).toBe(true);
      expect(horizontalWirewayCenters.every((center) => center + 16 <= part.y || center - 16 >= part.y + height), `${part.id} crosses a horizontal wireway`).toBe(true);
    }
  });

  it('routes every reference wire through internal ducts without crossing a device', () => {
    const byTerminal = new Map(b11Question.parts.flatMap((part) => part.terminals.map((pin) => [pin.id, {
      terminal: { x: part.x + pin.x, y: part.y + pin.y },
      part: { x: part.x, y: part.y },
    }] as const)));
    const crossesPart = (a: { x: number; y: number }, b: { x: number; y: number }, part: typeof b11Question.parts[number]) => {
      const height = Math.max(84, 60 + Math.ceil(part.terminals.length / 2) * 24);
      const left = part.x; const right = part.x + 108; const top = part.y; const bottom = part.y + height;
      if (a.x === b.x) return a.x > left && a.x < right && Math.max(Math.min(a.y, b.y), top) < Math.min(Math.max(a.y, b.y), bottom);
      if (a.y === b.y) return a.y > top && a.y < bottom && Math.max(Math.min(a.x, b.x), left) < Math.min(Math.max(a.x, b.x), right);
      return true;
    };
    let lane = 0;
    for (const net of b11Question.referenceNets) for (let index = 1; index < net.length; index += 1) {
      const from = byTerminal.get(net[index - 1])!; const to = byTerminal.get(net[index])!;
      const points = routeThroughWireway(from.terminal, to.terminal, from.part, to.part, lane++);
      for (let segment = 1; segment < points.length; segment += 1) {
        for (const part of b11Question.parts) {
          if ((segment === 1 && part.id === net[index - 1].split('.')[0]) || (segment === points.length - 1 && part.id === net[index].split('.')[0])) continue;
          expect(crossesPart(points[segment - 1], points[segment], part), `${net[index - 1]} → ${net[index]} crosses ${part.id}`).toBe(false);
        }
      }
    }
  });

  it('has unique terminal identifiers and no dangling net references', () => {
    expect(validateQuestion(b11Question)).toEqual([]);
  });

  it('rejects a terminal assigned to conflicting reference nets', () => {
    const altered = {
      ...b11Question,
      referenceNets: [...b11Question.referenceNets, ['supply.A', 'lamp-g.1']],
    };
    expect(validateQuestion(altered)).toContain('端子出現在不同參考節點：supply.A');
  });
  it('models three main poles, terminal blocks and protective earth from the drawing', () => {
    for (const id of ['mcf', 'mcr']) expect(b11Question.parts.find((part) => part.id === id)?.terminals.filter((pin) => /^P[123][LT]$/.test(pin.label))).toHaveLength(6);
    for (const id of ['tb5', 'tb1']) expect(b11Question.parts.find((part) => part.id === id)?.terminals).toHaveLength(7);
    expect(b11Question.referenceNets.some((net) => net.includes('earth.PE') && net.includes('motor.PE'))).toBe(true);
  });
  it('feeds the reversing pole from opposite source sides and keeps the TB5 jumper separate', () => {
    const net = (pin: string) => b11Question.referenceNets.find((group) => group.includes(pin));
    expect(net('mcf.P2L')).toContain('nfb.T1');
    expect(net('mcr.P2L')).toContain('nfb.T2');
    expect(net('mcf.P2T')).toContain('mcr.P2T');
    expect(net('tb5.5')).toEqual(expect.arrayContaining(['tb5.6', 'tb5.7']));
    expect(net('tb5.5')).not.toContain('tb5.3');
  });
});
