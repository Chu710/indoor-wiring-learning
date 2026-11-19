export interface WiringSegment {
  id: string;
  title: string;
  description: string;
  netIndexes: number[];
}

export const wiringSegments: WiringSegment[] = [
  { id: 'power', title: '第一段：電源與控制保險絲', description: '先完成電源、無熔絲開關與兩個控制保險絲。', netIndexes: [0, 1, 2, 3, 10, 11] },
  { id: 'control', title: '第二段：正反轉與互鎖', description: '再完成停止、正轉、反轉按鈕和接觸器互鎖。', netIndexes: [4, 5, 6, 7, 8, 17, 18] },
  { id: 'load', title: '第三段：燈號、蜂鳴器與馬達', description: '最後完成指示燈、蜂鳴器、積熱電驛與馬達。', netIndexes: [9, 12, 13, 14, 15, 16] },
];
