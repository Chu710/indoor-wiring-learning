import { useEffect, useMemo, useState } from 'react';
import { getBrowserStorage } from '../b11/session';
import type { MotorAction } from '../b11/simulate';
import { getPracticalQuestion } from '../practical/questions';
import {
  appendQuestionRecord, clearQuestionDraft, draftKey, loadQuestionDraft,
  loadQuestionRecords, saveQuestionDraft,
} from '../practical/session';
import { initialPracticalSimulation, nextPracticalSimulation } from '../practical/simulation';
import type { LiquidLevelAction } from '../practical/q1/simulate';
import type { Diagnostic, PracticalQuestion, PracticalQuestionId, Wire, WireColor } from '../practical/types';
import { validatePracticalWiring } from '../practical/validate';
import { LiquidLevelTaskPanel } from './LiquidLevelTaskPanel';
import { PartsPanel } from './PartsPanel';
import { TaskPanel } from './TaskPanel';
import { Workspace } from './Workspace';

const emptyErrors = { danger: 0, structure: 0, function: 0 };

function positionedQuestion(base: PracticalQuestion, positions?: Record<string, { x: number; y: number }>): PracticalQuestion {
  return { ...base, parts: base.parts.map((part) => ({ ...part, ...(positions?.[part.id] ?? {}) })) };
}

