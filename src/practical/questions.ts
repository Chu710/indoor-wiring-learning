import { b11Question2 } from './q2';
import type { PracticalQuestion } from './types';

const b11Question1Stub: PracticalQuestion = {
  id: 'b11-q1-liquid-level',
  number: 1,
  available: false,
  simulatorKind: 'liquid-level',
  title: 'B11 第一題｜手動、自動液位控制',
  source: '007003B11.pdf，第一題，印刷頁 3–10',
  schematic: {
    src: '',
    alt: 'B11 第一題液位控制電路圖',
    sourceLabel: '007003B11.pdf，第一題控制電路圖，印刷頁 9',
  },
  parts: [],
  referenceNets: [],
  fixedConnections: [],
  dangerPairs: [],
  segments: [],
};

export const practicalQuestions: PracticalQuestion[] = [b11Question1Stub, b11Question2];

export function getPracticalQuestion(id: string): PracticalQuestion | null {
  return practicalQuestions.find((question) => question.id === id) ?? null;
}
