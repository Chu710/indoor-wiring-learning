import type { Part, PracticalQuestion, Terminal, WireColor } from '../types';
import { q1WiringSegments } from './segments';

const allColors: WireColor[] = ['red', 'white', 'black', 'green'];
const terminal = (partId: string, label: string, x: number, y: number, allowedColors: WireColor[] = allColors): Terminal => ({
  id: `${partId}.${label}`, partId, label, x, y, allowedColors,
});
const part = (id: string, name: string, kind: Part['kind'], x: number, y: number, labels: string[]): Part => ({
  id, name, kind, x, y,
  terminals: labels.map((label, index) => terminal(id, label, index % 2 ? 106 : 0, 52 + Math.floor(index / 2) * 24, label === 'PE' ? ['green'] : allColors)),
});

// Source: official 007003B11.pdf, printed pp. 8-10. The 61F-G1 and relay
// terminal names are teaching labels transcribed from the official diagram;
// actual work must be checked against the installed manufacturer's device.
export const b11Question1: PracticalQuestion = {
  id: 'b11-q1-liquid-level',
  number: 1,
  available: true,
  simulatorKind: 'liquid-level',
  title: 'B11 第一題｜手動、自動液位控制',
  source: '007003B11.pdf，第一題附圖（二）與附圖（三），印刷頁 9-10',
  schematic: {
    src: '/b11-q1-official-schematic.png',
    alt: 'B11 第一題手動、自動液位控制官方電路圖',
    sourceLabel: '勞動部 007003B11 第一題附圖（二），印刷頁 9',
  },
  parts: [
    part('supply', '單相 220V 電源', 'supply', 80, 80, ['A', 'B']),
    part('nfb', '無熔絲開關 NFB', 'breaker', 230, 80, ['L1', 'L2', 'T1', 'T2']),
    part('fuse-a', '控制保險絲 D-F1', 'fuse', 390, 80, ['L', 'T']),
    part('fuse-b', '控制保險絲 D-F2', 'fuse', 560, 80, ['L', 'T']),
    part('tb4', '端子台 TB4', 'terminal-block', 790, 80, ['1', '2', '3', '4', '5']),
    part('mc', '電磁接觸器 MC', 'contactor', 80, 390, ['A1', 'A2', '13', '14', '21', '22', 'P1L', 'P1T', 'P2L', 'P2T']),
    part('thry', '積熱電驛 TH-RY', 'overload', 230, 390, ['95', '96', '97', '98', 'H1I', 'H1O', 'H2I', 'H2O']),
    part('level', '液位控制器 61F-G1', 'level-controller', 390, 390, ['U1', 'U2', 'Ta1', 'Tb1', 'Tc2', 'Tb2', 'S0', 'S1', 'S2', 'E3', 'E2', 'E1', "E2'", "E1'"]),
    part('tb6', '端子台 TB6', 'terminal-block', 560, 390, ['1', '2', '3', '4', '5', '6', '7', '8']),
    part('relay-x', '警報輔助繼電器 X', 'relay', 790, 390, ['A1', 'A2', '13', '14', '21', '22']),
    part('tb9', '端子台 TB9', 'terminal-block', 80, 680, ['1', '2', 'PE']),
    part('tb1', '端子台 TB1', 'terminal-block', 230, 680, ['1', '2', 'PE']),
    part('earth', '保護接地', 'earth', 560, 680, ['PE']),
    part('motor', '單相馬達 1HP', 'motor', 790, 680, ['L1', 'L2', 'PE']),
    part('cos', '手動／自動選擇 COS', 'selector', 1025, 80, ['C', 'A', 'M']),
    part('pb1', '啟動 PB1（常開）', 'button', 1025, 260, ['1', '2']),
    part('pb2', '停止 PB2（常閉）', 'button', 1025, 390, ['1', '2']),
    part('pb3', '警報停止 PB3', 'button', 1025, 540, ['1', '2']),
    part('source-electrodes', '給水源電極', 'water-system', 1025, 680, ["E3'", "E2'", "E1'"]),
    part('lamp-g', '停止燈 G', 'lamp', 1205, 80, ['1', '2']),
    part('lamp-r', '運轉燈 R', 'lamp', 1205, 260, ['1', '2']),
    part('lamp-y', '過載燈 Y', 'lamp', 1205, 390, ['1', '2']),
    part('buzzer', '蜂鳴器 BZ', 'buzzer', 1205, 540, ['1', '2']),
    part('tank-electrodes', '水槽電極', 'water-system', 1205, 680, ['E3', 'E2', 'E1']),
  ],
  referenceNets: [
    ['supply.A', 'nfb.L1'],
    ['supply.B', 'nfb.L2'],
    ['nfb.T1', 'fuse-a.L', 'mc.P1L'],
    ['fuse-a.T', 'cos.C', 'mc.21', 'lamp-y.1'],
    ['nfb.T2', 'fuse-b.L', 'mc.P2L'],
    ['fuse-b.T', 'thry.96', 'relay-x.A2', 'buzzer.2', 'lamp-g.2', 'lamp-r.2', 'thry.98', 'level.U2'],
    ['cos.M', 'pb2.1'],
    ['pb2.2', 'pb1.1', 'mc.13'],
    ['pb1.2', 'mc.14', 'mc.A1', 'lamp-r.1', 'tb6.2', 'level.Ta1'],
    ['mc.A2', 'thry.95'],
    ['mc.22', 'lamp-g.1'],
    ['cos.A', 'tb6.1', 'level.U1'],
    ['level.E3', 'tb4.1', 'tank-electrodes.E3', "source-electrodes.E3'", 'earth.PE', 'tb9.PE', 'tb1.PE', 'motor.PE'],
    ['level.E2', 'tb4.2', 'tank-electrodes.E2'],
    ['level.E1', 'tb4.3', 'tank-electrodes.E1'],
    ["level.E2'", 'tb4.4', "source-electrodes.E2'"],
    ["level.E1'", 'tb4.5', "source-electrodes.E1'"],
    ['level.S1', 'tb6.3', 'relay-x.A1'],
    ['level.S2', 'tb6.4', 'pb3.1', 'relay-x.13'],
    ['pb3.2', 'relay-x.14', 'buzzer.1'],
    ['lamp-y.2', 'thry.97'],
    ['mc.P1T', 'thry.H1I'],
    ['mc.P2T', 'thry.H2I'],
    ['thry.H1O', 'tb9.1', 'tb1.1', 'motor.L1'],
    ['thry.H2O', 'tb9.2', 'tb1.2', 'motor.L2'],
  ],
  fixedConnections: [],
  dangerPairs: [
    ['supply.A', 'supply.B'], ['nfb.T1', 'nfb.T2'], ['earth.PE', 'supply.A'], ['earth.PE', 'supply.B'], ['earth.PE', 'nfb.T1'], ['earth.PE', 'nfb.T2'],
  ],
  segments: q1WiringSegments,
};
