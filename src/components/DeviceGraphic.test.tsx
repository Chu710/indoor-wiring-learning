import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Part } from '../practical/types';
import { DeviceGraphic } from './DeviceGraphic';

const part = (kind: Part['kind'], name: string): Part => ({ id: kind, name, kind, x: 0, y: 0, terminals: [] });

describe('first-question device illustrations', () => {
  it('labels the manual/automatic selector on the device face', () => {
    render(<DeviceGraphic part={part('selector', '手動／自動選擇 COS')} />);
    expect(screen.getByRole('img', { name: /手動／自動選擇/ }).textContent).toContain('手');
    expect(screen.getByRole('img', { name: /手動／自動選擇/ }).textContent).toContain('自');
  });

  it('shows the level controller and electrode markings', () => {
    const { rerender } = render(<DeviceGraphic part={part('level-controller', '液位控制器 61F-G1')} />);
    expect(screen.getByRole('img', { name: /液位控制器/ }).textContent).toContain('61F');

    rerender(<DeviceGraphic part={part('water-system', '水槽電極')} />);
    expect(screen.getByRole('img', { name: /水槽電極/ }).textContent).toContain('E1');
  });
});
