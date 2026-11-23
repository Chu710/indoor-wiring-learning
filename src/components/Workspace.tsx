import { useEffect, useRef, useState } from 'react';
import type { B11Question, Wire, WireColor } from '../b11/types';
import { horizontalWirewayCenters, verticalWirewayCenters, wirewayPath } from '../b11/wireway';
import { DeviceGraphic } from './DeviceGraphic';

interface Props {
  question: B11Question;
  wires: Wire[];
  color: WireColor;
  answerVisible?: boolean;
  onAddWire: (from: string, to: string, color: WireColor) => void;
  onRemoveWire: (id: string) => void;
  onMovePart: (id: string, x: number, y: number) => void;
  onApplyLayout?: () => void;
}

function pinMeaning(label: string): string | null {
  const pole = /^P([123])([LT])$/.exec(label);
  if (pole) return `主${pole[1]}${pole[2] === 'L' ? '入' : '出'}`;
  const heater = /^H([12])([IO])$/.exec(label);
  if (heater) return `熱${heater[1]}${heater[2] === 'I' ? '入' : '出'}`;
  if (label === 'PE') return '接地';
  return null;
}

export function Workspace({ question, wires, color, answerVisible = false, onAddWire, onRemoveWire, onMovePart, onApplyLayout }: Props) {
  const [start, setStart] = useState<string | null>(null);
  const pointerOrigin = useRef<string | null>(null);
  const suppressClick = useRef<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [selectedWire, setSelectedWire] = useState<string | null>(null);
  const [showAllWires, setShowAllWires] = useState(true);
  const [referenceNetIndex, setReferenceNetIndex] = useState(0);
  useEffect(() => { if (wires.length) setSelectedWire(wires[wires.length - 1].id); else setSelectedWire(null); }, [wires.length]);
  const locations = new Map(question.parts.flatMap((part) => part.terminals.map((pin) => [pin.id, { x: part.x + pin.x, y: part.y + pin.y }] as const)));
  const partLocations = new Map(question.parts.flatMap((part) => part.terminals.map((pin) => [pin.id, { x: part.x, y: part.y }] as const)));
  const pathBetween = (from: string, to: string, lane: number) => {
    const a = locations.get(from); const b = locations.get(to);
    const fromPart = partLocations.get(from); const toPart = partLocations.get(to);
    return a && b && fromPart && toPart ? wirewayPath(a, b, fromPart, toPart, lane) : null;
  };
  const focusedWire = wires.find((wire) => wire.id === selectedWire) ?? wires[wires.length - 1];
  const terminalName = (id: string) => {
    const part = question.parts.find((item) => item.terminals.some((pin) => pin.id === id));
    const index = part?.terminals.findIndex((pin) => pin.id === id) ?? -1;
    if (!part || index < 0) return id;
    const row = Math.floor(index / 2) + 1;
    const pin = part.terminals[index];
    const meaning = pinMeaning(pin.label);
    return `${part.name}・${meaning ? `${meaning}（${pin.label}）` : pin.label}（第 ${row} 排${index % 2 ? '右' : '左'}端）`;
  };
  const chooseTerminal = (id: string) => {
    if (!start) { setStart(id); return; }
    if (start !== id && !wires.some((wire) => [wire.from, wire.to].includes(start) && [wire.from, wire.to].includes(id))) onAddWire(start, id, color);
    setStart(null);
  };
  return <section className="workspace-panel" aria-label="接線工作區">
    <div className="workspace-toolbar"><h2>控制箱接線工作區</h2><span>{wires.length} 條線</span><button onClick={() => setZoom(Math.max(0.7, zoom - 0.1))}>縮小</button><button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}>放大</button></div>
    <div className="layout-reference"><p className="workspace-help">箱內器材與箱外操作區已分開。點第一個橘色端子，再點第二個橘色端子即可接線；也可從端子中心拖到另一個端子。下方可單獨追蹤每條線。</p>{onApplyLayout && <button type="button" onClick={onApplyLayout}>重排箱內器材</button>}</div>
    <div className="connection-status" role="status">{start ? `已選起點：${terminalName(start)}。請點第二個橘色端子完成接線。` : '選第一個橘色端子開始接線。'}</div>
    <div className="wire-view-controls"><strong>{focusedWire ? `${terminalName(focusedWire.from)} → ${terminalName(focusedWire.to)}` : '尚未接線'}</strong><button type="button" onClick={() => setShowAllWires((value) => !value)}>{showAllWires ? '只看選取的線' : '顯示全部電線'}</button></div>
    {answerVisible && <div className="reference-view-controls"><button type="button" disabled={referenceNetIndex === 0} onClick={() => setReferenceNetIndex((index) => index - 1)}>上一組參考節點</button><strong>參考第 {referenceNetIndex + 1} / {question.referenceNets.length} 組：{question.referenceNets[referenceNetIndex].map(terminalName).join('、')}</strong><button type="button" disabled={referenceNetIndex === question.referenceNets.length - 1} onClick={() => setReferenceNetIndex((index) => index + 1)}>下一組參考節點</button></div>}
    <div className="workspace-scroll"><div className="workspace-stage" aria-label="元件放置區" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
      event.preventDefault();
      const id = event.dataTransfer.getData('text/plain');
      if (!question.parts.some((part) => part.id === id)) return;
      const box = event.currentTarget.getBoundingClientRect();
      onMovePart(id, Math.max(0, Math.min(1270, (event.clientX - box.left) / zoom)), Math.max(0, Math.min(740, (event.clientY - box.top) / zoom)));
    }}>
      <div className="cabinet-zone" aria-label="箱內配線盤"><strong>箱內配線盤</strong></div>
      <div className="external-zone" aria-label="箱外操作與負載"><strong>箱外操作與負載</strong></div>
      <svg className="wireway-layer" viewBox="0 0 1380 900" aria-label="配線線槽" role="img">
        {horizontalWirewayCenters.map((center) => <rect data-fixed-wireway="horizontal" key={`h-${center}`} x="12" y={center - 16} width="1356" height="32" rx="6" />)}
        {verticalWirewayCenters.map((center) => <rect data-fixed-wireway="vertical" key={`v-${center}`} x={center - 14} y="24" width="28" height="847" rx="6" />)}
      </svg>
      <svg className="wire-layer" viewBox="0 0 1380 900" aria-label="電線">
        {answerVisible && <g aria-label="參考接線圖層" className="reference-wires">{question.referenceNets[referenceNetIndex].slice(1).map((id) => {
          const path = pathBetween(question.referenceNets[referenceNetIndex][0], id, referenceNetIndex);
          return path ? <path key={`${referenceNetIndex}-${id}`} d={path} fill="none" stroke="#61d8ed" strokeWidth="2" strokeDasharray="5 5" /> : null;
        })}</g>}
        {wires.map((wire, index) => {
          const path = pathBetween(wire.from, wire.to, index);
          if (!path || (!showAllWires && wire.id !== focusedWire?.id)) return null;
          return <g key={wire.id} role="button" tabIndex={0} opacity={wire.id === focusedWire?.id ? 1 : 0.15} aria-label={`選取 ${terminalName(wire.from)} 至 ${terminalName(wire.to)} 的線`} onClick={() => setSelectedWire(wire.id)} onKeyDown={(event) => { if (event.key === 'Enter') setSelectedWire(wire.id); if (event.key === 'Delete') onRemoveWire(wire.id); }}>
            <path d={path} fill="none" stroke="transparent" strokeWidth="16" />
            <path d={path} fill="none" stroke={wire.color} strokeWidth={focusedWire?.id === wire.id ? 5 : 3} className="visible-wire" />
          </g>;
        })}
      </svg>
      {question.parts.map((part) => <div key={part.id} className={`circuit-part ${part.kind}`} style={{ left: part.x, top: part.y, height: Math.max(84, 60 + Math.ceil(part.terminals.length / 2) * 24) }}>
        <DeviceGraphic part={part} />
        <div className="part-title" draggable onDragEnd={(event) => {
          const box = event.currentTarget.closest('.workspace-stage')?.getBoundingClientRect();
          if (box && event.clientX && event.clientY) onMovePart(part.id, Math.max(0, (event.clientX - box.left) / zoom), Math.max(0, (event.clientY - box.top) / zoom));
        }}>{part.name}</div>
        {part.terminals.map((pin) => <button key={pin.id} type="button" className={`terminal ${start === pin.id ? 'active' : ''} ${focusedWire && [focusedWire.from, focusedWire.to].includes(pin.id) ? 'focused-terminal' : ''}`} style={{ left: pin.x - 13, top: pin.y - 13 }} aria-label={pin.id} title={pin.id}
          onClick={() => { if (suppressClick.current === pin.id) { suppressClick.current = null; return; } chooseTerminal(pin.id); }}
          onPointerDown={() => { pointerOrigin.current = pin.id; }}
          onPointerUp={() => {
            const origin = pointerOrigin.current;
            pointerOrigin.current = null;
            if (origin && origin !== pin.id) {
              if (!wires.some((wire) => [wire.from, wire.to].includes(origin) && [wire.from, wire.to].includes(pin.id))) onAddWire(origin, pin.id, color);
              suppressClick.current = pin.id;
              window.setTimeout(() => { if (suppressClick.current === pin.id) suppressClick.current = null; }, 0);
              setStart(null);
            }
          }} onPointerCancel={() => { pointerOrigin.current = null; }}><span>{pinMeaning(pin.label) ?? pin.label}</span></button>)}
      </div>)}
    </div></div>
    {selectedWire && <button className="delete-wire" onClick={() => { onRemoveWire(selectedWire); setSelectedWire(null); }}>刪除選取的電線</button>}
    <div className="wire-list" aria-label="已接電線">{wires.map((wire, index) => <div className={`wire-list-row ${focusedWire?.id === wire.id ? 'active' : ''}`} key={wire.id}><button type="button" className="wire-focus" onClick={() => setSelectedWire(wire.id)} aria-label={`查看第 ${index + 1} 條線：${terminalName(wire.from)}至${terminalName(wire.to)}`}><i style={{ background: wire.color }} />{index + 1}. {terminalName(wire.from)} → {terminalName(wire.to)}</button><button type="button" className="wire-remove" onClick={() => onRemoveWire(wire.id)} aria-label={`刪除 ${wire.from} 至 ${wire.to} 的線`}>刪除</button></div>)}</div>
  </section>;
}
