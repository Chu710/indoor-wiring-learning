import type { Diagnostic, WireColor } from '../b11/types';
import type { MotorAction, MotorState } from '../b11/simulate';
import { wiringSegments, type WiringSegment } from '../b11/segments';

interface Props {
  diagnostics: Diagnostic[];
  checked: boolean;
  segmentChecked?: boolean;
  hintLevel: number;
  motor: MotorState;
  color: WireColor;
  answerVisible: boolean;
  onColor: (color: WireColor) => void;
  onCheck: () => void;
  onHint: () => void;
  onShowAnswer: () => void;
  onReset: () => void;
  onClear: () => void;
  onLoadReference?: () => void;
  onMotorAction: (action: MotorAction) => void;
  segment?: WiringSegment;
  segmentNumber?: number;
  segmentCount?: number;
  segmentComplete?: boolean;
  onCheckSegment?: () => void;
  onNextSegment?: () => void;
}

const colors: { id: WireColor; name: string }[] = [
  { id: 'red', name: '紅' }, { id: 'white', name: '白' }, { id: 'black', name: '黑' }, { id: 'green', name: '綠' },
];

export function TaskPanel(props: Props) {
  const { diagnostics, checked, hintLevel, motor, color, answerVisible } = props;
  const segment = props.segment ?? wiringSegments[0];
  const segmentNumber = props.segmentNumber ?? 1;
  const segmentCount = props.segmentCount ?? wiringSegments.length;
  const issue = diagnostics[0];
  const ready = checked && diagnostics.length === 0;
  return <aside className="task-panel" aria-label="任務面板">
    <h2>練習步驟</h2>
    <ol><li>選線色、連接圖面端子</li><li>檢查控制、主電路與接地</li><li>操作虛擬通電測試</li></ol>
    <h3>分段練習｜第 {segmentNumber} / {segmentCount} 段</h3>
    <p className="segment-description">{segment.title}<br />{segment.description}</p>
    <div className="actions"><button className="primary" onClick={() => props.onCheckSegment?.()}>檢查本段接線</button>{props.segmentComplete && segmentNumber < segmentCount && <button onClick={() => props.onNextSegment?.()}>進入下一段</button>}</div>
    <h3>電線顏色</h3>
    <div className="color-picker">{colors.map((item) => <button key={item.id} className={color === item.id ? 'chosen' : ''} onClick={() => props.onColor(item.id)} aria-label={`${item.name}色線`} aria-pressed={color === item.id}><i style={{ background: item.id }} />{item.name}</button>)}</div>
    <div className="actions"><button className="primary" onClick={props.onCheck}>檢查圖面接線</button><button onClick={props.onClear}>清除全部電線</button>{props.onLoadReference && <button onClick={props.onLoadReference}>載入圖面參考接線（測試用）</button>}</div>
    {(checked || props.segmentChecked) && <div className={`check-result ${issue?.kind ?? 'success'}`} role="status">
      {issue ? <><strong>{issue.kind === 'danger' ? '危險接線' : issue.kind === 'structure' ? '接線待修正' : '控制功能待修正'}</strong><p>{issue.message}</p>{hintLevel >= 1 && <p>位置：{issue.area}</p>}</> : checked ? <><strong>與內建圖面接線一致</strong><p>可操作下方虛擬通電測試；實體器材的端子與安全仍需另行核對。</p></> : <><strong>本段接線完成</strong><p>可進入下一段；虛擬通電測試須先檢查整題接線。</p></>}
      {issue && <><button onClick={props.onHint}>顯示提示</button>{hintLevel >= 2 && <p>{issue.guidance}</p>}{hintLevel >= 3 && <p>相關端子：{issue.terminals.join('、')}</p>}<button onClick={props.onShowAnswer}>逐組查看參考接線</button></>}
    </div>}
    {answerVisible && <p className="answer-note">工作區一次顯示一組參考節點，可按「上一組／下一組」查看。教學端子號碼需依現場器材確認。</p>}
    <h3>虛擬通電測試</h3>
    <p>依目前接線與虛擬接點計算線圈、燈號、蜂鳴器及馬達方向；不會控制實體電源。</p>
    <p className={`motor-status ${motor.overloaded ? 'danger' : ''}`}>預期馬達狀態：{motor.overloaded ? '過載跳脫' : motor.direction === 'forward' ? '正轉' : motor.direction === 'reverse' ? '反轉' : '停止'}</p>
    <p>MCF：{motor.mcf ? '吸合' : '釋放'}　MCR：{motor.mcr ? '吸合' : '釋放'}</p>
    <p>R1：{motor.lamps.forward ? '亮' : '滅'}　R2：{motor.lamps.reverse ? '亮' : '滅'}　G：{motor.lamps.stopped ? '亮' : '滅'}</p>
    <p>BZ：{motor.buzzer ? '鳴響' : '靜音'}</p>
    <div className="motor-actions"><button disabled={!ready} onClick={() => props.onMotorAction('forward')}>正轉</button><button disabled={!ready} onClick={() => props.onMotorAction('stop')}>停止</button><button disabled={!ready} onClick={() => props.onMotorAction('reverse')}>反轉</button><button disabled={!ready || motor.direction === 'stopped'} onClick={() => props.onMotorAction('interlock')}>測試互鎖</button><button disabled={!ready} onClick={() => props.onMotorAction('trip')}>過載跳脫</button><button disabled={!ready} onClick={() => props.onMotorAction('reset')}>復歸</button></div>
    <p>測試項目：{['forward', 'stop', 'reverse', 'interlock', 'trip'].filter((action) => motor.tested.includes(action as MotorAction)).length}/5</p>
    <button className="restart" onClick={props.onReset}>重新開始練習</button>
  </aside>;
}
