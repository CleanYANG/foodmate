import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';
import { Screen } from './src/components/Screen';
import {
  getHasCompletedOnboarding,
  setHasCompletedOnboarding,
} from './src/services/onboardingService';
import { AuthProvider } from './src/store/AuthContext';
import { SavedPlacesProvider } from './src/store/SavedPlacesContext';
import { navigationTheme } from './src/theme/navigation';
import { colors } from './src/theme/colors';
import { spacing } from './src/theme/spacing';
import { typography } from './src/theme/typography';

export default function App() {
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState(false);

  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const completed = await getHasCompletedOnboarding();
        setHasCompletedOnboardingState(completed);
      } finally {
        setIsLoadingOnboarding(false);
      }
    };

    void loadOnboardingState();
  }, []);

  const handleCompleteOnboarding = async () => {
    await setHasCompletedOnboarding();
    setHasCompletedOnboardingState(true);
  };

  if (isLoadingOnboarding) {
    return (
      <SafeAreaProvider>
        <Screen>
          <View style={styles.loadingWrap}>
            <Text style={styles.loadingTitle}>CityTalk</Text>
            <Text style={styles.loadingText}>Getting your first-run experience ready…</Text>
          </View>
        </Screen>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SavedPlacesProvider>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar style="dark" />
            <AppNavigator
              shouldShowOnboarding={!hasCompletedOnboarding}
              completeOnboarding={() => {
                void handleCompleteOnboarding();
              }}
            />
          </NavigationContainer>
        </SavedPlacesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = {
  loadingWrap: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
  },
  loadingTitle: {
    color: colors.text,
    fontSize: typography.sizes.titleMd,
    fontWeight: typography.weights.heavy,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
};
