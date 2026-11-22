import type { WiringSegment } from '../types';

export const q1WiringSegments: WiringSegment[] = [
  { id: 'power', title: '第一段：電源與保護', description: '完成電源、NFB、控制保險絲與主回路進線。', netIndexes: [0, 1, 2, 4, 21, 22] },
  { id: 'manual', title: '第二段：手動控制', description: '完成選擇開關、停止、啟動、自保持與接觸器線圈。', netIndexes: [3, 6, 7, 8, 9, 10] },
  { id: 'automatic', title: '第三段：自動液位控制', description: '完成液位控制器、水槽與給水源電極的控制路徑。', netIndexes: [11, 12, 13, 14, 15, 16] },
  { id: 'alarm', title: '第四段：警報與指示', description: '完成紅、綠、黃燈、輔助繼電器、警報停止與蜂鳴器。', netIndexes: [17, 18, 19, 20] },
  { id: 'load', title: '第五段：馬達、端子台與接地', description: '完成積熱電驛、端子台、馬達與保護接地。', netIndexes: [12, 23, 24] },
];
