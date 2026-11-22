import { describe, expect, it } from 'vitest';
import { b11Question1 } from './q1/question';
import { b11Question2 } from './q2';
import { initialPracticalSimulation, nextPracticalSimulation } from './simulation';
import type { PracticalQuestion, Wire } from './types';

const reference = (question: PracticalQuestion): Wire[] => question.referenceNets.flatMap((net, netIndex) => net.slice(1).map((to, index) => ({
  id: `${question.number}-${netIndex}-${index}`, from: net[0], to,
  color: net.includes('earth.PE') ? 'green' : 'red', createdAt: 1,
})));

describe('practical simulation dispatch', () => {
  it('dispatches the first question to the liquid-level simulator', () => {
    const initial = initialPracticalSimulation(b11Question1);
    const running = nextPracticalSimulation(initial, 'start', b11Question1, reference(b11Question1));
    expect(running).toMatchObject({ kind: 'liquid-level', state: { motor: true, contactor: true } });
  });

  it('keeps the second-question motor simulator compatible', () => {
    const initial = initialPracticalSimulation(b11Question2);
    const running = nextPracticalSimulation(initial, 'forward', b11Question2, reference(b11Question2));
    expect(running).toMatchObject({ kind: 'reverse-motor', state: { direction: 'forward', mcf: true, mcr: false } });
  });
});
