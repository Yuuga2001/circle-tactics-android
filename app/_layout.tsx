import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LangProvider } from '../src/i18n';
import { useAppInit } from '../src/hooks/useAppInit';
import { COLORS } from '../src/styles/theme';
import AppChrome from '../src/components/AppChrome';

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const { ready } = useAppInit();
  const [fontsLoaded] = useFonts({
    'MPLUSRounded1c-Regular': require('../assets/fonts/MPLUSRounded1c-Regular.ttf'),
    'MPLUSRounded1c-Bold': require('../assets/fonts/MPLUSRounded1c-Bold.ttf'),
  });

  const allReady = ready && fontsLoaded;

  useEffect(() => {
    if (allReady) SplashScreen.hideAsync();
  }, [allReady]);

  if (!allReady) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.boardFrame} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bg },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="local" />
        <Stack.Screen name="online/lobby" />
        <Stack.Screen name="online/host" />
        <Stack.Screen name="online/join" />
        <Stack.Screen name="online/waiting" />
        <Stack.Screen name="online/playing" />
        <Stack.Screen name="online/spectating" />
      </Stack>
      <AppChrome />
    </View>
  );
}

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LangProvider>
          <RootLayout />
        </LangProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
