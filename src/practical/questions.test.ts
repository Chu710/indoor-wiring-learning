import { describe, expect, it } from 'vitest';
import { getPracticalQuestion, practicalQuestions } from './questions';

describe('practical question registry', () => {
  it('registers both B11 exercises with stable unique IDs', () => {
    const ids = practicalQuestions.map((question) => question.id);

    expect(ids).toEqual([
      'b11-q1-liquid-level',
      'b11-q2-internal-wireway-v5',
    ]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps the unfinished first question hidden from navigation', () => {
    expect(getPracticalQuestion('b11-q1-liquid-level')).toMatchObject({
      number: 1,
      available: false,
      simulatorKind: 'liquid-level',
    });
  });

  it('adapts the existing second question without changing its exercise', () => {
    const question = getPracticalQuestion('b11-q2-internal-wireway-v5');

    expect(question).toMatchObject({
      number: 2,
      available: true,
      simulatorKind: 'reverse-motor',
    });
    expect(question?.segments).toHaveLength(5);
    expect(question?.parts.some((part) => part.id === 'mcf')).toBe(true);
  });

  it('returns null for unknown question IDs', () => {
    expect(getPracticalQuestion('unknown')).toBeNull();
  });
});
