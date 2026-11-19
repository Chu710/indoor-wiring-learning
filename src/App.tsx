import { b11Question } from './b11/question';
import './styles.css';

export default function App() {
  return <main className="app-shell">
    <header><p>室內配線丙級術科練習</p><h1>{b11Question.title}</h1></header>
    <aside aria-label="元件庫"><h2>元件庫</h2><p>{b11Question.parts.length} 個控制元件</p></aside>
    <section aria-label="接線工作區"><h2>接線工作區</h2><p>準備元件與端子</p></section>
    <aside aria-label="任務面板"><h2>任務</h2><p>接線、檢查、通電測試</p></aside>
  </main>;
}
