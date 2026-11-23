type Point = { x: number; y: number };

// These are usable internal ducts. The cabinet frame itself is deliberately
// absent so a connection can never take a distracting trip around the border.
export const verticalWirewayCenters = [65, 205, 365, 530, 755, 935, 1005, 1185, 1360] as const;
export const horizontalWirewayCenters = [240, 370, 650] as const;

const laneOffsets = [0, 3, -3, 6, -6] as const;

function nearest(value: number, candidates: readonly number[]): number {
  return candidates.reduce((best, candidate) => Math.abs(candidate - value) < Math.abs(best - value) ? candidate : best);
}

function terminalSideWireway(terminalX: number, partX: number): number {
  const isRightSide = terminalX - partX > 50;
  const candidates = verticalWirewayCenters.filter((center) => isRightSide ? center >= terminalX : center <= terminalX);
  return nearest(terminalX, candidates.length ? candidates : verticalWirewayCenters);
}

/** Route a visible lead into the gutter beside each device, then across a wireway. */
export function routeThroughWireway(a: Point, b: Point, fromPart: Point, toPart: Point, lane: number): Point[] {
  const laneOffset = laneOffsets[lane % laneOffsets.length];
  const fromX = terminalSideWireway(a.x, fromPart.x) + laneOffset;
  const toX = terminalSideWireway(b.x, toPart.x) + laneOffset;
  if (fromX === toX) {
    if (a.y === b.y) return [a, { x: fromX, y: a.y }, b];
    return [a, { x: fromX, y: a.y }, { x: toX, y: b.y }, b];
  }
  const midpointY = (a.y + b.y) / 2;
  const busY = nearest(midpointY, horizontalWirewayCenters) + laneOffset;
  return [a, { x: fromX, y: a.y }, { x: fromX, y: busY }, { x: toX, y: busY }, { x: toX, y: b.y }, b];
}

export function wirewayPath(a: Point, b: Point, fromPart: Point, toPart: Point, lane: number): string {
  return routeThroughWireway(a, b, fromPart, toPart, lane).map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
}
