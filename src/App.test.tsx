import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { b11Question } from './b11/question';
import { loadRecords } from './b11/session';

afterEach(cleanup);
beforeEach(() => window.localStorage.clear());

describe('B11 practice screen', () => {
  it('lets a learner check wiring and blocks energizing a short', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'nfb.T1' }));
    fireEvent.click(screen.getByRole('button', { name: 'nfb.T2' }));
    fireEvent.click(screen.getByRole('button', { name: '檢查接線' }));
    expect(screen.getByText('危險接線')).toBeTruthy();
    expect((screen.getByRole('button', { name: '正轉' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('restores a partially wired exercise after remounting', () => {
    const app = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'supply.A' }));
    fireEvent.click(screen.getByRole('button', { name: 'nfb.L1' }));
    expect(screen.getByText('1 條線')).toBeTruthy();
    app.unmount();
    render(<App />);
    expect(screen.getByText('1 條線')).toBeTruthy();
  });
  it('records a completed reference exercise once', () => {
    const wires = b11Question.referenceNets.flatMap((net) => net.slice(1).map((to, index) => ({ id: `${net[0]}-${index}`, from: net[0], to, color: 'red', createdAt: 1 })));
    window.localStorage.setItem('b11-draft-v1', JSON.stringify({ questionId: b11Question.id, startedAt: Date.now(), wires, positions: {}, checkCount: 0, errorCounts: { danger: 0, structure: 0, function: 0 }, hintCount: 0 }));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '檢查接線' }));
    expect(screen.getByText('接線檢查通過')).toBeTruthy();
    for (const name of ['正轉', '測試互鎖', '停止', '反轉', '過載跳脫']) fireEvent.click(screen.getByRole('button', { name }));
    expect(screen.getByText('練習完成')).toBeTruthy();
    expect(loadRecords(window.localStorage)).toHaveLength(1);
  });
});