export function PracticalExercise({ questionId }: { questionId: PracticalQuestionId }) {
  const baseQuestion = getPracticalQuestion(questionId);
  if (!baseQuestion) throw new Error(`Unknown practical question: ${questionId}`);
  const [storage] = useState(() => getBrowserStorage(() => window.localStorage));
  const [initial] = useState(() => {
    const hasCurrentDraft = storage?.getItem(draftKey(questionId)) !== null;
    const draft = storage ? loadQuestionDraft(storage, questionId) : null;
    return { draft, corrupt: Boolean(hasCurrentDraft && !draft) };
  });
  const restored = initial.draft;
  const [question, setQuestion] = useState(() => positionedQuestion(baseQuestion, restored?.positions));
  const [wires, setWires] = useState<Wire[]>(restored?.wires ?? []);
  const [color, setColor] = useState<WireColor>('red');
  const [checked, setChecked] = useState(false);
  const [segmentChecked, setSegmentChecked] = useState(false);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [answerVisible, setAnswerVisible] = useState(false);
  const [simulation, setSimulation] = useState(() => initialPracticalSimulation(baseQuestion));
  const [startedAt, setStartedAt] = useState(restored?.startedAt ?? Date.now());
  const [now, setNow] = useState(Date.now());
  const [checkCount, setCheckCount] = useState(restored?.checkCount ?? 0);
  const [errorCounts, setErrorCounts] = useState(restored?.errorCounts ?? emptyErrors);
  const [hintCount, setHintCount] = useState(restored?.hintCount ?? 0);
  const [storageWarning, setStorageWarning] = useState(initial.corrupt);
  const [completed, setCompleted] = useState(false);
  const [historyCount, setHistoryCount] = useState(() => storage ? loadQuestionRecords(storage, questionId).length : 0);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [segmentComplete, setSegmentComplete] = useState(false);
  const segment = question.segments[segmentIndex];

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (completed) return;
    const positions = Object.fromEntries(question.parts.map((part) => [part.id, { x: part.x, y: part.y }]));
    if (!storage || !saveQuestionDraft(storage, { questionId, startedAt, wires, positions, checkCount, errorCounts, hintCount })) setStorageWarning(true);
  }, [question, startedAt, wires, checkCount, errorCounts, hintCount, completed, questionId, storage]);

  useEffect(() => {
    if (completed || !checked || diagnostics.length) return;
    const required = simulation.kind === 'liquid-level'
      ? ['start', 'stop', 'automatic', 'tank-low', 'tank-high', 'source-dry', 'silence', 'trip', 'reset']
      : ['forward', 'stop', 'reverse', 'interlock', 'trip'];
    if (!required.every((action) => simulation.state.tested.includes(action as never))) return;
    const positions = Object.fromEntries(question.parts.map((part) => [part.id, { x: part.x, y: part.y }]));
    const record = { questionId, startedAt, wires, positions, checkCount, errorCounts, hintCount, completedAt: Date.now(), completed: true, simulationResults: simulation.state.tested };
    if (!storage || !appendQuestionRecord(storage, record)) { setStorageWarning(true); return; }
    clearQuestionDraft(storage, questionId);
    setHistoryCount((count) => count + 1);
    setCompleted(true);
  }, [checked, completed, diagnostics, simulation, question, questionId, startedAt, wires, checkCount, errorCounts, hintCount, storage]);

  const elapsed = useMemo(() => Math.max(0, Math.floor((now - startedAt) / 1000)), [now, startedAt]);
  const resetCheck = () => {
    setChecked(false); setSegmentChecked(false); setDiagnostics([]); setHintLevel(0);
    setSimulation(initialPracticalSimulation(question));
  };
  const addWire = (from: string, to: string, wireColor: WireColor) => {
    if (from === to || wires.some((wire) => [wire.from, wire.to].includes(from) && [wire.from, wire.to].includes(to))) return;
    const known = new Set(question.parts.flatMap((part) => part.terminals.map((pin) => pin.id)));
    if (!known.has(from) || !known.has(to)) return;
    setWires((existing) => [...existing, { id: crypto.randomUUID(), from, to, color: wireColor, createdAt: Date.now() }]);
    setSegmentComplete(false); resetCheck();
  };
  const check = () => {
    const issues = validatePracticalWiring(question, wires);
    setDiagnostics(issues); setChecked(true); setSegmentChecked(false); setHintLevel(0); setCheckCount((count) => count + 1);
    setErrorCounts((counts) => ({
      danger: counts.danger + issues.filter((item) => item.kind === 'danger').length,
      structure: counts.structure + issues.filter((item) => item.kind === 'structure').length,
      function: counts.function + issues.filter((item) => item.kind === 'function').length,
    }));
  };
  const checkSegment = () => {
    const issues = validatePracticalWiring(question, wires, segment.netIndexes.map((index) => question.referenceNets[index]));
    setDiagnostics(issues); setChecked(false); setSegmentChecked(true); setHintLevel(0); setSegmentComplete(issues.length === 0);
  };
  const reset = () => {
    if (!window.confirm('確定要重新開始這次練習嗎？')) return;
    if (storage) clearQuestionDraft(storage, questionId);
    setQuestion(positionedQuestion(baseQuestion)); setWires([]); setColor('red'); setStartedAt(Date.now()); setNow(Date.now());
    setAnswerVisible(false); setCheckCount(0); setErrorCounts(emptyErrors); setHintCount(0); setCompleted(false); setSegmentIndex(0); setSegmentComplete(false); resetCheck();
  };
  const loadReference = () => {
    const referenceWires = question.referenceNets.flatMap((net) => net.slice(1).map((to, index) => ({
      id: `reference-${net[0]}-${index}`, from: net[index], to,
      color: (net.includes('earth.PE') ? 'green' : 'red') as WireColor, createdAt: Date.now(),
    })));
    setWires(referenceWires); setAnswerVisible(true); setSegmentComplete(false); resetCheck();
  };
  const runAction = (action: MotorAction | LiquidLevelAction) => setSimulation((state) => nextPracticalSimulation(state, action, question, wires));

  const panelProps = {
    diagnostics, checked, segmentChecked, hintLevel, color, answerVisible, segment,
    segmentNumber: segmentIndex + 1, segmentCount: question.segments.length, segmentComplete,
    onColor: setColor, onCheck: check, onCheckSegment: checkSegment,
    onNextSegment: () => { setSegmentIndex((index) => Math.min(question.segments.length - 1, index + 1)); setSegmentComplete(false); setSegmentChecked(false); setDiagnostics([]); setHintLevel(0); },
    onHint: () => { setHintLevel((level) => Math.min(3, level + 1)); setHintCount((count) => count + 1); },
    onShowAnswer: () => { setAnswerVisible(true); setHintCount((count) => count + 1); },
    onReset: reset,
    onClear: () => { setWires([]); setSegmentComplete(false); resetCheck(); },
    onLoadReference: loadReference,
  };

  return <>
    <div className="practical-summary" aria-label="術科練習資訊">
      <strong>{question.title}</strong><span>{completed ? '圖面練習完成' : '圖面練習中'}</span><time>{Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}</time>
    </div>
    <details className="official-schematic"><summary>查看官方 B11 第{question.number === 1 ? '一' : '二'}題電路圖</summary><p>來源：{question.schematic.sourceLabel}。端子號為圖面教學標示，實體配線仍須核對器材與指導教師。</p><img src={question.schematic.src} alt={question.schematic.alt} /></details>
    <PartsPanel question={question} />
    <Workspace question={question} wires={wires} color={color} answerVisible={answerVisible} onAddWire={addWire} onRemoveWire={(id) => { setWires((existing) => existing.filter((wire) => wire.id !== id)); setSegmentComplete(false); resetCheck(); }} onMovePart={(id, x, y) => setQuestion((existing) => ({ ...existing, parts: existing.parts.map((part) => part.id === id ? { ...part, x, y } : part) }))} onApplyLayout={() => setQuestion(positionedQuestion(baseQuestion))} />
    {simulation.kind === 'liquid-level'
      ? <LiquidLevelTaskPanel {...panelProps} state={simulation.state} onAction={(action) => runAction(action)} />
      : <TaskPanel {...panelProps} motor={simulation.state} onMotorAction={(action) => runAction(action)} />}
    <div className="practice-footer" role="status">檢查 {checkCount} 次 · 錯誤 {errorCounts.danger + errorCounts.structure + errorCounts.function} 次 · 提示 {hintCount} 次 · 已完成 {historyCount} 次{storageWarning && <strong>　草稿內容損壞或題號不符，已從空白練習開始；本機儲存也可能無法保留。</strong>}</div>
  </>;
}
