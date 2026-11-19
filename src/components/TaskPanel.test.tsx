import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TaskPanel } from './TaskPanel';
import { initialMotorState } from '../b11/simulate';
import type { Diagnostic } from '../b11/types';

afterEach(cleanup);
const danger: Diagnostic = { kind: 'danger', message: '電源短接', area: '電源', guidance: '檢查兩側', terminals: ['supply.A', 'supply.B'] };

describe('task guidance', () => {
  it('reveals hints in stages and never exposes the answer during check', () => {
    const onHint = vi.fn(); const onCheck = vi.fn();
    const props = { diagnostics: [danger], checked: true, hintLevel: 0, motor: initialMotorState, color: 'red' as const, onColor: vi.fn(), onCheck, onHint, onShowAnswer: vi.fn(), onReset: vi.fn(), onMotorAction: vi.fn(), onClear: vi.fn(), answerVisible: false };
    const { rerender } = render(<TaskPanel {...props} />);
    expect(screen.getByText('電源短接')).toBeTruthy();
    expect(screen.queryByText('位置：電源')).toBeNull();
    expect(screen.queryByText(/supply.A.*supply.B/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '顯示提示' }));
    expect(onHint).toHaveBeenCalledOnce();
    rerender(<TaskPanel {...props} hintLevel={1} />);
    expect(screen.getByText('位置：電源')).toBeTruthy();
    rerender(<TaskPanel {...props} hintLevel={3} />);
    expect(screen.getByText(/supply.A.*supply.B/)).toBeTruthy();
  });
  it('keeps the power controls disabled while wiring is faulty', () => {
    render(<TaskPanel diagnostics={[danger]} checked hintLevel={0} motor={initialMotorState} color="red" onColor={vi.fn()} onCheck={vi.fn()} onHint={vi.fn()} onShowAnswer={vi.fn()} onReset={vi.fn()} onMotorAction={vi.fn()} onClear={vi.fn()} answerVisible={false} />);
    expect((screen.getByRole('button', { name: '正轉' }) as HTMLButtonElement).disabled).toBe(true);
  });
  it('offers a complete reference wiring load for testing', () => {
    const onLoadReference = vi.fn();
    render(<TaskPanel diagnostics={[]} checked={false} hintLevel={0} motor={initialMotorState} color="red" onColor={vi.fn()} onCheck={vi.fn()} onHint={vi.fn()} onShowAnswer={vi.fn()} onReset={vi.fn()} onMotorAction={vi.fn()} onClear={vi.fn()} onLoadReference={onLoadReference} answerVisible={false} />);
    fireEvent.click(screen.getByRole('button', { name: '載入圖面參考接線（測試用）' }));
    expect(onLoadReference).toHaveBeenCalledOnce();
  });
});
