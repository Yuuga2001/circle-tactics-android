// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('./__mocks__/asyncStorage'),
);

// expo-av mock
jest.mock('expo-av', () => require('./expoAv').default);

// expo-audio mock
jest.mock('expo-audio', () => {
  const mockPlayer = {
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
    seekTo: jest.fn(),
    volume: 1,
    loop: false,
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    isLoaded: true,
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  };
  return {
    createAudioPlayer: jest.fn().mockReturnValue(mockPlayer),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  };
});

// expo-splash-screen mock
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

// expo-localization mock
jest.mock('expo-localization', () => ({
  getLocales: jest.fn().mockReturnValue([{ languageCode: 'en', languageTag: 'en-US' }]),
}));

// expo-router mock
jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: jest.fn().mockReturnValue({}),
  useSegments: jest.fn().mockReturnValue([]),
  Link: ({ children }: { children: React.ReactNode }) => children,
  Stack: {
    Screen: () => null,
  },
}));

// react-native-reanimated mock (inline to avoid Worklets native initialization)
jest.mock('react-native-reanimated', () => {
  const { View, Text, Animated } = require('react-native');
  const NOOP = () => {};
  const NOOP_FACTORY = () => NOOP;
  const ID = (t: unknown) => t;
  const useSharedValue = (init: unknown) => ({ value: init, addListener: NOOP, removeListener: NOOP, modify: NOOP });
  const useAnimatedStyle = (fn: () => unknown) => { try { return fn(); } catch { return {}; } };
  const withTiming = ID;
  const withSpring = ID;
  const withRepeat = ID;
  const withSequence = (...args: unknown[]) => args[args.length - 1];
  const withDelay = (_delay: unknown, anim: unknown) => anim;
  const cancelAnimation = NOOP;
  const interpolate = (_v: unknown, _i: unknown[], o: unknown[]) => o[0];
  const interpolateColor = (_v: unknown, _i: unknown[], o: unknown[]) => o[0];
  const useAnimatedRef = () => ({ current: null });
  const useAnimatedScrollHandler = NOOP_FACTORY;
  const useAnimatedGestureHandler = NOOP_FACTORY;
  const useAnimatedReaction = NOOP;
  const runOnJS = (fn: (...args: unknown[]) => void) => fn;
  const runOnUI = (fn: (...args: unknown[]) => void) => fn;
  const Easing = { inOut: ID, out: ID, in: ID, linear: ID, ease: 0, quad: 0, cubic: 0, bezier: NOOP_FACTORY, circle: 0, exp: 0, elastic: NOOP_FACTORY, bounce: 0, back: NOOP_FACTORY, steps: NOOP_FACTORY };
  const FadeIn = { duration: NOOP_FACTORY };
  const FadeOut = { duration: NOOP_FACTORY };

  // Build an animated View that just forwards to RN View
  const AnimatedView = View;
  const AnimatedText = Text;
  const AnimatedImage = require('react-native').Image;
  const AnimatedScrollView = require('react-native').ScrollView;

  return {
    __esModule: true,
    default: {
      View: AnimatedView,
      Text: AnimatedText,
      Image: AnimatedImage,
      ScrollView: AnimatedScrollView,
      createAnimatedComponent: (C: unknown) => C,
    },
    Animated: {
      View: AnimatedView,
      Text: AnimatedText,
      Image: AnimatedImage,
      ScrollView: AnimatedScrollView,
      createAnimatedComponent: (C: unknown) => C,
    },
    useSharedValue,
    useAnimatedStyle,
    useAnimatedRef,
    useAnimatedScrollHandler,
    useAnimatedGestureHandler,
    useAnimatedReaction,
    withTiming,
    withSpring,
    withRepeat,
    withSequence,
    withDelay,
    cancelAnimation,
    interpolate,
    interpolateColor,
    runOnJS,
    runOnUI,
    Easing,
    FadeIn,
    FadeOut,
    FadeInDown: FadeIn,
    FadeOutUp: FadeOut,
    SlideInDown: FadeIn,
    SlideOutDown: FadeOut,
    ZoomIn: FadeIn,
    ZoomOut: FadeOut,
    createAnimatedComponent: (C: unknown) => C,
    // Animated namespace for RN compat
    View: AnimatedView,
    Text: AnimatedText,
    Image: AnimatedImage,
    ScrollView: AnimatedScrollView,
  };
});

// react-native-gesture-handler mock
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  const ScrollView = require('react-native').ScrollView;
  return {
    GestureHandlerRootView: View,
    GestureDetector: View,
    Gesture: {
      Pan: () => ({
        onBegin: jest.fn().mockReturnThis(),
        onUpdate: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
        onFinalize: jest.fn().mockReturnThis(),
        enabled: jest.fn().mockReturnThis(),
      }),
      LongPress: () => ({
        onBegin: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
        minDuration: jest.fn().mockReturnThis(),
        enabled: jest.fn().mockReturnThis(),
      }),
      Simultaneous: jest.fn(),
    },
    ScrollView,
    PanGestureHandler: View,
    State: {},
  };
});

// expo-camera mock
jest.mock('expo-camera', () => ({
  CameraView: require('react-native').View,
  useCameraPermissions: jest.fn().mockReturnValue([
    { granted: true },
    jest.fn().mockResolvedValue({ granted: true }),
  ]),
}));

// expo-clipboard mock
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(undefined),
  getStringAsync: jest.fn().mockResolvedValue(''),
}));

// react-native-qrcode-svg mock
jest.mock('react-native-qrcode-svg', () => {
  const { View } = require('react-native');
  return { default: View };
});

global.__reanimatedWorkletInit = jest.fn();
