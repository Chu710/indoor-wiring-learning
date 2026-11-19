import { getConnectedNets } from './graph';
import type { B11Question, Diagnostic, Wire } from './types';

export function validateWiring(question: B11Question, wires: Wire[], referenceNets = question.referenceNets): Diagnostic[] {
  const nets = getConnectedNets(question, wires);
  const group = new Map([...nets.flatMap((net, index) => [...net].map((id): [string, number] => [id, index]))]);
  const expected = new Map(referenceNets.flatMap((net, index) => net.map((id): [string, number] => [id, index])));
  const result: Diagnostic[] = [];
  for (const [a, b] of question.dangerPairs) {
    if (group.get(a) === group.get(b)) result.push({ kind: 'danger', message: '電源兩側短接，禁止通電', terminals: [a, b], area: '電源與開關', guidance: '檢查兩側電源線有沒有接在同一個節點。' });
  }
  for (const net of nets) {
    const expectedGroups = new Set([...net].map((id) => expected.get(id)).filter((id) => id !== undefined));
    if (expectedGroups.size > 1 && !result.some((item) => item.kind === 'danger' && item.terminals.every((id) => net.has(id)))) {
      result.push({ kind: 'structure', message: '不同電氣節點被接在一起', terminals: [...net], area: '接線端子', guidance: '檢查這條線是否跨接到另一組迴路。' });
    }
  }
  for (const net of referenceNets) {
    if (net.some((id) => group.get(id) !== group.get(net[0]))) {
      const control = net.some((id) => /^(mcf|mcr|stop|forward|reverse|thry)\./.test(id));
      result.push({ kind: control ? 'function' : 'structure', message: control ? '控制迴路尚未完整' : '必要接線尚未完成', terminals: net, area: control ? '正反轉控制' : '電源或負載', guidance: `檢查 ${net[0]} 附近的端子與分支。` });
    }
  }
  const priority = { danger: 0, structure: 1, function: 2 };
  return result.sort((a, b) => priority[a.kind] - priority[b.kind]);
}
