import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { b11Question } from './b11/question';
import { loadRecords } from './b11/session';

afterEach(cleanup);
beforeEach(() => window.localStorage.clear());

describe('B11 practice screen', () => {
  it('shows segment errors without enabling the virtual power test', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '檢查本段接線' }));
    expect(screen.getByText('必要接線尚未完成')).toBeTruthy();
    expect((screen.getByRole('button', { name: '正轉' }) as HTMLButtonElement).disabled).toBe(true);
  });
  it('lets a learner check wiring and blocks energizing a short', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'nfb.T1' }));
    fireEvent.click(screen.getByRole('button', { name: 'nfb.T2' }));
    fireEvent.click(screen.getByRole('button', { name: '檢查圖面接線' }));
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
    const wires = b11Question.referenceNets.flatMap((net) => net.slice(1).map((to, index) => ({ id: `${net[0]}-${index}`, from: net[0], to, color: net.includes('earth.PE') ? 'green' : 'red', createdAt: 1 })));
    window.localStorage.setItem('b11-draft-v1', JSON.stringify({ questionId: b11Question.id, startedAt: Date.now(), wires, positions: {}, checkCount: 0, errorCounts: { danger: 0, structure: 0, function: 0 }, hintCount: 0 }));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '檢查圖面接線' }));
    expect(screen.getByText('與內建圖面接線一致')).toBeTruthy();
    for (const name of ['正轉', '測試互鎖', '停止', '反轉', '過載跳脫']) fireEvent.click(screen.getByRole('button', { name }));
    expect(screen.getByText('圖面練習完成')).toBeTruthy();
    expect(loadRecords(window.localStorage)).toHaveLength(1);
  });
  it('loads the reference through the UI and runs the wired controls', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '載入圖面參考接線（測試用）' }));
    fireEvent.click(screen.getByRole('button', { name: '檢查圖面接線' }));
    expect(screen.getByText('與內建圖面接線一致')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '正轉' }));
    expect(screen.getByText('預期馬達狀態：正轉')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '停止' }));
    fireEvent.click(screen.getByRole('button', { name: '反轉' }));
    expect(screen.getByText('預期馬達狀態：反轉')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '過載跳脫' }));
    expect(screen.getByText('BZ：鳴響')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '復歸' }));
    expect(screen.getByText('預期馬達狀態：停止')).toBeTruthy();
    expect(screen.getByText('BZ：靜音')).toBeTruthy();
  });
});
