import { b11Question } from '../../b11/question';
import { wiringSegments } from '../../b11/segments';
import type { PracticalQuestion } from '../types';

export const b11Question2: PracticalQuestion = {
  ...b11Question,
  id: 'b11-q2-internal-wireway-v5',
  number: 2,
  available: true,
  simulatorKind: 'reverse-motor',
  schematic: {
    src: '/b11-q2-official-schematic.png',
    alt: 'B11 第二題官方控制電路圖',
    sourceLabel: b11Question.source,
  },
  segments: wiringSegments,
};
