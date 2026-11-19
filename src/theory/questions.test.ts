import { describe, expect, it } from 'vitest';
import { motorTheoryQuestions, scoreTheory } from './questions';

describe('motor theory pilot', () => {
  it('keeps source references and answer choices complete', () => {
    expect(motorTheoryQuestions).toHaveLength(8);
    expect(new Set(motorTheoryQuestions.map((question) => question.sourceNumber)).size).toBe(8);
    for (const question of motorTheoryQuestions) {
      expect(question.sourcePage).toBeGreaterThan(0);
      expect(question.choices).toHaveLength(4);
      expect(question.choices[question.answer]).toBeTruthy();
      expect(question.explanation).toBeTruthy();
    }
  });

  it('scores a completed attempt by the official answer indexes', () => {
    const answers = motorTheoryQuestions.map((question) => question.answer);
    expect(scoreTheory(answers)).toBe(8);
    answers[0] = (answers[0] + 1) % 4;
    expect(scoreTheory(answers)).toBe(7);
  });
});
