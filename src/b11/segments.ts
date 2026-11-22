import type { WiringSegment } from '../practical/types';

export type { WiringSegment } from '../practical/types';

export const wiringSegments: WiringSegment[] = [
  { id: 'power', title: '第一段：電源分配', description: '先完成電源、無熔絲開關、兩個控制保險絲及接觸器主接點的進線。', netIndexes: [0, 1, 2, 3, 10, 11] },
  { id: 'control', title: '第二段：正反轉與互鎖', description: '再完成停止、正轉、反轉按鈕和接觸器互鎖。', netIndexes: [4, 5, 6, 7, 8, 13, 14] },
  { id: 'signal', title: '第三段：指示燈與過載警報', description: '最後完成正轉燈、反轉燈、停止燈與蜂鳴器。', netIndexes: [9, 12] },
  { id: 'main', title: '第四段：接觸器主接點', description: '先完成兩組接觸器的三組主接點與積熱電驛輸入。', netIndexes: [15, 17] },
  { id: 'motor', title: '第五段：端子台、馬達與接地', description: '完成積熱電驛輸出、TB5、TB1、馬達端點、TB5 跨接及保護接地。', netIndexes: [16, 18, 19, 20, 21] },
];
