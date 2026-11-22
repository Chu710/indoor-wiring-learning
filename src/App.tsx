import { useState } from 'react';
import { ExamMock } from './components/ExamMock';
import { PracticalExercise } from './components/PracticalExercise';
import { PracticalQuestionNav } from './components/PracticalQuestionNav';
import { TheoryQuiz } from './components/TheoryQuiz';
import { getPracticalQuestion } from './practical/questions';
import type { PracticalQuestionId } from './practical/types';
import './styles.css';

type View = 'practical' | 'theory' | 'exam';

export default function App() {
  const [view, setView] = useState<View>(() => window.location.hash === '#theory' ? 'theory' : window.location.hash === '#exam' ? 'exam' : 'practical');
  const [questionId, setQuestionId] = useState<PracticalQuestionId>('b11-q2-internal-wireway-v5');
  const question = getPracticalQuestion(questionId)!;
  const open = (next: View) => { window.history.replaceState(null, '', `#${next}`); setView(next); };

  return <main className="app-shell">
    <header><div><p>室內配線丙級｜學術科互動練習</p><h1>{view === 'theory' ? '學科練習｜電動機裝置' : view === 'exam' ? '學科模擬考｜80 題' : question.title}</h1><small>{view === 'theory' ? '先用 8 題核對電動機概念，再回到 B11 術科配線。' : view === 'exam' ? '依官方公開題庫選題，限時 100 分鐘作答。' : '依官方附圖建立主電路、控制迴路與接地；端子號為圖面教學標示，實體配線仍須核對器材與指導教師。'}</small></div><div className="header-meta"><nav className="mode-nav" aria-label="練習類型"><button aria-pressed={view === 'practical'} onClick={() => open('practical')}>術科配線</button><button aria-pressed={view === 'theory'} onClick={() => open('theory')}>學科練習</button><button aria-pressed={view === 'exam'} onClick={() => open('exam')}>80 題模擬考</button></nav><span>{view === 'theory' ? '8 題入門練習' : view === 'exam' ? '80 題限時測驗' : 'B11 術科圖面練習'}</span></div></header>
    {view === 'theory' ? <TheoryQuiz /> : view === 'exam' ? <ExamMock /> : <>
      <PracticalQuestionNav value={questionId} onChange={setQuestionId} />
      <PracticalExercise key={questionId} questionId={questionId} />
    </>}
  </main>;
}
