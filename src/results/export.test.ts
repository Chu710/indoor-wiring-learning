import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PracticeRecord } from '../practical/session';
import type { ExamResult } from '../theory/exam';
import type { TheoryResult } from '../theory/records';
import { createResultsCsv, downloadResultsCsv } from './export';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('學習成果 CSV', () => {
  it('匯出學科、模擬考與術科的完整紀錄', () => {
    const theory: TheoryResult[] = [{
      source: '007003A13', startedAt: 1_000, completedAt: 61_000,
      answers: Array(8).fill(0), score: 7, total: 8,
    }];
    const exams: ExamResult[] = [{
      startedAt: 100_000, completedAt: 700_000, questionIndex: 79,
      answers: Array(80).fill(0), correct: 52, score: 65, timedOut: false,
    }];
    const practical: PracticeRecord[] = [{
      questionId: 'b11-q1-liquid-level', startedAt: 10_000, completedAt: 130_000,
      completed: true, wires: [], positions: {}, checkCount: 3,
      errorCounts: { danger: 1, structure: 2, function: 0 }, hintCount: 2,
      simulationResults: ['manual', 'auto'],
    }, {
      questionId: 'b11-q3-motor-fault-alarm', startedAt: 20_000, completedAt: 260_000,
      completed: true, wires: [], positions: {}, checkCount: 2,
      errorCounts: { danger: 0, structure: 0, function: 1 }, hintCount: 3,
      simulationResults: ['start', 'stop', 'trip', 'silence', 'reset'],
    }];

    const csv = createResultsCsv({ theory, exams, practical });

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('類型,項目,完成時間,成績,答對題數,結果,作答時間,檢查次數,錯誤次數,提示次數');
    expect(csv).toContain('學科,8 題學科練習');
    expect(csv).toContain('答對 7 題（共 8 題）,7');
    expect(csv).not.toContain('7 / 8');
    expect(csv).toContain('學科,80 題模擬考');
    expect(csv).toContain('65 分,52,及格');
    expect(csv).toContain('術科,第一題｜液位控制');
    expect(csv).toContain('術科,第三題｜故障警報');
    expect(csv).toContain('完成,2 分鐘,3,3,2');
  });

  it('沒有紀錄時只輸出標題列', () => {
    const csv = createResultsCsv({ theory: [], exams: [], practical: [] });
    expect(csv.trim().split('\r\n')).toHaveLength(1);
  });

  it('用可辨識的檔名下載 CSV 並釋放暫存網址', () => {
    const createObjectURL = vi.fn(() => 'blob:results');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    downloadResultsCsv('\uFEFF類型,項目');

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:results');
  });
});
