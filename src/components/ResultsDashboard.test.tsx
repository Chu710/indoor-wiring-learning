import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appendQuestionRecord } from '../practical/session';
import { examResultsKey, type ExamResult } from '../theory/exam';
import { appendTheoryResult } from '../theory/records';
import { ResultsDashboard } from './ResultsDashboard';

afterEach(cleanup);
beforeEach(() => window.localStorage.clear());

describe('學習成果頁', () => {
  it('沒有紀錄時提供清楚的開始提示', () => {
    render(<ResultsDashboard />);

    expect(screen.getByRole('heading', { name: '學習成果總覽' })).toBeTruthy();
    expect(screen.getByText('尚無完成紀錄')).toBeTruthy();
    expect(screen.getByText('8 題學科練習')).toBeTruthy();
    expect(screen.getByText('80 題模擬考')).toBeTruthy();
    expect(screen.getByText('第一題｜液位控制')).toBeTruthy();
    expect(screen.getByText('第二題｜馬達正反轉')).toBeTruthy();
    expect(screen.getByRole('button', { name: '匯出學習成果 CSV' })).toHaveProperty('disabled', true);
  });

  it('彙整學科、模擬考與兩題術科紀錄', () => {
    appendTheoryResult(window.localStorage, {
      source: '007003A13', startedAt: 1_000, completedAt: 61_000,
      answers: Array(8).fill(0), score: 7, total: 8,
    });
    const exam: ExamResult = {
      startedAt: 100_000, completedAt: 700_000, questionIndex: 79,
      answers: Array(80).fill(0), correct: 52, score: 65, timedOut: false,
    };
    window.localStorage.setItem(examResultsKey, JSON.stringify([exam]));
    appendQuestionRecord(window.localStorage, {
      questionId: 'b11-q1-liquid-level', startedAt: 10_000, completedAt: 130_000,
      completed: true, wires: [], positions: {}, checkCount: 3,
      errorCounts: { danger: 1, structure: 2, function: 0 }, hintCount: 2,
      simulationResults: ['manual', 'auto'],
    });
    appendQuestionRecord(window.localStorage, {
      questionId: 'b11-q2-internal-wireway-v5', startedAt: 20_000, completedAt: 200_000,
      completed: true, wires: [], positions: {}, checkCount: 4,
      errorCounts: { danger: 0, structure: 1, function: 1 }, hintCount: 1,
      simulationResults: ['forward', 'stop', 'reverse'],
    });

    render(<ResultsDashboard />);

    expect(screen.getByText('最佳 7 / 8 題')).toBeTruthy();
    expect(screen.getByText('最高 65 分｜及格 1 次')).toBeTruthy();
    expect(screen.getByText('最快 2 分鐘｜完成 1 次')).toBeTruthy();
    expect(screen.getByText('最快 3 分鐘｜完成 1 次')).toBeTruthy();
    expect(screen.getByText('錯誤 3 次')).toBeTruthy();
    expect(screen.getByText('提示 2 次')).toBeTruthy();
    expect(screen.getByText('錯誤 2 次')).toBeTruthy();
    expect(screen.getByText('提示 1 次')).toBeTruthy();
    expect(screen.getByRole('button', { name: '匯出學習成果 CSV' })).toHaveProperty('disabled', false);
  });
});
