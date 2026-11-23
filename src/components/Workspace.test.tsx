import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { b11Question } from '../b11/question';
import { Workspace } from './Workspace';
import type { Wire } from '../b11/types';

afterEach(cleanup);

describe('workspace wiring', () => {
  it('shows illustrated devices and a wireway behind the interactive terminals', () => {
    render(<Workspace question={b11Question} wires={[]} color="red" onAddWire={vi.fn()} onRemoveWire={vi.fn()} onMovePart={vi.fn()} />);
    expect(screen.getAllByRole('img', { name: /器材示意圖/ })).toHaveLength(b11Question.parts.length);
    expect(screen.getByLabelText('配線線槽')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'nfb.L1' })).toBeTruthy();
    expect(screen.getByLabelText('箱內配線盤')).toBeTruthy();
    expect(screen.getByLabelText('箱外操作與負載')).toBeTruthy();
  });
  it('connects two terminals with the selected color', () => {
    const onAddWire = vi.fn();
    render(<Workspace question={b11Question} wires={[]} color="green" onAddWire={onAddWire} onRemoveWire={vi.fn()} onMovePart={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'supply.A' }));
    fireEvent.click(screen.getByRole('button', { name: 'nfb.L1' }));
    expect(onAddWire).toHaveBeenCalledWith('supply.A', 'nfb.L1', 'green');
  });

  it('shows the selected start terminal and allows clicking its label to finish a wire', () => {
    const onAddWire = vi.fn();
    render(<Workspace question={b11Question} wires={[]} color="red" onAddWire={onAddWire} onRemoveWire={vi.fn()} onMovePart={vi.fn()} />);
    expect(screen.queryByRole('img', { name: '第二題實際配線盤參考照片' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'supply.B' }).querySelector('span')!);
    expect(screen.getByRole('status').textContent).toContain('單相 220V 電源・B');
    fireEvent.click(screen.getByRole('button', { name: 'nfb.L1' }).querySelector('span')!);
    expect(onAddWire).toHaveBeenCalledWith('supply.B', 'nfb.L1', 'red');
    expect(screen.getByRole('status').textContent).toContain('選第一個橘色端子');
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
    expect(screen.getByLabelText('參考接線圖層').querySelectorAll('path')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: '下一組參考節點' }));
    fireEvent.click(screen.getByRole('button', { name: '下一組參考節點' }));
    expect(screen.getByLabelText('參考接線圖層').querySelectorAll('path')).toHaveLength(4);
  });
  it('places a part dropped from the component library', () => {
    const onMovePart = vi.fn();
    render(<Workspace question={b11Question} wires={[]} color="red" onAddWire={vi.fn()} onRemoveWire={vi.fn()} onMovePart={onMovePart} />);
    const stage = screen.getByLabelText('元件放置區');
    fireEvent.drop(stage, { dataTransfer: { getData: () => 'mcf' }, clientX: 300, clientY: 250 });
    expect(onMovePart).toHaveBeenCalledWith('mcf', expect.any(Number), expect.any(Number));
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
  it('keeps every completed wire visible and can focus on one connection', () => {
    const wires: Wire[] = [
      { id: 'w1', from: 'supply.A', to: 'nfb.L1', color: 'red', createdAt: 1 },
      { id: 'w2', from: 'supply.B', to: 'nfb.L2', color: 'white', createdAt: 2 },
    ];
    render(<Workspace question={b11Question} wires={wires} color="red" onAddWire={vi.fn()} onRemoveWire={vi.fn()} onMovePart={vi.fn()} />);
    const visibleWires = screen.getByLabelText('電線').querySelectorAll('g[role="button"]');
    expect(visibleWires).toHaveLength(2);
    expect([...visibleWires].map((wire) => wire.getAttribute('opacity'))).toEqual(['0.15', '1']);
    expect(screen.getByLabelText('配線線槽').querySelectorAll('path[data-wireway-for]')).toHaveLength(0);
    expect(screen.getByLabelText('配線線槽').querySelectorAll('rect[data-fixed-wireway]')).toHaveLength(12);
    fireEvent.click(screen.getByRole('button', { name: /查看第 1 條線/ }));
    expect(screen.getAllByText(/單相 220V 電源・A（第 1 排左端） → 無熔絲開關 NFB・L1（第 1 排左端）/)).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: '只看選取的線' }));
    expect(screen.getByLabelText('電線').querySelectorAll('g[role="button"]')).toHaveLength(1);
  });
});
