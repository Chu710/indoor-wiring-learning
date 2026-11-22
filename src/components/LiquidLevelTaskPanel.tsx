import type { Diagnostic, WiringSegment, WireColor } from '../practical/types';
import type { LiquidLevelAction, LiquidLevelState } from '../practical/q1/simulate';

interface Props {
  diagnostics: Diagnostic[];
  checked: boolean;
  segmentChecked?: boolean;
  hintLevel: number;
  state: LiquidLevelState;
  color: WireColor;
  answerVisible: boolean;
  segment: WiringSegment;
  segmentNumber: number;
  segmentCount: number;
  segmentComplete?: boolean;
  onColor: (color: WireColor) => void;
  onCheck: () => void;
  onCheckSegment: () => void;
  onNextSegment: () => void;
  onHint: () => void;
  onShowAnswer: () => void;
  onReset: () => void;
  onClear: () => void;
  onLoadReference: () => void;
  onAction: (action: LiquidLevelAction) => void;
}

const colors: { id: WireColor; name: string }[] = [
  { id: 'red', name: '紅' }, { id: 'white', name: '白' },
  { id: 'black', name: '黑' }, { id: 'green', name: '綠' },
];

const tankName = { low: '低水位', middle: '中水位', high: '高水位' } as const;
const sourceName = { dry: '缺水', allowed: '允許', full: '充足' } as const;

export function LiquidLevelTaskPanel(props: Props) {
  const issue = props.diagnostics[0];
  const ready = props.checked && props.diagnostics.length === 0;
  const tested = ['start', 'stop', 'automatic', 'tank-low', 'tank-high', 'source-dry', 'silence', 'trip', 'reset']
    .filter((action) => props.state.tested.includes(action as LiquidLevelAction)).length;

  return <aside className="task-panel liquid-level-panel" aria-label="第一題液位控制任務面板">
    <h2>練習步驟</h2>
    <ol><li>依序完成五段接線</li><li>檢查主電路、控制與接地</li><li>操作手動、自動及保護測試</li></ol>
    <h3>分段練習｜第 {props.segmentNumber} / {props.segmentCount} 段</h3>
    <p className="segment-description">{props.segment.title}<br />{props.segment.description}</p>
    <div className="actions"><button className="primary" onClick={props.onCheckSegment}>檢查本段接線</button>{props.segmentComplete && props.segmentNumber < props.segmentCount && <button onClick={props.onNextSegment}>進入下一段</button>}</div>
    <h3>電線顏色</h3>
    <div className="color-picker">{colors.map((item) => <button key={item.id} className={props.color === item.id ? 'chosen' : ''} onClick={() => props.onColor(item.id)} aria-label={`${item.name}色線`} aria-pressed={props.color === item.id}><i style={{ background: item.id }} />{item.name}</button>)}</div>
    <p className="segment-description">綠線只接保護接地；控制迴路可用紅、白、黑線分開追蹤。</p>
    <div className="actions"><button className="primary" onClick={props.onCheck}>檢查圖面接線</button><button onClick={props.onClear}>清除全部電線</button><button onClick={props.onLoadReference}>載入圖面參考接線（測試用）</button></div>
    {(props.checked || props.segmentChecked) && <div className={`check-result ${issue?.kind ?? 'success'}`} role="status">
      {issue ? <><strong>{issue.kind === 'danger' ? '危險接線' : issue.kind === 'structure' ? '接線待修正' : '控制功能待修正'}</strong><p>{issue.message}</p>{props.hintLevel >= 1 && <p>位置：{issue.area}</p>}</> : props.checked ? <><strong>與內建圖面接線一致</strong><p>可操作下方虛擬通電測試；實體器材仍須核對端子與安全規範。</p></> : <><strong>本段接線完成</strong><p>可進入下一段；整題檢查通過後才可虛擬通電。</p></>}
      {issue && <><button onClick={props.onHint}>顯示提示</button>{props.hintLevel >= 2 && <p>{issue.guidance}</p>}{props.hintLevel >= 3 && <p>相關端子：{issue.terminals.join('、')}</p>}<button onClick={props.onShowAnswer}>逐組查看參考接線</button></>}
    </div>}
    {props.answerVisible && <p className="answer-note">工作區一次顯示一組參考節點。端子號為圖面教學標示，實體配線須另行核對。</p>}

    <h3>虛擬通電測試</h3>
    <p>模式：{props.state.mode === 'manual' ? '手動' : '自動'}</p>
    <p>水槽：{tankName[props.state.tank]}</p>
    <p>給水源：{sourceName[props.state.source]}</p>
    <p className={`motor-status ${props.state.overloaded ? 'danger' : ''}`}>馬達：{props.state.overloaded ? '過載跳脫' : props.state.motor ? '運轉' : '停止'}</p>
    <p>MC：{props.state.contactor ? '吸合' : '釋放'}　G：{props.state.lamps.green ? '亮' : '滅'}　R：{props.state.lamps.red ? '亮' : '滅'}　Y：{props.state.lamps.yellow ? '亮' : '滅'}</p>
    <p>警報：{props.state.alarm ? '鳴響' : '靜音'}</p>
    <div className="liquid-actions">
      <button disabled={!ready} onClick={() => props.onAction('manual')}>手動模式</button>
      <button disabled={!ready} onClick={() => props.onAction('automatic')}>自動模式</button>
      <button disabled={!ready} onClick={() => props.onAction('start')}>PB1 啟動</button>
      <button disabled={!ready} onClick={() => props.onAction('stop')}>PB2 停止</button>
      <button disabled={!ready} onClick={() => props.onAction('silence')}>PB3 警報停止</button>
      <button disabled={!ready} onClick={() => props.onAction('tank-low')}>水槽低水位</button>
      <button disabled={!ready} onClick={() => props.onAction('tank-middle')}>水槽中水位</button>
      <button disabled={!ready} onClick={() => props.onAction('tank-high')}>水槽高水位</button>
      <button disabled={!ready} onClick={() => props.onAction('source-dry')}>給水源缺水</button>
      <button disabled={!ready} onClick={() => props.onAction('source-allowed')}>給水源允許</button>
      <button disabled={!ready} onClick={() => props.onAction('source-full')}>給水源充足</button>
      <button disabled={!ready} onClick={() => props.onAction('trip')}>過載跳脫</button>
      <button disabled={!ready} onClick={() => props.onAction('reset')}>積熱電驛復歸</button>
    </div>
    <p className="safety-note">PB3 只停止蜂鳴器，不會清除給水源缺水狀態，也不會啟動馬達。</p>
    <p>測試項目：{tested}/9</p>
    <button className="restart" onClick={props.onReset}>重新開始練習</button>
  </aside>;
}
