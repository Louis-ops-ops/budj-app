import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from '@expo-google-fonts/outfit';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from './src/theme/typography';
import { BudjProvider, useBudj } from './src/data/BudjContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <BudjProvider>
          <ThemedApp fontsLoaded={fontsLoaded} />
        </BudjProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Le thème suit le réglage enregistré (système, clair ou sombre). */
function ThemedApp({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { data, status } = useBudj();
  return (
    <ThemeProvider preference={data.settings.theme}>
      <SystemChrome />
      {fontsLoaded && status === 'ready' ? <RootNavigator /> : <LoadingScreen />}
    </ThemeProvider>
  );
}

/** Barre d'état et fond de la fenêtre native accordés au thème Clair / Sombre. */
function SystemChrome() {
  const { scheme, colors } = useTheme();
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg.app).catch(() => {});
  }, [colors.bg.app]);
  return <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />;
}

function LoadingScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.loading, { backgroundColor: colors.bg.app }]}>
      <ActivityIndicator color={colors.bg.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
