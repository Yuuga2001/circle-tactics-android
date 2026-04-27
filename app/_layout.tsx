import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LangProvider } from '../src/i18n';
import { useAppInit } from '../src/hooks/useAppInit';
import { COLORS } from '../src/styles/theme';

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const { ready } = useAppInit();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="local" />
      <Stack.Screen name="online/lobby" />
      <Stack.Screen name="online/host" />
      <Stack.Screen name="online/join" />
      <Stack.Screen name="online/waiting" />
      <Stack.Screen name="online/playing" />
      <Stack.Screen name="online/spectating" />
    </Stack>
  );
}

export default function AppLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LangProvider>
        <RootLayout />
      </LangProvider>
    </GestureHandlerRootView>
  );
}
