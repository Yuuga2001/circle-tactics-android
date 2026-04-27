// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('./__mocks__/asyncStorage'),
);

// expo-av mock
jest.mock('expo-av', () => require('./expoAv').default);

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

// react-native-reanimated mock
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
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
