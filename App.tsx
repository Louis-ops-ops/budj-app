import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from '@expo-google-fonts/outfit';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from './src/theme/typography';
import { BudjProvider } from './src/data/BudjContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blanc }}>
        <ActivityIndicator color={colors.bleue[500]} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <BudjProvider>
        <RootNavigator />
      </BudjProvider>
    </SafeAreaProvider>
  );
}
