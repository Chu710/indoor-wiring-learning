import { useState } from 'react';
import { getBrowserStorage } from '../b11/session';
import { loadQuestionRecords, type PracticeRecord } from '../practical/session';
import { loadExamResults } from '../theory/exam';
import { loadTheoryResults } from '../theory/records';
import { createResultsCsv, downloadResultsCsv } from '../results/export';

const questionNames = {
  'b11-q1-liquid-level': '第一題｜液位控制',
  'b11-q2-internal-wireway-v5': '第二題｜馬達正反轉',
  'b11-q3-motor-fault-alarm': '第三題｜故障警報',
} as const;

function durationLabel(startedAt: number, completedAt: number) {
  const seconds = Math.max(1, Math.round((completedAt - startedAt) / 1000));
  if (seconds < 60) return `${seconds} 秒`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder === 0 ? `${minutes} 分鐘` : `${minutes} 分 ${remainder} 秒`;
}

function practicalErrors(record: PracticeRecord) {
  return record.errorCounts.danger + record.errorCounts.structure + record.errorCounts.function;
}

export function ResultsDashboard() {
  const [storage] = useState(() => getBrowserStorage(() => window.localStorage));
  const theory = storage ? loadTheoryResults(storage) : [];
  const exams = storage ? loadExamResults(storage) : [];
  const first = storage ? loadQuestionRecords(storage, 'b11-q1-liquid-level') : [];
  const second = storage ? loadQuestionRecords(storage, 'b11-q2-internal-wireway-v5') : [];
  const third = storage ? loadQuestionRecords(storage, 'b11-q3-motor-fault-alarm') : [];
  const practical = [...first, ...second, ...third].sort((a, b) => b.completedAt - a.completedAt);
  const bestTheory = theory.length ? Math.max(...theory.map((item) => item.score)) : null;
  const bestExam = exams.length ? Math.max(...exams.map((item) => item.score)) : null;
  const passedExams = exams.filter((item) => item.correct >= 48).length;
  const hasResults = theory.length + exams.length + practical.length > 0;

  const exportResults = () => {
    if (!hasResults) return;
    downloadResultsCsv(createResultsCsv({ theory, exams, practical }));
  };

  const practicalSummary = (records: PracticeRecord[]) => {
    if (!records.length) return '尚未完成';
    const fastest = Math.min(...records.map((item) => item.completedAt - item.startedAt));
    return `最快 ${durationLabel(0, fastest)}｜完成 ${records.length} 次`;
  };

  return <section className="results-page" aria-label="學習成果">
    <div className="results-intro">
      <div className="results-intro-copy">
        <p className="eyebrow">室內配線丙級｜本機學習紀錄</p>
        <h2>學習成果總覽</h2>
        <p>集中查看學科成績與術科練習表現。資料只保存在這台電腦的瀏覽器中，適合用來比較練習前後的進步。</p>
      </div>
      <div className="results-export">
        <button type="button" className="primary" disabled={!hasResults || !storage} onClick={exportResults}>匯出學習成果 CSV</button>
        <small>{hasResults ? '可使用 Excel 開啟，方便整理論文資料。' : '完成至少一項練習後即可匯出。'}</small>
      </div>
    </div>

    <div className="results-grid" aria-label="成果摘要">
      <article className="result-summary-card">
        <span>學科</span><h3>8 題學科練習</h3>
        <strong>{bestTheory === null ? '尚未完成' : `最佳 ${bestTheory} / 8 題`}</strong>
        <small>完成 {theory.length} 次</small>
      </article>
      <article className="result-summary-card">
        <span>學科</span><h3>80 題模擬考</h3>
        <strong>{bestExam === null ? '尚未完成' : `最高 ${bestExam} 分｜及格 ${passedExams} 次`}</strong>
        <small>完成 {exams.length} 次</small>
      </article>
      <article className="result-summary-card">
        <span>術科</span><h3>第一題｜液位控制</h3>
        <strong>{practicalSummary(first)}</strong>
        <small>依完成紀錄計算最快時間</small>
      </article>
      <article className="result-summary-card">
        <span>術科</span><h3>第二題｜馬達正反轉</h3>
        <strong>{practicalSummary(second)}</strong>
        <small>依完成紀錄計算最快時間</small>
      </article>
      <article className="result-summary-card">
        <span>術科</span><h3>第三題｜故障警報</h3>
        <strong>{practicalSummary(third)}</strong>
        <small>依完成紀錄計算最快時間</small>
      </article>
    </div>

    <div className="results-history">
      <div><p className="eyebrow">術科練習明細</p><h3>最近完成紀錄</h3></div>
      {practical.length === 0 ? <p className="empty-results">尚無完成紀錄</p> : <div className="results-table-wrap"><table className="results-table">
        <thead><tr><th>題目</th><th>完成時間</th><th>作答時間</th><th>檢查</th><th>錯誤</th><th>提示</th></tr></thead>
        <tbody>{practical.slice(0, 10).map((record, index) => <tr key={`${record.questionId}-${record.completedAt}-${index}`}>
          <td>{questionNames[record.questionId]}</td>
          <td><time dateTime={new Date(record.completedAt).toISOString()}>{new Date(record.completedAt).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></td>
          <td>{durationLabel(record.startedAt, record.completedAt)}</td>
          <td>{record.checkCount} 次</td>
          <td>錯誤 {practicalErrors(record)} 次</td>
          <td>提示 {record.hintCount} 次</td>
        </tr>)}</tbody>
      </table></div>}
    </div>
    {!storage && <p className="storage-warning">瀏覽器儲存目前不可用，暫時無法讀取成果。</p>}
  </section>;
}
