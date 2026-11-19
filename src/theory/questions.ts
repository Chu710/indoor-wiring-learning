export interface TheoryQuestion {
  id: string;
  sourceNumber: number;
  sourcePage: number;
  prompt: string;
  choices: [string, string, string, string];
  answer: number;
  explanation: string;
}

// Paraphrased from the official 007003A13 PDF, 工作項目 11：電動機裝置.
// sourcePage is the PDF page number (cover included); sourceNumber is the
// question number within 工作項目 11. The official PDF supplies the answer key.
export const motorTheoryQuestions: TheoryQuestion[] = [
  { id: 'motor-01', sourceNumber: 1, sourcePage: 24, prompt: '四極感應馬達接 60 Hz 電源，轉速為 1710 rpm。轉子導體感應電流的頻率是多少？', choices: ['3 Hz', '6 Hz', '30 Hz', '60 Hz'], answer: 0, explanation: '四極、60 Hz 的同步轉速為 1800 rpm；轉差率為 (1800 − 1710) ÷ 1800 = 0.05，轉子頻率為 60 × 0.05 = 3 Hz。' },
  { id: 'motor-02', sourceNumber: 2, sourcePage: 24, prompt: '單相感應馬達的起動繞組串接電容器，主要是讓兩組繞組電流的相位差接近多少度？', choices: ['90 度', '120 度', '180 度', '270 度'], answer: 0, explanation: '電容使起動繞組與運轉繞組產生相位差，形成起動轉矩；題庫答案為接近 90 度。' },
  { id: 'motor-16', sourceNumber: 16, sourcePage: 25, prompt: '平衡三相電源供應馬達時，定子相鄰兩相繞組的電流相位差為多少度？', choices: ['90 度', '120 度', '180 度', '360 度'], answer: 1, explanation: '平衡三相電源的三個相位平均分布在 360 度，因此相鄰相位差為 120 度。' },
  { id: 'motor-17', sourceNumber: 17, sourcePage: 25, prompt: '下列哪一種不是單相感應馬達？', choices: ['分相式馬達', '電容起動式馬達', '蔽極起動式馬達', '分激式馬達'], answer: 3, explanation: '分激式是直流馬達的分類；其餘選項屬單相感應馬達的起動方式。' },
  { id: 'motor-25', sourceNumber: 25, sourcePage: 26, prompt: '一般馬達的過載保護應選用哪一種裝置？', choices: ['模殼式斷路器', '漏電斷路器', '積熱保護器', '模殼式開關'], answer: 2, explanation: '積熱保護器用於感測馬達過載；它和短路保護、漏電保護的用途不同。' },
  { id: 'motor-30', sourceNumber: 30, sourcePage: 26, prompt: '三相鼠籠式感應馬達在題庫的分類中屬於哪一種轉速特性？', choices: ['恆速', '變速', '調速', '介於恆速與調速之間'], answer: 0, explanation: '題庫將三相鼠籠式感應馬達歸為恆速馬達；實際轉速仍會隨負載產生少量轉差。' },
  { id: 'motor-37', sourceNumber: 37, sourcePage: 26, prompt: '電動機主要將哪一種能量轉換成機械能？', choices: ['電能', '熱能', '磁能', '化學能'], answer: 0, explanation: '電動機以電能為輸入，輸出軸上的機械能。' },
  { id: 'motor-38', sourceNumber: 38, sourcePage: 26, prompt: '蔽極式馬達的旋轉磁場由哪一側移向哪一側？', choices: ['由蔽極移向主磁極', '由主磁極移向蔽極', '由通電電流方向決定', '方向不一定'], answer: 1, explanation: '蔽極線圈讓蔽極部分磁通延遲，磁場方向由主磁極移向蔽極。' },
];

export function scoreTheory(answers: number[], questions: TheoryQuestion[] = motorTheoryQuestions): number {
  return questions.reduce((score, question, index) => score + (answers[index] === question.answer ? 1 : 0), 0);
}
