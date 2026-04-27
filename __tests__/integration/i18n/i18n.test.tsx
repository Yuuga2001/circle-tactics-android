import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { LangProvider, useLang, LANGUAGES } from '../../../src/i18n/index';

// expo-localization は setup.ts で既にモックされているが、
// テストごとに上書きできるよう jest.mock で再定義する
jest.mock('expo-localization', () => ({
  getLocales: jest.fn().mockReturnValue([{ languageCode: 'en', languageTag: 'en-US' }]),
}));

const mockGetLocales = Localization.getLocales as jest.Mock;

const LS_KEY = 'circletactics.lang';

beforeEach(async () => {
  // AsyncStorage をリセット
  await AsyncStorage.clear();
  (AsyncStorage.getItem as jest.Mock).mockClear();
  (AsyncStorage.setItem as jest.Mock).mockClear();
  (AsyncStorage.clear as jest.Mock).mockClear();

  // デフォルト locale を英語に戻す
  mockGetLocales.mockReturnValue([{ languageCode: 'en', languageTag: 'en-US' }]);
});

// ──────────────────────────────────────────────────
// detectLang のテストは LangProvider の useEffect 経由で検証する
// ──────────────────────────────────────────────────

describe('LangProvider / detectLang', () => {
  it('AsyncStorage に保存済みの言語があれば、それを使う (ja)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('ja');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LangProvider>{children}</LangProvider>
    );
    const { result } = renderHook(() => useLang(), { wrapper });

    // 初期状態は 'en'
    expect(result.current.lang).toBe('en');

    // detectLang の非同期処理を待つ
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.lang).toBe('ja');
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(LS_KEY);
  });

  it('AsyncStorage に保存済みの言語があれば、それを使う (zh-TW)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('zh-TW');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LangProvider>{children}</LangProvider>
    );
    const { result } = renderHook(() => useLang(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.lang).toBe('zh-TW');
  });

  it('AsyncStorage が null なら device locale にフォールバックする (ja)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    mockGetLocales.mockReturnValue([{ languageTag: 'ja-JP' }]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LangProvider>{children}</LangProvider>
    );
    const { result } = renderHook(() => useLang(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.lang).toBe('ja');
  });

  it('device locale が zh-TW 系のとき zh-TW を返す', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    mockGetLocales.mockReturnValue([{ languageTag: 'zh-TW' }]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LangProvider>{children}</LangProvider>
    );
    const { result } = renderHook(() => useLang(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.lang).toBe('zh-TW');
  });

  it('device locale が zh-Hant 系のとき zh-TW を返す', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    mockGetLocales.mockReturnValue([{ languageTag: 'zh-Hant-TW' }]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LangProvider>{children}</LangProvider>
    );
    const { result } = renderHook(() => useLang(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.lang).toBe('zh-TW');
  });

  it('未知の locale は en にフォールバックする', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    mockGetLocales.mockReturnValue([{ languageTag: 'xx-XX' }]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LangProvider>{children}</LangProvider>
    );
    const { result } = renderHook(() => useLang(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.lang).toBe('en');
  });

  it('AsyncStorage がエラーを投げても en にフォールバックする', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('storage error'));
    // device locale も未知
    mockGetLocales.mockReturnValue([{ languageTag: 'xx-XX' }]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LangProvider>{children}</LangProvider>
    );
    const { result } = renderHook(() => useLang(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.lang).toBe('en');
  });

  it('AsyncStorage に無効な言語コードが保存されていた場合は locale にフォールバックする', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('xx'); // LANGUAGES に存在しない
    mockGetLocales.mockReturnValue([{ languageTag: 'ko-KR' }]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LangProvider>{children}</LangProvider>
    );
    const { result } = renderHook(() => useLang(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.lang).toBe('ko');
  });
});

describe('LangProvider の children レンダリング', () => {
  it('children を正常にレンダリングする', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LangProvider>{children}</LangProvider>
    );
    const { result } = renderHook(() => useLang(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    // useLang が値を返せていれば children は正常にレンダリングされている
    expect(result.current).toBeDefined();
    expect(result.current.t).toBeDefined();
  });
});

describe('useLang', () => {
  it('初期状態で lang="en"、t が英語オブジェクトを返す', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LangProvider>{children}</LangProvider>
    );
    const { result } = renderHook(() => useLang(), { wrapper });

    expect(result.current.lang).toBe('en');
    expect(result.current.t.start).toBe('Start');
    expect(result.current.t.back).toBe('← Back');
  });

  it('t オブジェクトには文字列プロパティが含まれる', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LangProvider>{children}</LangProvider>
    );
    const { result } = renderHook(() => useLang(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    const { t } = result.current;
    expect(typeof t.subtitle).toBe('string');
    expect(typeof t.playLocal).toBe('string');
    expect(typeof t.cancel).toBe('string');
  });

  it('t オブジェクトには動的関数が含まれる', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LangProvider>{children}</LangProvider>
    );
    const { result } = renderHook(() => useLang(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    const { t } = result.current;
    expect(typeof t.goesFirst).toBe('function');
    expect(t.goesFirst('Player 1')).toBe('Player 1 goes first!');
    expect(t.playerWins('Player 2')).toBe('Player 2 WINS!');
    expect(t.disconnected('Player 3', 5)).toBe('Player 3 disconnected — AI taking over in 5s');
  });

  it('setLang を呼ぶと lang と t が切り替わる', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LangProvider>{children}</LangProvider>
    );
    const { result } = renderHook(() => useLang(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.lang).toBe('en');

    act(() => {
      result.current.setLang('ja');
    });

    expect(result.current.lang).toBe('ja');
    expect(result.current.t.start).toBe('スタート');
    expect(result.current.t.back).toBe('← 戻る');
  });

  it('setLang は AsyncStorage に言語を保存する', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LangProvider>{children}</LangProvider>
    );
    const { result } = renderHook(() => useLang(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      result.current.setLang('ko');
      await Promise.resolve();
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(LS_KEY, 'ko');
  });

  it('setLang 関数が返される', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LangProvider>{children}</LangProvider>
    );
    const { result } = renderHook(() => useLang(), { wrapper });
    expect(typeof result.current.setLang).toBe('function');
  });

  it('LANGUAGES に定義されている全言語コードで setLang できる', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LangProvider>{children}</LangProvider>
    );
    const { result } = renderHook(() => useLang(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    for (const code of Object.keys(LANGUAGES) as Array<keyof typeof LANGUAGES>) {
      act(() => {
        result.current.setLang(code);
      });
      expect(result.current.lang).toBe(code);
      expect(result.current.t).toBeDefined();
    }
  });
});
