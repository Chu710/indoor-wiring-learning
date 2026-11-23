import { useEffect, useState } from 'react';
import { getBrowserStorage } from '../b11/session';
import { motorTheoryQuestions, scoreTheory } from '../theory/questions';
import { appendTheoryResult, clearTheoryDraft, loadTheoryDraft, loadTheoryResults, saveTheoryDraft, type TheoryDraft, type TheoryResult } from '../theory/records';

const allQuestionIds = motorTheoryQuestions.map((question) => question.id);

export function TheoryQuiz() {
  const [storage] = useState(() => getBrowserStorage(() => window.localStorage));
  const [draft] = useState(() => storage ? loadTheoryDraft(storage) : null);
  const [history, setHistory] = useState(() => storage ? loadTheoryResults(storage) : []);
  const [mode, setMode] = useState<'full' | 'review'>(draft?.mode ?? 'full');
  const [questionIds, setQuestionIds] = useState<string[]>(draft?.questionIds ?? allQuestionIds);
  const [startedAt, setStartedAt] = useState(() => draft?.startedAt ?? Date.now());
  const [index, setIndex] = useState(draft?.index ?? 0);
  const [selection, setSelection] = useState<number | null>(draft?.selection ?? null);
  const [submitted, setSubmitted] = useState(draft?.submitted ?? false);
  const [answers, setAnswers] = useState<number[]>(draft?.answers ?? []);
  const [result, setResult] = useState<TheoryResult | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const questions = questionIds.map((id) => motorTheoryQuestions.find((item) => item.id === id)!);
  const question = questions[index];
  const wrongQuestions = result ? questions.filter((item, questionIndex) => result.answers[questionIndex] !== item.answer) : [];

  useEffect(() => {
    if (!storage) { setStorageWarning(true); return; }
    if (result) { if (!clearTheoryDraft(storage)) setStorageWarning(true); return; }
    const currentDraft: TheoryDraft = { startedAt, index, selection, submitted, answers, mode, questionIds };
    if (!saveTheoryDraft(storage, currentDraft)) setStorageWarning(true);
  }, [storage, result, startedAt, index, selection, submitted, answers, mode, questionIds]);

  const submit = () => {
    if (selection === null || submitted) return;
    setAnswers((current) => [...current, selection]);
    setSubmitted(true);
  };
  const next = () => {
    if (index < questions.length - 1) {
      setIndex((current) => current + 1);
      setSelection(null);
      setSubmitted(false);
      return;
    }
    const completed: TheoryResult = { source: '007003A13', startedAt, completedAt: Date.now(), answers, score: scoreTheory(answers, questions), total: questions.length };
    setResult(completed);
    if (mode === 'full') {
      if (!storage || !appendTheoryResult(storage, completed)) setStorageWarning(true);
      else setHistory((current) => [...current, completed]);
    }
  };
  const restart = (nextMode: 'full' | 'review', nextIds: string[]) => {
    setMode(nextMode);
    setQuestionIds(nextIds);
    setStartedAt(Date.now());
    setIndex(0);
    setSelection(null);
    setSubmitted(false);
    setAnswers([]);
    setResult(null);
    setStorageWarning(false);
  };

  return <section className="theory-page" aria-label="學科練習">
    <div className="theory-intro">
      <div>
        <p className="eyebrow">學科練習｜工作項目 11：電動機裝置</p>
        <h2>{mode === 'review' ? '重練答錯的題目' : '先做 8 題，再看每題解析'}</h2>
        <p>題目依勞動部官方 007003A13 學科題庫改寫，選項與答案已按原題號核對。{mode === 'review' ? '這次只練前一次答錯的題目，不計入完整測驗次數。' : '這是與 B11 術科搭配的入門練習，並非完整 618 題題庫。'}</p>
      </div>
      <a href="https://owinform.wdasec.gov.tw/owInform/DLowFile/007003A13.pdf" target="_blank" rel="noreferrer">查看官方題庫 PDF</a>
    </div>
    <div className="exam-rules" aria-label="正式考試規格">
      <h3>丙級學科正式考試規格</h3>
      <div className="exam-rules-grid"><span>正式考試：80 題</span><span>100 分鐘</span><span>每題 1.25 分</span><span>答對 48 題及格</span></div>
      <p>滿分 100 分，60 分及格，答錯不倒扣。一般配置為專業題 64 題，加上四項共用工作項目各 4 題、共 16 題。</p>
      <p>這裡的 8 題成績只是入門練習結果。可從上方切換到「80 題模擬考」進行限時測驗。</p>
      <small>規則來源：<a href="https://www.wdasec.gov.tw/News_Content.aspx?n=611E645F4BAB689F&s=C01442902F63E8F8&sms=47C68486FEC19CA4" target="_blank" rel="noreferrer">技能檢定中心考試說明</a>、<a href="https://www.wdasec.gov.tw/News_Content.aspx?n=25D08F3407C71E8F&s=5A79A08661B15374&sms=1BE761BDBCE7C913" target="_blank" rel="noreferrer">共用題抽題比例公告</a>、<a href="https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=N0080014" target="_blank" rel="noreferrer">及格分數規定</a>。</small>
    </div>
    {result ? <div className="theory-card" role="status">
      <p className="eyebrow">{mode === 'review' ? '錯題重練結果' : '本次成績'}</p>
      <h3>{result.score} / {result.total} 題答對</h3>
      <p>作答時間：{Math.max(1, Math.round((result.completedAt - result.startedAt) / 1000))} 秒</p>
      <h3>答錯題目</h3>
      {wrongQuestions.length === 0 ? <p>全部答對。</p> : <ul className="theory-review">{wrongQuestions.map((item) => {
        const questionIndex = questions.indexOf(item);
        return <li key={item.id}><strong>官方題庫第 {item.sourceNumber} 題：</strong>{item.prompt}<br />你的答案：{item.choices[result.answers[questionIndex]]}；正解：{item.choices[item.answer]}<br />{item.explanation}</li>;
      })}</ul>}
      <div className="theory-result-actions">
        {wrongQuestions.length > 0 && <button className="primary" onClick={() => restart('review', wrongQuestions.map((item) => item.id))}>重練 {wrongQuestions.length} 題錯題</button>}
        <button onClick={() => restart('full', allQuestionIds)}>重新練習 8 題</button>
      </div>
    </div> : <div className="theory-card">
      <div className="theory-progress"><span>{mode === 'review' ? '錯題重練 · ' : ''}第 {index + 1} / {questions.length} 題</span><span>已答對 {scoreTheory(answers, questions)} 題</span></div>
      <p className="theory-source">官方題庫「電動機裝置」第 {question.sourceNumber} 題 · PDF 第 {question.sourcePage} 頁</p>
      <h3>{question.prompt}</h3>
      <div className="theory-choices">{question.choices.map((choice, choiceIndex) => <button key={choiceIndex} type="button" disabled={submitted} aria-pressed={selection === choiceIndex} className={`${selection === choiceIndex ? 'chosen' : ''} ${submitted && choiceIndex === question.answer ? 'correct' : ''} ${submitted && selection === choiceIndex && choiceIndex !== question.answer ? 'incorrect' : ''}`} onClick={() => setSelection(choiceIndex)}>{choiceIndex + 1}. {choice}</button>)}</div>
      {submitted && <div className={`theory-feedback ${selection === question.answer ? 'correct' : 'incorrect'}`} role="status"><strong>{selection === question.answer ? '答對了' : `答錯了，正確答案是 ${question.answer + 1}. ${question.choices[question.answer]}`}</strong><p>{question.explanation}</p></div>}
      <div className="theory-actions">{submitted ? <button className="primary" onClick={next}>{index === questions.length - 1 ? '查看成績' : '下一題'}</button> : <button className="primary" disabled={selection === null} onClick={submit}>確認答案</button>}</div>
    </div>}
    <p className="theory-history">這台電腦已完成 {history.length} 次學科練習。{storageWarning && <strong>本機儲存失敗，本次成績可能無法保留。</strong>}</p>
    {history.length > 0 && <div className="theory-records"><h3>最近完成紀錄</h3><ol>{history.slice(-5).reverse().map((item, recordIndex) => <li key={`${item.completedAt}-${recordIndex}`}>第 {history.length - recordIndex} 次：{item.score} / {item.total} 題答對</li>)}</ol></div>}
  </section>;
}
