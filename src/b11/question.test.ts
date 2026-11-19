import { describe, expect, it } from 'vitest';
import { b11Question, validateQuestion } from './question';

describe('B11 question fixture', () => {
  it('contains the single-phase forward and reverse control components', () => {
    expect(b11Question.title).toContain('單相');
    expect(b11Question.parts.map((part) => part.id)).toEqual(expect.arrayContaining([
      'nfb', 'pf-a', 'pf-b', 'mcf', 'mcr', 'thry', 'stop', 'forward', 'reverse', 'motor', 'lamp-f', 'lamp-r', 'lamp-g', 'buzzer',
    ]));
  });

  it('has unique terminal identifiers and no dangling net references', () => {
    expect(validateQuestion(b11Question)).toEqual([]);
  });

  it('rejects a terminal assigned to conflicting reference nets', () => {
    const altered = {
      ...b11Question,
      referenceNets: [...b11Question.referenceNets, ['supply.A', 'motor.U1']],
    };
    expect(validateQuestion(altered)).toContain('端子出現在不同參考節點：supply.A');
  });
  it('includes every displayed motor terminal in the exercise topology', () => {
    const referenced = new Set(b11Question.referenceNets.flat());
    expect(b11Question.parts.find((part) => part.id === 'motor')?.terminals.every((pin) => referenced.has(pin.id))).toBe(true);
  });
});
