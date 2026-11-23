import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExamMock } from './ExamMock';
import { examDraftKey, examQuestions, loadExamResults } from '../theory/exam';

beforeEach(() => window.localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('學科模擬考畫面', () => {
  it('restores answers and scores unanswered questions only after submission', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const page = render(<ExamMock />);
    fireEvent.click(screen.getByRole('button', { name: '開始模擬考' }));
    expect(screen.getByText('已答 0 / 80 題')).toBeTruthy();
    const first = examQuestions[0];
    fireEvent.click(screen.getByRole('button', { name: `1. ${first.choices[0]}` }));
    expect(screen.getByText('已答 1 / 80 題')).toBeTruthy();
    expect(screen.queryByText(/正解：/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '下一題' }));
    page.unmount();
    render(<ExamMock />);
    expect(screen.getByText('已答 1 / 80 題')).toBeTruthy();
    expect(screen.getByText(/第 2 \/ 80 題/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '交卷' }));
    expect(confirm).toHaveBeenCalledWith('還有 79 題未作答。確定交卷嗎？');
    expect(screen.getByText(/1.25 分｜1 \/ 80 題答對｜未及格/)).toBeTruthy();
    expect(loadExamResults(window.localStorage)).toHaveLength(1);
    expect(window.localStorage.getItem(examDraftKey)).toBeNull();
  });

  it('automatically submits an expired draft after reopening the page', async () => {
    window.localStorage.setItem(examDraftKey, JSON.stringify({ startedAt: Date.now() - 101 * 60 * 1000, questionIndex: 0, answers: Array(80).fill(null) }));
    render(<ExamMock />);
    expect(await screen.findByText(/時間到，已自動交卷/)).toBeTruthy();
    expect(loadExamResults(window.localStorage)[0].score).toBe(0);
    expect(window.localStorage.getItem(examDraftKey)).toBeNull();
  });
});
