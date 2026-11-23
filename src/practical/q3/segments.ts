import type { WiringSegment } from '../types';

export const q3WiringSegments: WiringSegment[] = [
  { id: 'power', title: '第一段：電源與保護', description: '完成電源、NFB、控制保險絲及接觸器主接點進線。', netIndexes: [0, 1, 2, 3] },
  { id: 'start-stop', title: '第二段：啟動與停止', description: '完成 PB2、PB1、自保持接點、MC 線圈與運轉紅燈。', netIndexes: [4, 5, 6, 7, 8] },
  { id: 'overload', title: '第三段：積熱電驛保護', description: '完成 MC 主接點、積熱電驛 95-96-98 轉換接點與 X1 線圈。', netIndexes: [8, 9, 16, 17] },
  { id: 'alarm', title: '第四段：故障警報', description: '完成 X1、X2、PB3、蜂鳴器及綠黃指示燈。', netIndexes: [10, 11, 12, 13, 14, 15] },
  { id: 'load', title: '第五段：馬達與接地', description: '完成 TB5、TB1、2HP 馬達及保護接地。', netIndexes: [18, 19, 20] },
];
