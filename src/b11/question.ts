import type { B11Question, Part, Terminal, WireColor } from './types';

const all: WireColor[] = ['red', 'white', 'black', 'green'];
const terminal = (partId: string, label: string, x: number, y: number): Terminal => ({
  id: `${partId}.${label}`, partId, label, x, y, allowedColors: all,
});
const part = (id: string, name: string, kind: Part['kind'], x: number, y: number, labels: string[]): Part => ({
  id, name, kind, x, y,
  terminals: labels.map((label, index) => terminal(id, label, index % 2 ? 106 : 0, 36 + Math.floor(index / 2) * 24)),
});

// Source: official 007003B11.pdf, printed pp. 15–20; printed p. 20 shows the
// power and control ladder. Numeric terminal IDs below are teaching labels for
// the simulator; the printed figure names devices but does not enumerate pins.
// Internal contact behavior is handled by the simulator, not permanent wires.
export const b11Question: B11Question = {
  id: 'b11-q2-control-circuit-v2',
  title: 'B11 第二題｜單相馬達正反轉控制迴路練習',
  source: '007003B11.pdf，第二題附圖（二），印刷頁 20',
  parts: [
    part('supply', '單相 220V 電源', 'supply', 40, 70, ['A', 'B']),
    part('nfb', '無熔絲開關 NFB', 'breaker', 210, 70, ['L1', 'L2', 'T1', 'T2']),
    part('pf-a', '控制保險絲 PF-A', 'fuse', 40, 170, ['L', 'T']),
    part('pf-b', '控制保險絲 PF-B', 'fuse', 210, 170, ['L', 'T']),
    part('stop', '停止 OFF（常閉）', 'button', 40, 280, ['1', '2']),
    part('forward', '正轉 FWD（常開）', 'button', 210, 280, ['1', '2']),
    part('reverse', '反轉 REV（常開）', 'button', 210, 390, ['1', '2']),
    part('mcf', '正轉接觸器 MCF', 'contactor', 410, 220, ['A1', 'A2', '13', '14', '21', '22', '31', '32']),
    part('mcr', '反轉接觸器 MCR', 'contactor', 410, 420, ['A1', 'A2', '13', '14', '21', '22', '31', '32']),
    part('thry', '積熱電驛 TH-RY', 'overload', 610, 310, ['95', '96', '97', '98']),
    part('lamp-f', '正轉燈 R1', 'lamp', 810, 215, ['1', '2']),
    part('lamp-r', '反轉燈 R2', 'lamp', 810, 330, ['1', '2']),
    part('lamp-g', '停止燈 G', 'lamp', 810, 445, ['1', '2']),
    part('buzzer', '蜂鳴器 BZ', 'buzzer', 810, 560, ['1', '2']),
  ],
  referenceNets: [
    ['supply.A', 'nfb.L1'],
    ['supply.B', 'nfb.L2'],
    ['nfb.T1', 'pf-a.L'],
    ['pf-a.T', 'stop.1', 'mcf.31', 'thry.97'],
    ['stop.2', 'forward.1', 'reverse.1', 'mcf.13', 'mcr.13'],
    ['forward.2', 'mcf.14', 'mcr.21'],
    ['mcr.22', 'mcf.A1', 'lamp-f.1'],
    ['reverse.2', 'mcr.14', 'mcf.21'],
    ['mcf.22', 'mcr.A1', 'lamp-r.1'],
    ['mcf.A2', 'mcr.A2', 'lamp-f.2', 'lamp-r.2', 'thry.95'],
    ['nfb.T2', 'pf-b.L'],
    ['pf-b.T', 'thry.96', 'buzzer.2', 'lamp-g.2'],
    ['thry.98', 'buzzer.1'],
    ['mcf.32', 'mcr.31'],
    ['mcr.32', 'lamp-g.1'],
  ],
  fixedConnections: [],
  dangerPairs: [['supply.A', 'supply.B'], ['nfb.T1', 'nfb.T2']],
};

export function validateQuestion(question: B11Question): string[] {
  const errors: string[] = [];
  const ids = question.parts.flatMap((item) => item.terminals.map((pin) => pin.id));
  const known = new Set(ids);
  if (known.size !== ids.length) errors.push('端子 ID 重複');
  for (const item of question.parts) {
    for (const pin of item.terminals) if (pin.partId !== item.id) errors.push(`端子歸屬錯誤：${pin.id}`);
  }
  const netOf = new Map<string, number>();
  for (const [index, net] of question.referenceNets.entries()) {
    if (net.length < 2) errors.push('參考節點少於兩個端子');
    for (const id of net) {
      if (!known.has(id)) errors.push(`找不到端子：${id}`);
      if (netOf.has(id) && netOf.get(id) !== index) errors.push(`端子出現在不同參考節點：${id}`);
      netOf.set(id, index);
    }
  }
  for (const [a, b] of [...question.fixedConnections, ...question.dangerPairs]) {
    if (!known.has(a) || !known.has(b)) errors.push(`找不到連線端子：${a}、${b}`);
  }
  return errors;
}
