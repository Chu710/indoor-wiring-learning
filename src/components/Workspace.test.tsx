import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { b11Question } from '../b11/question';
import { Workspace } from './Workspace';
import type { Wire } from '../b11/types';

afterEach(cleanup);

describe('workspace wiring', () => {
  it('connects two terminals with the selected color', () => {
    const onAddWire = vi.fn();
    render(<Workspace question={b11Question} wires={[]} color="green" onAddWire={onAddWire} onRemoveWire={vi.fn()} onMovePart={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'supply.A' }));
    fireEvent.click(screen.getByRole('button', { name: 'nfb.L1' }));
    expect(onAddWire).toHaveBeenCalledWith('supply.A', 'nfb.L1', 'green');
  });

  it('rejects self connections before notifying the parent', () => {
    const onAddWire = vi.fn();
    render(<Workspace question={b11Question} wires={[]} color="red" onAddWire={onAddWire} onRemoveWire={vi.fn()} onMovePart={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'supply.A' }));
    fireEvent.click(screen.getByRole('button', { name: 'supply.A' }));
    expect(onAddWire).not.toHaveBeenCalled();
  });

  it('removes a selected wire', () => {
    const onRemoveWire = vi.fn();
    const wires: Wire[] = [{ id: 'w1', from: 'supply.A', to: 'nfb.L1', color: 'red', createdAt: 1 }];
    render(<Workspace question={b11Question} wires={wires} color="red" onAddWire={vi.fn()} onRemoveWire={onRemoveWire} onMovePart={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '刪除 supply.A 至 nfb.L1 的線' }));
    expect(onRemoveWire).toHaveBeenCalledWith('w1');
  });

  it('shows reference connections only when requested', () => {
    const props = { question: b11Question, wires: [] as Wire[], color: 'red' as const, onAddWire: vi.fn(), onRemoveWire: vi.fn(), onMovePart: vi.fn() };
    const { rerender } = render(<Workspace {...props} answerVisible={false} />);
    expect(screen.queryByLabelText('參考接線圖層')).toBeNull();
    rerender(<Workspace {...props} answerVisible />);
    expect(screen.getByLabelText('參考接線圖層')).toBeTruthy();
  });
  it('places a part dropped from the component library', () => {
    const onMovePart = vi.fn();
    render(<Workspace question={b11Question} wires={[]} color="red" onAddWire={vi.fn()} onRemoveWire={vi.fn()} onMovePart={onMovePart} />);
    const stage = screen.getByLabelText('元件放置區');
    fireEvent.drop(stage, { dataTransfer: { getData: () => 'motor' }, clientX: 300, clientY: 250 });
    expect(onMovePart).toHaveBeenCalledWith('motor', expect.any(Number), expect.any(Number));
  });
  it('creates one wire when the pointer is dragged between terminals', () => {
    const onAddWire = vi.fn();
    render(<Workspace question={b11Question} wires={[]} color="red" onAddWire={onAddWire} onRemoveWire={vi.fn()} onMovePart={vi.fn()} />);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'supply.A' }));
    fireEvent.pointerUp(screen.getByRole('button', { name: 'nfb.L1' }));
    fireEvent.click(screen.getByRole('button', { name: 'nfb.L1' }));
    expect(onAddWire).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'nfb.L1' }).className).not.toContain('active');
  });
  it('shows one selected connection at a time and names its endpoints in Chinese', () => {
    const wires: Wire[] = [
      { id: 'w1', from: 'supply.A', to: 'nfb.L1', color: 'red', createdAt: 1 },
      { id: 'w2', from: 'supply.B', to: 'nfb.L2', color: 'white', createdAt: 2 },
    ];
    render(<Workspace question={b11Question} wires={wires} color="red" onAddWire={vi.fn()} onRemoveWire={vi.fn()} onMovePart={vi.fn()} />);
    expect(screen.getByLabelText('電線').querySelectorAll('g[role="button"]')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: /查看第 1 條線/ }));
    expect(screen.getAllByText(/單相 220V 電源 第 1 排左端 → 無熔絲開關 NFB 第 1 排左端/)).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: '顯示全部電線' }));
    expect(screen.getByLabelText('電線').querySelectorAll('g[role="button"]')).toHaveLength(2);
  });
});
