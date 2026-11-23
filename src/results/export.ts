import type { PracticeRecord } from '../practical/session';
import type { ExamResult } from '../theory/exam';
import type { TheoryResult } from '../theory/records';

interface ResultsExportData {
  theory: TheoryResult[];
  exams: ExamResult[];
  practical: PracticeRecord[];
}

const practicalNames = {
  'b11-q1-liquid-level': '第一題｜液位控制',
  'b11-q2-internal-wireway-v5': '第二題｜馬達正反轉',
} as const;

function durationLabel(startedAt: number, completedAt: number) {
  const seconds = Math.max(1, Math.round((completedAt - startedAt) / 1000));
  if (seconds < 60) return `${seconds} 秒`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder === 0 ? `${minutes} 分鐘` : `${minutes} 分 ${remainder} 秒`;
}

function completedAtLabel(value: number) {
  return new Date(value).toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function createResultsCsv({ theory, exams, practical }: ResultsExportData) {
  const rows: (string | number)[][] = [[
    '類型', '項目', '完成時間', '成績', '答對題數', '結果',
    '作答時間', '檢查次數', '錯誤次數', '提示次數',
  ]];

  theory.forEach((record) => rows.push([
    '學科', '8 題學科練習', completedAtLabel(record.completedAt),
    `答對 ${record.score} 題（共 ${record.total} 題）`, record.score, '',
    durationLabel(record.startedAt, record.completedAt), '', '', '',
  ]));

  exams.forEach((record) => rows.push([
    '學科', '80 題模擬考', completedAtLabel(record.completedAt),
    `${record.score} 分`, record.correct, record.correct >= 48 ? '及格' : '未及格',
    durationLabel(record.startedAt, record.completedAt), '', '', '',
  ]));

  practical.forEach((record) => rows.push([
    '術科', practicalNames[record.questionId], completedAtLabel(record.completedAt),
    '', '', '完成', durationLabel(record.startedAt, record.completedAt),
    record.checkCount,
    record.errorCounts.danger + record.errorCounts.structure + record.errorCounts.function,
    record.hintCount,
  ]));

  return `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
}

export function downloadResultsCsv(csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toLocaleDateString('sv-SE');
  link.href = url;
  link.download = `室內配線學習成果-${date}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
