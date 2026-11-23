import { b11Question1 } from './q1/question';
import { b11Question2 } from './q2';
import { b11Question3 } from './q3/question';
import type { PracticalQuestion } from './types';

export const practicalQuestions: PracticalQuestion[] = [b11Question1, b11Question2, b11Question3];

export function getPracticalQuestion(id: string): PracticalQuestion | null {
  return practicalQuestions.find((question) => question.id === id) ?? null;
}
