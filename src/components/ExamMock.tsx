import { useEffect, useState } from 'react';
import { getBrowserStorage } from '../b11/session';
import { examDraftKey, examDurationMs, examQuestions, examResultsKey, loadExamDraft, loadExamResults, scoreExam, type ExamDraft, type ExamResult } from '../theory/exam';

const sourceNames: Record<string, string> = {
  '007003A13': '室內配線專業題',
  '900060A12': '職業安全衛生',
  '900070A11': '工作倫理與職業道德',
  '900080A18': '環境保護',
  '900090A14': '節能減碳',
};
const blankAnswers = () => Array<number | null>(80).fill(null);

export function ExamMock() {
  const [storage] = useState(() => getBrowserStorage(() => window.localStorage));
  const [draft, setDraft] = useState<ExamDraft | null>(() => storage ? loadExamDraft(storage) : null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [history, setHistory] = useState<ExamResult[]>(() => storage ? loadExamResults(storage) : []);
  const [now, setNow] = useState(Date.now());
  const [warning, setWarning] = useState(false);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);

  const finish = (current: ExamDraft, timedOut = false) => {
    const completedAt = Date.now();
    const marks = scoreExam(current.answers);
    const completed: ExamResult = { ...current, completedAt, correct: marks.correct, score: marks.score, timedOut };
    setResult(completed);
    setDraft(null);
    setReviewIndex(null);
    if (storage) {
      try {
        storage.setItem(examResultsKey, JSON.stringify([...loadExamResults(storage), completed]));
        storage.removeItem(examDraftKey);
        setHistory(loadExamResults(storage));
      } catch { setWarning(true); }
    } else setWarning(true);
  };

  useEffect(() => {
    if (!draft || result) return;
    if (!storage) { setWarning(true); return; }
    try { storage.setItem(examDraftKey, JSON.stringify(draft)); } catch { setWarning(true); }
  }, [draft, result, storage]);

  useEffect(() => {
    if (!draft || result) return;
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [draft, result]);

  useEffect(() => {
    if (draft && !result && now >= draft.startedAt + examDurationMs) finish(draft, true);
  }, [now, draft, result]);

  const start = () => {
    const startedAt = Date.now();
    setNow(startedAt);
    setResult(null);
    setReviewIndex(null);
    setDraft({ startedAt, questionIndex: 0, answers: blankAnswers() });
  };
  const remaining = draft ? Math.max(0, Math.ceil((draft.startedAt + examDurationMs - now) / 1000)) : 0;
  const answered = draft?.answers.filter((answer) => answer !== null).length ?? 0;
  const shownIndex = result ? reviewIndex : draft?.questionIndex ?? null;
  const question = shownIndex !== null ? examQuestions[shownIndex] : null;
  const shownAnswer = shownIndex !== null ? (result?.answers[shownIndex] ?? draft?.answers[shownIndex] ?? null) : null;
  const finishClick = () => {
    if (!draft) return;
    const missing = 80 - answered;
    if (missing > 0 && !window.confirm(`還有 ${missing} 題未作答。確定交卷嗎？`)) return;
    finish(draft);
  };
  const cancel = () => {
    if (!window.confirm('確定放棄本次模擬考？已填的答案會清除，且不記錄成績。')) return;
    try { storage?.removeItem(examDraftKey); } catch { setWarning(true); }
    setDraft(null);
  };

  return <section className="theory-page exam-page" aria-label="80 題模擬考">
    <div className="theory-intro"><div><p className="eyebrow">室內配線丙級｜學科模擬考</p><h2>80 題限時模擬考</h2><p>依官方公開題庫選出 64 題專業題與 16 題共用題。這是固定 80 題的試行版，作答時不顯示正解；交卷後再看分數與錯題。正式測驗的抽題可能不同。</p></div></div>
    {!draft && !result && <div className="theory-card"><h3>考試方式</h3><div className="exam-rules-grid"><span>80 題單選</span><span>100 分鐘</span><span>每題 1.25 分</span><span>60 分及格</span></div><p>未作答與答錯都不計分，滿分 100 分，答對 48 題及格。開始後，切換頁面或重新整理仍會繼續計時。</p><button className="primary" onClick={start}>開始模擬考</button></div>}
    {draft && <div className="theory-card"><div className="theory-progress"><strong>剩餘 {Math.floor(remaining / 60).toString().padStart(2, '0')}:{(remaining % 60).toString().padStart(2, '0')}</strong><span>已答 {answered} / 80 題</span></div><details className="exam-jump-panel"><summary>展開題號導覽</summary><div className="exam-jump" aria-label="題目導覽">{examQuestions.map((item, index) => <button key={item.id} type="button" className={`${draft.questionIndex === index ? 'active' : ''} ${draft.answers[index] !== null ? 'answered' : ''}`} aria-label={`第 ${index + 1} 題${draft.answers[index] !== null ? '，已作答' : '，未作答'}`} aria-current={draft.questionIndex === index ? 'step' : undefined} onClick={() => setDraft({ ...draft, questionIndex: index })}>{index + 1}</button>)}</div></details></div>}
    {result && <div className="theory-card" role="status"><p className="eyebrow">{result.timedOut ? '時間到，已自動交卷' : '本次成績'}</p><h3>{result.score} 分｜{result.correct} / 80 題答對｜{result.correct >= 48 ? '及格' : '未及格'}</h3><p>作答時間：{Math.min(100, Math.ceil((result.completedAt - result.startedAt) / 60000))} 分鐘；未作答 {result.answers.filter((answer) => answer === null).length} 題。</p><h3>錯題與未作答</h3>{result.correct === 80 ? <p>全部答對。</p> : <div className="exam-jump" aria-label="錯題導覽">{examQuestions.map((item, index) => result.answers[index] !== item.answer && <button key={item.id} className={reviewIndex === index ? 'active' : ''} onClick={() => setReviewIndex(index)}>第 {index + 1} 題</button>)}</div>}<div className="theory-result-actions"><button onClick={start}>重新開始 80 題</button></div></div>}
    {question && <div className="theory-card"><p className="theory-source">第 {shownIndex! + 1} / 80 題 · {sourceNames[question.sourceCode]} · <a href={`https://owinform.wdasec.gov.tw/owInform/DLowFile/${question.sourceCode}.pdf`} target="_blank" rel="noreferrer">官方題庫 PDF 第 {question.sourcePage} 頁</a></p><h3>{question.prompt}</h3><div className="theory-choices">{question.choices.map((choice, index) => <button key={index} type="button" disabled={!!result} aria-pressed={shownAnswer === index} className={`${shownAnswer === index ? 'chosen' : ''} ${result && question.answer === index ? 'correct' : ''} ${result && shownAnswer === index && shownAnswer !== question.answer ? 'incorrect' : ''}`} onClick={() => draft && setDraft({ ...draft, answers: draft.answers.map((answer, questionIndex) => questionIndex === draft.questionIndex ? index : answer) })}>{index + 1}. {choice}</button>)}</div>{result && <p className="theory-feedback">你的答案：{shownAnswer === null ? '未作答' : question.choices[shownAnswer]}；正解：{question.choices[question.answer]}</p>}{draft && <div className="theory-result-actions"><button disabled={draft.questionIndex === 0} onClick={() => setDraft({ ...draft, questionIndex: draft.questionIndex - 1 })}>上一題</button><button disabled={draft.questionIndex === 79} onClick={() => setDraft({ ...draft, questionIndex: draft.questionIndex + 1 })}>下一題</button><button className="primary" onClick={finishClick}>交卷</button><button onClick={cancel}>放棄本次測驗</button></div>}</div>}
    <p className="theory-history">這台電腦已完成 {history.length} 次模擬考。{warning && <strong>本機儲存失敗，本次進度或成績可能無法保留。</strong>}</p>
    {history.length > 0 && <div className="theory-records"><h3>最近完成紀錄</h3><ol>{history.slice(-5).reverse().map((item, index) => <li key={`${item.completedAt}-${index}`}>{item.score} 分 · {item.correct} 題答對 · {item.correct >= 48 ? '及格' : '未及格'}</li>)}</ol></div>}
  </section>;
}
