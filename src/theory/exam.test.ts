import { describe, expect, it } from 'vitest';
import { examQuestions, scoreExam } from './exam';

describe('80 題模擬考', () => {
  it('contains 64 professional and four questions from each common subject', () => {
    expect(examQuestions).toHaveLength(80);
    expect(new Set(examQuestions.map((question) => question.id)).size).toBe(80);
    for (const [code, count] of Object.entries({ '007003A13': 64, '900060A12': 4, '900070A11': 4, '900080A18': 4, '900090A14': 4 })) {
      expect(examQuestions.filter((question) => question.sourceCode === code)).toHaveLength(count);
    }
    for (const question of examQuestions) {
      expect(question.prompt.length).toBeGreaterThan(10);
      expect(question.choices).toHaveLength(4);
      expect(question.choices.every(Boolean)).toBe(true);
      expect(question.answer).toBeGreaterThanOrEqual(0);
      expect(question.answer).toBeLessThan(4);
    }
  });

  it('passes at 48 correct and scores unanswered as incorrect', () => {
    const answers = examQuestions.map((question, index) => index < 48 ? question.answer : null);
    expect(scoreExam(answers)).toEqual({ correct: 48, score: 60, passed: true });
    answers[47] = null;
    expect(scoreExam(answers)).toEqual({ correct: 47, score: 58.75, passed: false });
  });
});
