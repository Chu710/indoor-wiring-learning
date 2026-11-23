import { describe, expect, it } from 'vitest';
import { getPracticalQuestion, practicalQuestions } from './questions';

describe('practical question registry', () => {
  it('registers all three B11 exercises with stable unique IDs', () => {
    const ids = practicalQuestions.map((question) => question.id);

    expect(ids).toEqual([
      'b11-q1-liquid-level',
      'b11-q2-internal-wireway-v5',
      'b11-q3-motor-fault-alarm',
    ]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('exposes the implemented first question to navigation', () => {
    expect(getPracticalQuestion('b11-q1-liquid-level')).toMatchObject({
      number: 1,
      available: true,
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
