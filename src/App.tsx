import { useEffect, useMemo, useState } from 'react';
import { b11Question } from './b11/question';
import { validateWiring } from './b11/validate';
import { initialMotorState, nextMotorState, type MotorAction } from './b11/simulate';
import { wiringSegments } from './b11/segments';
import { appendRecord, clearDraft, getBrowserStorage, loadDraft, loadRecords, saveDraft } from './b11/session';
import type { B11Question, Diagnostic, Wire, WireColor } from './b11/types';
import { PartsPanel } from './components/PartsPanel';
import { TaskPanel } from './components/TaskPanel';
import { Workspace } from './components/Workspace';
import './styles.css';

export default function App() {
  const [storage] = useState(() => getBrowserStorage(() => window.localStorage));
  const [restored] = useState(() => { const draft = storage ? loadDraft(storage) : null; return draft?.questionId === b11Question.id ? draft : null; });
  const [question, setQuestion] = useState<B11Question>(() => ({ ...b11Question, parts: b11Question.parts.map((part) => ({ ...part, ...(restored?.positions[part.id] ?? {}) })) }));
  const [wires, setWires] = useState<Wire[]>(restored?.wires ?? []);
  const [color, setColor] = useState<WireColor>('red');
  const [checked, setChecked] = useState(false);
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
  const [historyCount, setHistoryCount] = useState(() => storage ? loadRecords(storage).length : 0);
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
  const resetCheck = () => { setChecked(false); setDiagnostics([]); setHintLevel(0); setMotor(initialMotorState); };
  const addWire = (from: string, to: string, wireColor: WireColor) => {
    if (from === to || wires.some((wire) => (wire.from === from && wire.to === to) || (wire.from === to && wire.to === from))) return;
    const known = new Set(question.parts.flatMap((part) => part.terminals.map((pin) => pin.id)));
    if (!known.has(from) || !known.has(to)) return;
    setWires((existing) => [...existing, { id: crypto.randomUUID(), from, to, color: wireColor, createdAt: Date.now() }]);
    resetCheck();
  };
  const check = () => {
    const issues = validateWiring(question, wires);
    setDiagnostics(issues); setChecked(true); setHintLevel(0); setCheckCount((count) => count + 1);
    setErrorCounts((counts) => ({ danger: counts.danger + issues.filter((item) => item.kind === 'danger').length, structure: counts.structure + issues.filter((item) => item.kind === 'structure').length, function: counts.function + issues.filter((item) => item.kind === 'function').length }));
  };
  const checkSegment = () => {
    const segmentNets = segment.netIndexes.map((index) => question.referenceNets[index]);
    const issues = validateWiring(question, wires, segmentNets);
    setDiagnostics(issues); setChecked(false); setHintLevel(0); setSegmentComplete(issues.length === 0);
  };
  const nextSegment = () => { setSegmentIndex((index) => Math.min(wiringSegments.length - 1, index + 1)); setSegmentComplete(false); setDiagnostics([]); setHintLevel(0); };
  const reset = () => {
    if (!window.confirm('確定要重新開始這次練習嗎？')) return;
    if (storage) clearDraft(storage); setQuestion(b11Question); setWires([]); setColor('red'); setStartedAt(Date.now()); setAnswerVisible(false); setCheckCount(0); setErrorCounts({ danger: 0, structure: 0, function: 0 }); setHintCount(0); setCompleted(false); setSegmentIndex(0); setSegmentComplete(false); resetCheck();
  };
  const motorAction = (action: MotorAction) => setMotor((state) => nextMotorState(state, action));
  const loadReference = () => {
    const referenceWires = b11Question.referenceNets.flatMap((net) => net.slice(1).map((to, index) => ({ id: `reference-${net[0]}-${index}`, from: net[index], to, color: 'red' as WireColor, createdAt: Date.now() })));
    setWires(referenceWires); setAnswerVisible(true); resetCheck();
  };
  return <main className="app-shell">
    <header><div><p>室內配線丙級｜控制迴路練習</p><h1>{question.title}</h1><small>依官方 B11 第二題控制電路建立；主電路、馬達端子與接地尚未納入評分，請勿用於實體配線。</small></div><div className="header-meta"><span>{completed ? '示範完成' : '控制練習中'}</span><strong>{Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}</strong></div></header>
    <details className="official-schematic"><summary>查看官方 B11 第二題電路圖</summary><p>來源：勞動部 007003B11，第二題附圖（二），印刷頁 20。圖中包含三組主接點、接線端子台、馬達繞組與控制迴路；下方互動原型仍在依此圖修正。</p><img src="/b11-official-schematic.png" alt="官方 B11 第二題單相感應電動機正逆轉控制電路圖" /></details>
    <PartsPanel question={question} />
    <Workspace question={question} wires={wires} color={color} answerVisible={answerVisible} onAddWire={addWire} onRemoveWire={(id) => { setWires((existing) => existing.filter((wire) => wire.id !== id)); resetCheck(); }} onMovePart={(id, x, y) => setQuestion((existing) => ({ ...existing, parts: existing.parts.map((part) => part.id === id ? { ...part, x, y } : part) }))} />
    <TaskPanel diagnostics={diagnostics} checked={checked} hintLevel={hintLevel} motor={motor} color={color} answerVisible={answerVisible} onColor={setColor} onCheck={check} onCheckSegment={checkSegment} onNextSegment={nextSegment} segment={segment} segmentNumber={segmentIndex + 1} segmentCount={wiringSegments.length} segmentComplete={segmentComplete} onHint={() => { setHintLevel((level) => Math.min(3, level + 1)); setHintCount((count) => count + 1); }} onShowAnswer={() => { setAnswerVisible(true); setHintCount((count) => count + 1); }} onReset={reset} onClear={() => { setWires([]); resetCheck(); setSegmentComplete(false); }} onLoadReference={loadReference} onMotorAction={motorAction} />
    <div className="practice-footer" role="status">檢查 {checkCount} 次 · 錯誤 {errorCounts.danger + errorCounts.structure + errorCounts.function} 次 · 提示 {hintCount} 次 · 已完成 {historyCount} 次{storageWarning && <strong>　本機儲存失敗，這次紀錄可能無法保留。</strong>}</div>
  </main>;
}
