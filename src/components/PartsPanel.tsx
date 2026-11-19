import type { B11Question } from '../b11/types';

export function PartsPanel({ question }: { question: B11Question }) {
  return <aside className="parts-panel" aria-label="元件庫"><h2>元件庫</h2><p>拖曳元件到中央可調整位置</p><ul>{question.parts.map((part) => <li key={part.id} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', part.id)}><span className="part-symbol">{part.kind === 'motor' ? 'M' : part.kind === 'lamp' ? '●' : '▣'}</span><span>{part.name}<small>{part.terminals.length} 個端子</small></span></li>)}</ul></aside>;
}
