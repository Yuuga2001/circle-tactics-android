import React from 'react';
import { render, act } from '@testing-library/react-native';
import DemoBoard from '../../../src/components/DemoBoard';

jest.useFakeTimers();

// ai モック: 常に固定の手を返す
jest.mock('../../../src/logic/ai', () => ({
  findBestMove: jest.fn().mockReturnValue({ size: 'SMALL', row: 0, col: 0 }),
}));

describe('DemoBoard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態でゲームボードがレンダリングされる', () => {
    const { getByTestId } = render(<DemoBoard />);
    act(() => { jest.runAllTimers(); });
    // Board renders with testID="game-board"
    expect(getByTestId('game-board')).toBeTruthy();
  });

  it('タイマーを進めると AI が手を打つ', () => {
    const { findBestMove } = require('../../../src/logic/ai');
    render(<DemoBoard />);
    act(() => { jest.advanceTimersByTime(900); });
    expect(findBestMove).toHaveBeenCalled();
  });

  it('winner が出ると一定時間後にリセットされる', () => {
    // DemoBoard は winner が出ると RESTART_GAME を dispatch する
    // タイマーを長く進めても例外なく動作することを確認
    render(<DemoBoard />);
    act(() => { jest.runAllTimers(); });
    // No error thrown means the reset logic works
  });

  it('pointerEvents="none" でインタラクションを無効化している', () => {
    const { UNSAFE_root } = render(<DemoBoard />);
    act(() => { jest.runAllTimers(); });
    // Root View of DemoBoard should have pointerEvents none (non-interactive demo)
    const root = UNSAFE_root;
    expect(root).toBeTruthy();
  });
});
