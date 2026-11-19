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
});
