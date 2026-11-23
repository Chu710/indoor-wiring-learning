import type { PracticalQuestionId } from '../practical/types';

export function PracticalQuestionNav({ value, onChange }: { value: PracticalQuestionId; onChange: (id: PracticalQuestionId) => void }) {
  return <nav className="practical-question-nav" aria-label="術科題目">
    <button aria-pressed={value === 'b11-q1-liquid-level'} onClick={() => onChange('b11-q1-liquid-level')}>第一題｜液位控制</button>
    <button aria-pressed={value === 'b11-q2-internal-wireway-v5'} onClick={() => onChange('b11-q2-internal-wireway-v5')}>第二題｜馬達正反轉</button>
    <button aria-pressed={value === 'b11-q3-motor-fault-alarm'} onClick={() => onChange('b11-q3-motor-fault-alarm')}>第三題｜故障警報</button>
  </nav>;
}
