import { useEffect, useMemo, useRef, useState } from 'react';
import { b11Question } from './b11/question';
import { validateWiring } from './b11/validate';
import { initialMotorState, type MotorAction } from './b11/simulate';
import { nextWiredMotorState } from './b11/circuit';
import { wiringSegments } from './b11/segments';
import { appendRecord, clearDraft, getBrowserStorage, loadDraft, loadRecords, saveDraft } from './b11/session';
import type { B11Question, Diagnostic, Wire, WireColor } from './b11/types';
import { PartsPanel } from './components/PartsPanel';
import { TaskPanel } from './components/TaskPanel';
import { Workspace } from './components/Workspace';
import { TheoryQuiz } from './components/TheoryQuiz';
import './styles.css';

export default function App() {
  const [view, setView] = useState<'practical' | 'theory'>(() => window.location.hash === '#theory' ? 'theory' : 'practical');
  const theoryEnteredAt = useRef<number | null>(view === 'theory' ? Date.now() : null);
  const [storage] = useState(() => getBrowserStorage(() => window.localStorage));
  const [restored] = useState(() => { const draft = storage ? loadDraft(storage) : null; return draft?.questionId === b11Question.id ? draft : null; });
  const [question, setQuestion] = useState<B11Question>(() => ({ ...b11Question, parts: b11Question.parts.map((part) => ({ ...part, ...(restored?.positions[part.id] ?? {}) })) }));
  const [wires, setWires] = useState<Wire[]>(restored?.wires ?? []);
  const [color, setColor] = useState<WireColor>('red');
  const [checked, setChecked] = useState(false);
  const [segmentChecked, setSegmentChecked] = useState(false);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [answerVisible, setAnswerVisible] = useState(false);
  const [motor, setMotor] = useState(initialMotorState);
  const [startedAt, setStartedAt] = useState(restored?.startedAt ?? Date.now());
  const [now, setNow] = useState(Date.now());
  const [checkCount, setCheckCount] = useState(restored?.checkCount ?? 0);
  const [errorCounts, setErrorCounts] = useState(restored?.errorCounts ?? { danger: 0, structure: 0, function: 0 });
  const [hintCount, setHintCount] = useState(restored?.hintCount ?? 0);
  const [storageWarning, setStorageWarning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [historyCount, setHistoryCount] = useState(() => storage ? loadRecords(storage).filter((record) => record.questionId === b11Question.id).length : 0);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [segmentComplete, setSegmentComplete] = useState(false);
  const segment = wiringSegments[segmentIndex];
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    if (completed) return;
    const positions = Object.fromEntries(question.parts.map((part) => [part.id, { x: part.x, y: part.y }]));
    if (!storage || !saveDraft(storage, { questionId: question.id, startedAt, wires, positions, checkCount, errorCounts, hintCount })) setStorageWarning(true);
  }, [question, startedAt, wires, checkCount, errorCounts, hintCount, completed, storage]);
  useEffect(() => {
    if (completed || !checked || diagnostics.length || !(['forward', 'stop', 'reverse', 'interlock', 'trip'] as MotorAction[]).every((action) => motor.tested.includes(action))) return;
    const positions = Object.fromEntries(question.parts.map((part) => [part.id, { x: part.x, y: part.y }]));
    const record = { questionId: question.id, startedAt, wires, positions, checkCount, errorCounts, hintCount, completedAt: Date.now(), completed: true, simulationResults: motor.tested };
    if (!storage || !appendRecord(storage, record)) { setStorageWarning(true); return; }
    else setHistoryCount((count) => count + 1);
    clearDraft(storage);
    setCompleted(true);
  }, [checked, completed, diagnostics, motor, question, startedAt, wires, checkCount, errorCounts, hintCount]);
  const elapsed = useMemo(() => Math.floor((now - startedAt) / 1000), [now, startedAt]);
  const resetCheck = () => { setChecked(false); setSegmentChecked(false); setDiagnostics([]); setHintLevel(0); setMotor(initialMotorState); };
  const addWire = (from: string, to: string, wireColor: WireColor) => {
    if (from === to || wires.some((wire) => (wire.from === from && wire.to === to) || (wire.from === to && wire.to === from))) return;
    const known = new Set(question.parts.flatMap((part) => part.terminals.map((pin) => pin.id)));
    if (!known.has(from) || !known.has(to)) return;
    setWires((existing) => [...existing, { id: crypto.randomUUID(), from, to, color: wireColor, createdAt: Date.now() }]);
    setSegmentComplete(false);
    resetCheck();
  };
  const check = () => {
    const issues = validateWiring(question, wires);
    if (issues.length === 0) setMotor(nextWiredMotorState(initialMotorState, 'release', question, wires));
    setDiagnostics(issues); setChecked(true); setSegmentChecked(false); setHintLevel(0); setCheckCount((count) => count + 1);
    setErrorCounts((counts) => ({ danger: counts.danger + issues.filter((item) => item.kind === 'danger').length, structure: counts.structure + issues.filter((item) => item.kind === 'structure').length, function: counts.function + issues.filter((item) => item.kind === 'function').length }));
  };
  const checkSegment = () => {
    const segmentNets = segment.netIndexes.map((index) => question.referenceNets[index]);
    const issues = validateWiring(question, wires, segmentNets);
    setDiagnostics(issues); setChecked(false); setSegmentChecked(true); setHintLevel(0); setSegmentComplete(issues.length === 0);
  };
  const nextSegment = () => { setSegmentIndex((index) => Math.min(wiringSegments.length - 1, index + 1)); setSegmentComplete(false); setSegmentChecked(false); setDiagnostics([]); setHintLevel(0); };
  const reset = () => {
    if (!window.confirm('確定要重新開始這次練習嗎？')) return;
    if (storage) clearDraft(storage); setQuestion(b11Question); setWires([]); setColor('red'); setStartedAt(Date.now()); setAnswerVisible(false); setCheckCount(0); setErrorCounts({ danger: 0, structure: 0, function: 0 }); setHintCount(0); setCompleted(false); setSegmentIndex(0); setSegmentComplete(false); resetCheck();
  };
  const motorAction = (action: MotorAction) => setMotor((state) => nextWiredMotorState(state, action, question, wires));
  const loadReference = () => {
    const referenceWires = b11Question.referenceNets.flatMap((net) => net.slice(1).map((to, index) => ({ id: `reference-${net[0]}-${index}`, from: net[index], to, color: (net.includes('earth.PE') ? 'green' : 'red') as WireColor, createdAt: Date.now() })));
    setWires(referenceWires); setAnswerVisible(true); setSegmentComplete(false); resetCheck();
  };
  const openTheory = () => { if (view === 'theory') return; theoryEnteredAt.current = Date.now(); window.history.replaceState(null, '', '#theory'); setView('theory'); };
  const openPractical = () => { if (view === 'practical') return; if (theoryEnteredAt.current !== null) setStartedAt((time) => time + Date.now() - theoryEnteredAt.current!); theoryEnteredAt.current = null; setNow(Date.now()); window.history.replaceState(null, '', '#practical'); setView('practical'); };
  return <main className="app-shell">
    <header><div><p>室內配線丙級｜學術科互動練習</p><h1>{view === 'theory' ? '學科練習｜電動機裝置' : question.title}</h1><small>{view === 'theory' ? '先用 8 題核對電動機概念，再回到 B11 術科配線。' : '依官方附圖建立主電路、控制迴路與接地；端子號為圖面教學標示，實體配線仍須核對器材與指導教師。'}</small></div><div className="header-meta"><nav className="mode-nav" aria-label="練習類型"><button aria-pressed={view === 'practical'} onClick={openPractical}>術科配線</button><button aria-pressed={view === 'theory'} onClick={openTheory}>學科練習</button></nav><span>{view === 'theory' ? '8 題入門練習' : completed ? '圖面練習完成' : '圖面練習中'}</span>{view === 'practical' && <strong>{Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}</strong>}</div></header>
    {view === 'theory' ? <TheoryQuiz /> : <>
    <details className="official-schematic"><summary>查看官方 B11 第二題電路圖</summary><p>來源：勞動部 007003B11，第二題附圖（二），印刷頁 20。圖中未指定實際器材的全部端子號，請用圖面符號與現場器材對照。</p><img src="/b11-official-schematic.png" alt="官方 B11 第二題單相感應電動機正逆轉控制電路圖" /></details>
    <PartsPanel question={question} />
    <Workspace question={question} wires={wires} color={color} answerVisible={answerVisible} onAddWire={addWire} onRemoveWire={(id) => { setWires((existing) => existing.filter((wire) => wire.id !== id)); setSegmentComplete(false); resetCheck(); }} onMovePart={(id, x, y) => setQuestion((existing) => ({ ...existing, parts: existing.parts.map((part) => part.id === id ? { ...part, x, y } : part) }))} />
    <TaskPanel diagnostics={diagnostics} checked={checked} segmentChecked={segmentChecked} hintLevel={hintLevel} motor={motor} color={color} answerVisible={answerVisible} onColor={setColor} onCheck={check} onCheckSegment={checkSegment} onNextSegment={nextSegment} segment={segment} segmentNumber={segmentIndex + 1} segmentCount={wiringSegments.length} segmentComplete={segmentComplete} onHint={() => { setHintLevel((level) => Math.min(3, level + 1)); setHintCount((count) => count + 1); }} onShowAnswer={() => { setAnswerVisible(true); setHintCount((count) => count + 1); }} onReset={reset} onClear={() => { setWires([]); resetCheck(); setSegmentComplete(false); }} onLoadReference={loadReference} onMotorAction={motorAction} />
    <div className="practice-footer" role="status">檢查 {checkCount} 次 · 錯誤 {errorCounts.danger + errorCounts.structure + errorCounts.function} 次 · 提示 {hintCount} 次 · 已完成 {historyCount} 次{storageWarning && <strong>　本機儲存失敗，這次紀錄可能無法保留。</strong>}</div>
    </>}
  </main>;
}
