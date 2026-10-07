import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from '@expo-google-fonts/outfit';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from './src/theme/typography';
import { BudjProvider } from './src/data/legacy/BudjContext';
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
    <SafeAreaProvider>
      <ThemeProvider>
        <SystemChrome />
        {fontsLoaded ? (
          <BudjProvider>
            <RootNavigator />
          </BudjProvider>
        ) : (
          <LoadingScreen />
        )}
      </ThemeProvider>
    </SafeAreaProvider>
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
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.app }}>
      <ActivityIndicator color={colors.bg.accent} />
    </View>
  );
}
