process.env.EXPO_PUBLIC_API_BASE_URL = 'http://api.test';

module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/__tests__/mocks/setup.ts'],
  testMatch: [
    '<rootDir>/__tests__/**/*.test.{ts,tsx}',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^expo/src/winter.*$': '<rootDir>/__tests__/mocks/expoWinter.ts',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/types.ts',        // type-only files, no executable code
    '!src/i18n/index.tsx',     // ~1140 lines are static translation data, not logic
    '!src/audio/audioManager.ts', // expo-av wrapper, fully mocked in tests
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
  },
};
