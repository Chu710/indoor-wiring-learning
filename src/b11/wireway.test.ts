import { describe, expect, it } from 'vitest';
import { horizontalWirewayCenters, routeThroughWireway, verticalWirewayCenters } from './wireway';

describe('線槽路徑', () => {
  it('routes a distant connection through internal ducts only', () => {
    const points = routeThroughWireway({ x: 146, y: 122 }, { x: 1210, y: 662 }, { x: 40, y: 70 }, { x: 1210, y: 610 }, 0);
    expect(points[0]).toEqual({ x: 146, y: 122 });
    expect(points.at(-1)).toEqual({ x: 1210, y: 662 });
    expect(points.some((point) => horizontalWirewayCenters.includes(point.y as typeof horizontalWirewayCenters[number]))).toBe(true);
    expect(points.slice(1, -1).every((point) => point.x >= 60 && point.x <= 1365 && point.y >= 100 && point.y <= 800)).toBe(true);
  });
  it('uses the interior cabinet duct for two cabinet devices', () => {
    const points = routeThroughWireway({ x: 226, y: 212 }, { x: 280, y: 212 }, { x: 120, y: 160 }, { x: 280, y: 160 }, 0);
    expect(points.some((point) => point.y === 240)).toBe(true);
  });

  it('keeps top-row cabinet wiring out of the cabinet frame', () => {
    const points = routeThroughWireway({ x: 146, y: 115 }, { x: 226, y: 115 }, { x: 40, y: 70 }, { x: 170, y: 70 }, 0);
    expect(points.some((point) => point.y === 240)).toBe(true);
    expect(points.some((point) => point.y === 40)).toBe(false);
  });

  it('exits a right-side terminal toward the right wireway instead of crossing its device', () => {
    const points = routeThroughWireway({ x: 146, y: 212 }, { x: 40, y: 312 }, { x: 40, y: 160 }, { x: 40, y: 260 }, 0);
    expect(points[1]).toEqual({ x: 205, y: 212 });
    expect(points.at(-2)).toEqual({ x: 65, y: 312 });
  });

  it('connects terminals that share one vertical duct without an extra horizontal-wireway tail', () => {
    const points = routeThroughWireway({ x: 666, y: 132 }, { x: 790, y: 132 }, { x: 560, y: 80 }, { x: 790, y: 80 }, 0);
    expect(points).toEqual([
      { x: 666, y: 132 },
      { x: 755, y: 132 },
      { x: 790, y: 132 },
    ]);
  });

  it('keeps every intermediate segment on the fixed wireway grid', () => {
    const points = routeThroughWireway({ x: 186, y: 132 }, { x: 1015, y: 142 }, { x: 80, y: 80 }, { x: 1015, y: 90 }, 2);
    expect(verticalWirewayCenters).toEqual([65, 205, 365, 530, 755, 935, 1005, 1185, 1360]);
    expect(horizontalWirewayCenters).toEqual([240, 370, 650]);
    expect(verticalWirewayCenters).toContain(points[1].x + 3);
    expect(horizontalWirewayCenters).toContain(points[2].y + 3);
    expect(verticalWirewayCenters).toContain(points[3].x + 3);
    expect(verticalWirewayCenters).toContain(points[4].x + 3);
  });
});
