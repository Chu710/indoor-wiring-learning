import type { Part, PracticalQuestion, Terminal, WireColor } from '../types';
import { publicAssetPath } from '../../config/publicAssetPath';
import { q3WiringSegments } from './segments';

const allColors: WireColor[] = ['red', 'white', 'black', 'green'];
const terminal = (partId: string, label: string, x: number, y: number, allowedColors: WireColor[] = allColors): Terminal => ({
  id: `${partId}.${label}`, partId, label, x, y, allowedColors,
});
const part = (id: string, name: string, kind: Part['kind'], x: number, y: number, labels: string[]): Part => ({
  id, name, kind, x, y,
  terminals: labels.map((label, index) => terminal(id, label, index % 2 ? 106 : 0, 52 + Math.floor(index / 2) * 24, label === 'PE' ? ['green'] : allColors)),
});

// Source: official 007003B11.pdf, third question, printed pp. 26-32.
// Auxiliary-contact numbers are teaching labels mapped from the official
// symbols; real equipment must be checked against its manufacturer diagram.
export const b11Question3: PracticalQuestion = {
  id: 'b11-q3-motor-fault-alarm',
  number: 3,
  available: true,
  simulatorKind: 'fault-alarm',
  title: 'B11 第三題｜電動機故障警報控制',
  source: '007003B11.pdf，第三題附圖（二）與附圖（三），印刷頁 31-32',
  schematic: {
    src: publicAssetPath(import.meta.env.BASE_URL, 'b11-q3-official-schematic.png'),
    alt: 'B11 第三題電動機故障警報官方控制電路圖',
    sourceLabel: '勞動部 007003B11 第三題附圖（二），印刷頁 31',
  },
  parts: [
    part('supply', '單相 220V 電源', 'supply', 80, 80, ['A', 'B']),
    part('nfb', '無熔絲開關 NFB', 'breaker', 230, 80, ['L1', 'L2', 'T1', 'T2']),
    part('fuse-a', '控制保險絲 D-F1', 'fuse', 390, 80, ['L', 'T']),
    part('fuse-b', '控制保險絲 D-F2', 'fuse', 560, 80, ['L', 'T']),
    part('tb5', '端子台 TB5', 'terminal-block', 790, 80, ['1', '2', 'PE']),
    part('mc', '電磁接觸器 MC', 'contactor', 80, 390, ['A1', 'A2', '13', '14', '21', '22', '23', '24', 'P1L', 'P1T', 'P2L', 'P2T']),
    part('thry', '積熱電驛 TH-RY', 'overload', 230, 390, ['95', '96', '98', 'H1I', 'H1O', 'H2I', 'H2O']),
    part('relay-x1', '故障輔助電驛 X1', 'relay', 390, 390, ['A1', 'A2', '13', '14', '23', '24']),
    part('relay-x2', '警報保持電驛 X2', 'relay', 560, 390, ['A1', 'A2', '13', '14', '21', '22', '23', '24']),
    part('tb1', '端子台 TB1', 'terminal-block', 790, 390, ['1', '2', 'PE']),
    part('earth', '保護接地', 'earth', 80, 680, ['PE']),
    part('motor', '單相馬達 2HP', 'motor', 230, 680, ['L1', 'L2', 'PE']),
    part('pb1', '啟動 PB1（常開）', 'button', 1025, 80, ['1', '2']),
    part('pb2', '停止 PB2（常閉）', 'button', 1025, 260, ['1', '2']),
    part('pb3', '警報停止 PB3', 'button', 1025, 540, ['1', '2']),
    part('lamp-g', '停止燈 G', 'lamp', 1205, 80, ['1', '2']),
    part('lamp-r', '運轉燈 R', 'lamp', 1205, 260, ['1', '2']),
    part('lamp-y', '故障燈 Y', 'lamp', 1205, 390, ['1', '2']),
    part('buzzer', '蜂鳴器 BZ', 'buzzer', 1205, 540, ['1', '2']),
  ],
  referenceNets: [
    ['supply.A', 'nfb.L1'],
    ['supply.B', 'nfb.L2'],
    ['nfb.T1', 'fuse-a.L', 'mc.P1L'],
    ['nfb.T2', 'fuse-b.L', 'mc.P2L'],
    ['fuse-a.T', 'pb2.1', 'relay-x1.A1', 'relay-x1.13', 'relay-x2.21', 'relay-x2.23', 'mc.21', 'mc.23'],
    ['fuse-b.T', 'thry.95', 'buzzer.2', 'relay-x2.A2', 'lamp-y.2', 'lamp-g.2'],
    ['pb2.2', 'pb1.1', 'mc.13'],
    ['pb1.2', 'mc.14', 'mc.A1', 'lamp-r.1'],
    ['mc.A2', 'lamp-r.2', 'thry.96'],
    ['relay-x1.A2', 'thry.98'],
    ['relay-x1.14', 'relay-x2.13'],
    ['relay-x2.14', 'buzzer.1'],
    ['relay-x2.24', 'mc.24', 'pb3.1'],
    ['pb3.2', 'relay-x2.A1'],
    ['relay-x2.22', 'relay-x1.23'],
    ['relay-x1.24', 'lamp-y.1'],
    ['mc.22', 'lamp-g.1'],
    ['mc.P1T', 'thry.H1I'],
    ['mc.P2T', 'thry.H2I'],
    ['thry.H1O', 'tb5.1', 'tb1.1', 'motor.L1'],
    ['thry.H2O', 'tb5.2', 'tb1.2', 'motor.L2'],
    ['earth.PE', 'tb5.PE', 'tb1.PE', 'motor.PE'],
  ],
  fixedConnections: [],
  dangerPairs: [
    ['supply.A', 'supply.B'], ['nfb.T1', 'nfb.T2'],
    ['earth.PE', 'supply.A'], ['earth.PE', 'supply.B'],
    ['earth.PE', 'nfb.T1'], ['earth.PE', 'nfb.T2'],
  ],
  segments: q3WiringSegments,
  functionalRules: [
    { id: 'start-stop', area: '啟動停止控制', message: 'MC 啟動、自保持或停止路徑尚未完整', guidance: '檢查 PB2、PB1、MC 13-14、自保持線圈與 TH-RY 95-96。', terminals: ['pb2.1', 'pb2.2', 'pb1.1', 'pb1.2', 'mc.13', 'mc.14', 'mc.A1', 'mc.A2', 'thry.95', 'thry.96'] },
    { id: 'fault-alarm', area: '過載故障警報', message: 'X1、X2、PB3、蜂鳴器或黃燈路徑尚未完整', guidance: '檢查 X1、X2 輔助接點與線圈、PB3、BZ 及 Y 燈。', terminals: ['relay-x1.A1', 'relay-x1.A2', 'relay-x1.13', 'relay-x1.14', 'relay-x2.A1', 'relay-x2.A2', 'pb3.1', 'pb3.2', 'buzzer.1', 'buzzer.2', 'lamp-y.1', 'lamp-y.2'] },
  ],
};
