import type { B11Question, Wire } from './types';

export function getConnectedNets(question: B11Question, wires: Wire[]): ReadonlyArray<ReadonlySet<string>> {
  const ids = question.parts.flatMap((part) => part.terminals.map((pin) => pin.id));
  const parent = new Map(ids.map((id) => [id, id]));
  const root = (id: string): string => {
    const previous = parent.get(id);
    if (!previous) return id;
    if (previous === id) return id;
    const result = root(previous);
    parent.set(id, result);
    return result;
  };
  for (const [a, b] of [...question.fixedConnections, ...wires.map((wire): [string, string] => [wire.from, wire.to])]) {
    if (parent.has(a) && parent.has(b)) parent.set(root(a), root(b));
  }
  const groups = new Map<string, Set<string>>();
  for (const id of ids) {
    const key = root(id);
    if (!groups.has(key)) groups.set(key, new Set());
    groups.get(key)!.add(id);
  }
  return [...groups.values()];
}
