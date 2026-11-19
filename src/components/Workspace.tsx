import { useState } from 'react';
import type { B11Question, Wire, WireColor } from '../b11/types';

interface Props {
  question: B11Question;
  wires: Wire[];
  color: WireColor;
  onAddWire: (from: string, to: string, color: WireColor) => void;
  onRemoveWire: (id: string) => void;
  onMovePart: (id: string, x: number, y: number) => void;
}

export function Workspace({ question, wires, color, onAddWire, onRemoveWire, onMovePart }: Props) {
  const [start, setStart] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [selectedWire, setSelectedWire] = useState<string | null>(null);
  const locations = new Map(question.parts.flatMap((part) => part.terminals.map((pin) => [pin.id, { x: part.x + pin.x, y: part.y + pin.y }] as const)));
  const chooseTerminal = (id: string) => {
    if (!start) { setStart(id); return; }
    if (start !== id && !wires.some((wire) => [wire.from, wire.to].includes(start) && [wire.from, wire.to].includes(id))) onAddWire(start, id, color);
    setStart(null);
  };
  return <section className="workspace-panel" aria-label="接線工作區">
    <div className="workspace-toolbar"><h2>控制箱接線工作區</h2><span>{wires.length} 條線</span><button onClick={() => setZoom(Math.max(0.7, zoom - 0.1))}>縮小</button><button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}>放大</button></div>
    <p className="workspace-help">點選第一個端子，再點選第二個端子接線；也可從端子拖到端子。元件標題可拖動位置。</p>
    <div className="workspace-scroll"><div className="workspace-stage" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
      <svg className="wire-layer" viewBox="0 0 1040 760" aria-label="電線">
        {wires.map((wire) => {
          const a = locations.get(wire.from); const b = locations.get(wire.to);
          if (!a || !b) return null;
          return <g key={wire.id} role="button" tabIndex={0} aria-label={`選取 ${wire.from} 至 ${wire.to} 的線`} onClick={() => setSelectedWire(wire.id)} onKeyDown={(event) => { if (event.key === 'Enter') setSelectedWire(wire.id); if (event.key === 'Delete') onRemoveWire(wire.id); }}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth="16" />
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={wire.color} strokeWidth={selectedWire === wire.id ? 5 : 3} className="visible-wire" />
          </g>;
        })}
      </svg>
      {question.parts.map((part) => <div key={part.id} className={`circuit-part ${part.kind}`} style={{ left: part.x, top: part.y }}>
        <div className="part-title" draggable onDragEnd={(event) => {
          const box = event.currentTarget.closest('.workspace-stage')?.getBoundingClientRect();
          if (box && event.clientX && event.clientY) onMovePart(part.id, Math.max(0, (event.clientX - box.left) / zoom), Math.max(0, (event.clientY - box.top) / zoom));
        }}>{part.name}</div>
        {part.terminals.map((pin) => <button key={pin.id} className={`terminal ${start === pin.id ? 'active' : ''}`} style={{ left: pin.x - 8, top: pin.y - 8 }} aria-label={pin.id} title={pin.id}
          onClick={() => chooseTerminal(pin.id)} onPointerDown={() => setStart(pin.id)} onPointerUp={() => { if (start && start !== pin.id) chooseTerminal(pin.id); }}><span>{pin.label}</span></button>)}
      </div>)}
    </div></div>
    {selectedWire && <button className="delete-wire" onClick={() => { onRemoveWire(selectedWire); setSelectedWire(null); }}>刪除選取的電線</button>}
    <div className="wire-list" aria-label="已接電線">{wires.map((wire) => <button key={wire.id} onClick={() => onRemoveWire(wire.id)} aria-label={`刪除 ${wire.from} 至 ${wire.to} 的線`}>{wire.from} — {wire.to} ×</button>)}</div>
  </section>;
}
