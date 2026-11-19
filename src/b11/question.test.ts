import { describe, expect, it } from 'vitest';
import { b11Question, validateQuestion } from './question';

describe('B11 question fixture', () => {
  it('contains the single-phase forward and reverse control components', () => {
    expect(b11Question.title).toContain('單相');
    expect(b11Question.parts.map((part) => part.id)).toEqual(expect.arrayContaining([
      'nfb', 'pf-a', 'pf-b', 'mcf', 'mcr', 'thry', 'stop', 'forward', 'reverse', 'lamp-f', 'lamp-r', 'lamp-g', 'buzzer',
    ]));
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
