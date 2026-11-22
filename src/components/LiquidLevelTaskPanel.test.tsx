import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { initialLiquidLevelState } from '../practical/q1/simulate';
import { q1WiringSegments } from '../practical/q1/segments';
import { LiquidLevelTaskPanel } from './LiquidLevelTaskPanel';

afterEach(cleanup);

function renderPanel(checked = false) {
  render(<LiquidLevelTaskPanel
    diagnostics={[]}
    checked={checked}
    hintLevel={0}
    state={initialLiquidLevelState}
    color="red"
    answerVisible={false}
    segment={q1WiringSegments[0]}
    segmentNumber={1}
    segmentCount={q1WiringSegments.length}
    onColor={vi.fn()}
    onCheck={vi.fn()}
    onCheckSegment={vi.fn()}
    onNextSegment={vi.fn()}
    onHint={vi.fn()}
    onShowAnswer={vi.fn()}
    onReset={vi.fn()}
    onClear={vi.fn()}
    onLoadReference={vi.fn()}
    onAction={vi.fn()}
  />);
}

describe('第一題液位控制面板', () => {
  it('顯示模式、水位、燈號與完整操作按鈕', () => {
    renderPanel(true);
    expect(screen.getByText('模式：手動')).toBeTruthy();
    expect(screen.getByText('水槽：中水位')).toBeTruthy();
    expect(screen.getByText('給水源：允許')).toBeTruthy();
    for (const name of ['手動模式', '自動模式', 'PB1 啟動', 'PB2 停止', 'PB3 警報停止', '水槽低水位', '水槽中水位', '水槽高水位', '給水源缺水', '給水源允許', '給水源充足', '過載跳脫', '積熱電驛復歸']) {
      expect(screen.getByRole('button', { name })).toBeTruthy();
    }
  });

  it('接線檢查通過前停用所有虛擬通電操作', () => {
    renderPanel(false);
    expect((screen.getByRole('button', { name: 'PB1 啟動' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: '自動模式' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: '過載跳脫' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('清楚區分警報停止與積熱電驛復歸', () => {
    renderPanel(true);
    expect(screen.getByText('PB3 只停止蜂鳴器，不會清除給水源缺水狀態，也不會啟動馬達。')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'PB3 警報停止' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '積熱電驛復歸' })).toBeTruthy();
  });
});
