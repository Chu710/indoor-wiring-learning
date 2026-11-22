import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { b11Question } from './b11/question';
import { loadQuestionRecords } from './practical/session';
import { motorTheoryQuestions } from './theory/questions';
import { loadTheoryResults } from './theory/records';

afterEach(cleanup);
beforeEach(() => { window.localStorage.clear(); window.history.replaceState(null, '', '#practical'); });

describe('B11 practice screen', () => {
  it('can restore the cabinet layout without the third-party photo or clearing a draft wire', () => {
    const wires = [{ id: 'w1', from: 'supply.A', to: 'nfb.L1', color: 'red', createdAt: 1 }];
    window.localStorage.setItem('b11-draft-v1', JSON.stringify({ questionId: b11Question.id, startedAt: Date.now(), wires, positions: { nfb: { x: 700, y: 400 } }, checkCount: 0, errorCounts: { danger: 0, structure: 0, function: 0 }, hintCount: 0 }));
    render(<App />);
    expect(screen.queryByRole('img', { name: '第二題實際配線盤參考照片' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '重排箱內器材' }));
    expect(screen.getByText('1 條線')).toBeTruthy();
    const nfb = b11Question.parts.find((component) => component.id === 'nfb');
    expect(screen.getByRole('button', { name: 'nfb.L1' }).closest('.circuit-part')?.getAttribute('style')).toContain(`left: ${nfb?.x}px`);
  });
  it('reviews eight wrong answers and keeps the full quiz record unchanged', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '學科練習' }));
    for (let index = 0; index < motorTheoryQuestions.length; index += 1) {
      const question = motorTheoryQuestions[index];
      const wrong = (question.answer + 1) % question.choices.length;
      fireEvent.click(screen.getByRole('button', { name: `${wrong + 1}. ${question.choices[wrong]}` }));
      fireEvent.click(screen.getByRole('button', { name: '確認答案' }));
      fireEvent.click(screen.getByRole('button', { name: index === motorTheoryQuestions.length - 1 ? '查看成績' : '下一題' }));
    }
    expect(screen.getByText('0 / 8 題答對')).toBeTruthy();
    expect(within(screen.getByRole('status')).getAllByRole('listitem')).toHaveLength(8);
    expect(loadTheoryResults(window.localStorage)).toHaveLength(1);
    expect(loadTheoryResults(window.localStorage)[0].score).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: '重練 8 題錯題' }));
    for (let index = 0; index < motorTheoryQuestions.length; index += 1) {
      const question = motorTheoryQuestions[index];
      fireEvent.click(screen.getByRole('button', { name: `${question.answer + 1}. ${question.choices[question.answer]}` }));
      fireEvent.click(screen.getByRole('button', { name: '確認答案' }));
      fireEvent.click(screen.getByRole('button', { name: index === motorTheoryQuestions.length - 1 ? '查看成績' : '下一題' }));
    }
    expect(screen.getByText('8 / 8 題答對')).toBeTruthy();
    expect(screen.getByText('全部答對。')).toBeTruthy();
    expect(loadTheoryResults(window.localStorage)).toHaveLength(1);
  });
  it('resumes the theory quiz after switching views and saves a completed attempt', () => {
    const app = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'supply.A' }));
    fireEvent.click(screen.getByRole('button', { name: 'nfb.L1' }));
    fireEvent.click(screen.getByRole('button', { name: '學科練習' }));
    expect(screen.getByText('正式考試：80 題')).toBeTruthy();
    expect(screen.getByText('100 分鐘')).toBeTruthy();
    expect(screen.getByText('答對 48 題及格')).toBeTruthy();
    expect(screen.getByText(/可從上方切換到「80 題模擬考」/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '2. 6 Hz' }));
    fireEvent.click(screen.getByRole('button', { name: '確認答案' }));
    fireEvent.click(screen.getByRole('button', { name: '下一題' }));
    fireEvent.click(screen.getByRole('button', { name: '術科配線' }));
    expect(screen.getByText('1 條線')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '學科練習' }));
    expect(screen.getByText('第 2 / 8 題')).toBeTruthy();
    for (let index = 1; index < motorTheoryQuestions.length; index += 1) {
      const question = motorTheoryQuestions[index];
      fireEvent.click(screen.getByRole('button', { name: `${question.answer + 1}. ${question.choices[question.answer]}` }));
      fireEvent.click(screen.getByRole('button', { name: '確認答案' }));
      fireEvent.click(screen.getByRole('button', { name: index === motorTheoryQuestions.length - 1 ? '查看成績' : '下一題' }));
    }
    expect(screen.getByText('7 / 8 題答對')).toBeTruthy();
    expect(loadTheoryResults(window.localStorage)).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: '重練 1 題錯題' }));
    expect(screen.getByText(/第 1 \/ 1 題/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '術科配線' }));
    fireEvent.click(screen.getByRole('button', { name: '學科練習' }));
    expect(screen.getByText(/第 1 \/ 1 題/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '1. 3 Hz' }));
    fireEvent.click(screen.getByRole('button', { name: '確認答案' }));
    fireEvent.click(screen.getByRole('button', { name: '查看成績' }));
    expect(screen.getByText('1 / 1 題答對')).toBeTruthy();
    expect(loadTheoryResults(window.localStorage)).toHaveLength(1);
    app.unmount();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '學科練習' }));
    expect(screen.getByText('這台電腦已完成 1 次學科練習。')).toBeTruthy();
    expect(screen.getByText('第 1 次：7 / 8 題答對')).toBeTruthy();
  });
  it('shows segment errors without enabling the virtual power test', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '檢查本段接線' }));
    expect(screen.getByText('必要接線尚未完成')).toBeTruthy();
    expect((screen.getByRole('button', { name: '正轉' }) as HTMLButtonElement).disabled).toBe(true);
  });
  it('lets a learner check wiring and blocks energizing a short', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'nfb.T1' }));
    fireEvent.click(screen.getByRole('button', { name: 'nfb.T2' }));
    fireEvent.click(screen.getByRole('button', { name: '檢查圖面接線' }));
    expect(screen.getByText('危險接線')).toBeTruthy();
    expect((screen.getByRole('button', { name: '正轉' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('restores a partially wired exercise after remounting', () => {
    const app = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'supply.A' }));
    fireEvent.click(screen.getByRole('button', { name: 'nfb.L1' }));
    expect(screen.getByText('1 條線')).toBeTruthy();
    app.unmount();
    render(<App />);
    expect(screen.getByText('1 條線')).toBeTruthy();
  });
  it('records a completed reference exercise once', () => {
    const wires = b11Question.referenceNets.flatMap((net) => net.slice(1).map((to, index) => ({ id: `${net[0]}-${index}`, from: net[0], to, color: net.includes('earth.PE') ? 'green' : 'red', createdAt: 1 })));
    window.localStorage.setItem('b11-draft-v1', JSON.stringify({ questionId: b11Question.id, startedAt: Date.now(), wires, positions: {}, checkCount: 0, errorCounts: { danger: 0, structure: 0, function: 0 }, hintCount: 0 }));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '檢查圖面接線' }));
    expect(screen.getByText('與內建圖面接線一致')).toBeTruthy();
    for (const name of ['正轉', '測試互鎖', '停止', '反轉', '過載跳脫']) fireEvent.click(screen.getByRole('button', { name }));
    expect(screen.getByText('圖面練習完成')).toBeTruthy();
    expect(loadQuestionRecords(window.localStorage, 'b11-q2-internal-wireway-v5')).toHaveLength(1);
  });
  it('loads the reference through the UI and runs the wired controls', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '載入圖面參考接線（測試用）' }));
    fireEvent.click(screen.getByRole('button', { name: '檢查圖面接線' }));
    expect(screen.getByText('與內建圖面接線一致')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '正轉' }));
    expect(screen.getByText('預期馬達狀態：正轉')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '停止' }));
    fireEvent.click(screen.getByRole('button', { name: '反轉' }));
    expect(screen.getByText('預期馬達狀態：反轉')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '過載跳脫' }));
    expect(screen.getByText('BZ：鳴響')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '復歸' }));
    expect(screen.getByText('預期馬達狀態：停止')).toBeTruthy();
    expect(screen.getByText('BZ：靜音')).toBeTruthy();
  });
});
