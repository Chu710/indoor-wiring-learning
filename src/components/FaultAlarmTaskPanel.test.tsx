import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { q3WiringSegments } from '../practical/q3/segments';
import { initialFaultAlarmState, nextFaultAlarmState, type FaultAlarmAction } from '../practical/q3/simulate';
import { FaultAlarmTaskPanel } from './FaultAlarmTaskPanel';

afterEach(cleanup);

const baseProps = {
  diagnostics: [],
  checked: false,
  segmentChecked: false,
  hintLevel: 0,
  state: initialFaultAlarmState,
  color: 'red' as const,
  answerVisible: false,
  segment: q3WiringSegments[0],
  segmentNumber: 1,
  segmentCount: q3WiringSegments.length,
  segmentComplete: false,
  onColor: () => undefined,
  onCheck: () => undefined,
  onCheckSegment: () => undefined,
  onNextSegment: () => undefined,
  onHint: () => undefined,
  onShowAnswer: () => undefined,
  onReset: () => undefined,
  onClear: () => undefined,
  onLoadReference: () => undefined,
};

describe('第三題故障警報任務面板', () => {
  it('locks operating controls until the wiring check passes', () => {
    render(<FaultAlarmTaskPanel {...baseProps} onAction={() => undefined} />);

    expect(screen.getByRole('complementary', { name: '第三題故障警報任務面板' })).toBeTruthy();
    for (const name of ['PB1 啟動', 'PB2 停止', '過載跳脫', 'PB3 警報停止', '積熱電驛復歸']) {
      expect(screen.getByRole('button', { name })).toHaveProperty('disabled', true);
    }
  });

  it('shows the official overload, acknowledgement, and reset states', () => {
    const actions: FaultAlarmAction[] = [];
    const tripped = nextFaultAlarmState(nextFaultAlarmState(initialFaultAlarmState, 'start'), 'trip');
    const view = render(<FaultAlarmTaskPanel {...baseProps} checked state={tripped} onAction={(action) => actions.push(action)} />);

    expect(screen.getByText('馬達：過載跳脫')).toBeTruthy();
    expect(screen.getByText('G：亮 R：滅 Y：滅')).toBeTruthy();
    expect(screen.getByText('BZ：鳴響')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'PB3 警報停止' }));
    expect(actions).toEqual(['silence']);

    const acknowledged = nextFaultAlarmState(tripped, 'silence');
    view.rerender(<FaultAlarmTaskPanel {...baseProps} checked state={acknowledged} onAction={(action) => actions.push(action)} />);
    expect(screen.getByText('G：亮 R：滅 Y：亮')).toBeTruthy();
    expect(screen.getByText('BZ：靜音')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '積熱電驛復歸' }));
    expect(actions).toEqual(['silence', 'reset']);
  });
});
