import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import LanguageSelector from '../../../src/components/LanguageSelector';

jest.useFakeTimers();

const mockSetLang = jest.fn();

jest.mock('../../../src/i18n/index', () => ({
  useLang: () => ({
    lang: 'en',
    setLang: mockSetLang,
    t: {},
  }),
  LANGUAGES: {
    en: 'English',
    ja: '日本語',
    fr: 'Français',
  },
  LangProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('LanguageSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態でドロップダウンは閉じている', () => {
    const { queryByText } = render(<LanguageSelector />);
    // Modal is not visible initially (visible=false means content not rendered)
    expect(queryByText('日本語')).toBeNull();
  });

  it('トリガーを押すとドロップダウンが開く', () => {
    const { getByText, queryByText } = render(<LanguageSelector />);
    fireEvent.press(getByText('Language'));
    expect(queryByText('日本語')).toBeTruthy();
    expect(queryByText('English')).toBeTruthy();
    expect(queryByText('Français')).toBeTruthy();
  });

  it('言語を選択すると setLang が呼ばれる', () => {
    const { getByText } = render(<LanguageSelector />);
    fireEvent.press(getByText('Language'));
    fireEvent.press(getByText('日本語'));
    expect(mockSetLang).toHaveBeenCalledWith('ja');
  });

  it('言語を選択するとメニューが閉じる', () => {
    const { getByText, queryByText } = render(<LanguageSelector />);
    fireEvent.press(getByText('Language'));
    expect(queryByText('日本語')).toBeTruthy();
    fireEvent.press(getByText('日本語'));
    act(() => { jest.advanceTimersByTime(200); });
    expect(queryByText('日本語')).toBeNull();
  });

  it('トリガーを再度押すとメニューが閉じる', () => {
    const { getByText, queryByText } = render(<LanguageSelector />);
    fireEvent.press(getByText('Language'));
    expect(queryByText('日本語')).toBeTruthy();
    fireEvent.press(getByText('Language'));
    act(() => { jest.advanceTimersByTime(200); });
    expect(queryByText('日本語')).toBeNull();
  });
});
