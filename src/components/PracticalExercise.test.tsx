import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { draftKey, loadQuestionDraft } from '../practical/session';
import type { PracticalQuestionId } from '../practical/types';
import { PracticalExercise } from './PracticalExercise';
import { PracticalQuestionNav } from './PracticalQuestionNav';
import { useState } from 'react';

afterEach(cleanup);
beforeEach(() => window.localStorage.clear());

function Harness() {
  const [questionId, setQuestionId] = useState<PracticalQuestionId>('b11-q2-internal-wireway-v5');
  return <>
    <PracticalQuestionNav value={questionId} onChange={setQuestionId} />
    <PracticalExercise key={questionId} questionId={questionId} />
  </>;
}

describe('多題術科練習', () => {
  it('反覆切換三次仍分別保留兩題的接線與起始時間', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'supply.B' }));
    fireEvent.click(screen.getByRole('button', { name: 'nfb.L2' }));
    const q2StartedAt = loadQuestionDraft(window.localStorage, 'b11-q2-internal-wireway-v5')?.startedAt;

    fireEvent.click(screen.getByRole('button', { name: '第一題｜液位控制' }));
    fireEvent.click(screen.getByRole('button', { name: 'supply.A' }));
    fireEvent.click(screen.getByRole('button', { name: 'nfb.L1' }));
    const q1StartedAt = loadQuestionDraft(window.localStorage, 'b11-q1-liquid-level')?.startedAt;
    expect(q1StartedAt).toBeTypeOf('number');
    expect(q2StartedAt).toBeTypeOf('number');

    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: '第二題｜馬達正反轉' }));
      expect(screen.getByText('1 條線')).toBeTruthy();
      expect(screen.getAllByText(/單相 220V 電源.*B.*無熔絲開關 NFB.*L2/).length).toBeGreaterThan(0);
      fireEvent.click(screen.getByRole('button', { name: '第一題｜液位控制' }));
      expect(screen.getByText('1 條線')).toBeTruthy();
      expect(screen.getAllByText(/單相 220V 電源.*A.*無熔絲開關 NFB.*L1/).length).toBeGreaterThan(0);
    }
    expect(loadQuestionDraft(window.localStorage, 'b11-q1-liquid-level')?.startedAt).toBe(q1StartedAt);
    expect(loadQuestionDraft(window.localStorage, 'b11-q2-internal-wireway-v5')?.startedAt).toBe(q2StartedAt);
  });

  it('遇到損壞或題號不符的草稿會警告並從空白開始', () => {
    window.localStorage.setItem(draftKey('b11-q1-liquid-level'), '{broken');
    render(<PracticalExercise questionId="b11-q1-liquid-level" />);
    expect(screen.getByText('0 條線')).toBeTruthy();
    expect(screen.getByText(/草稿內容損壞或題號不符/)).toBeTruthy();
  });
});
