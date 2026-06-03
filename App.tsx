import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
} from '@expo-google-fonts/instrument-sans';
import { NavigationContainer } from '@react-navigation/native';
import {
  NotoSansSC_400Regular,
  NotoSansSC_500Medium,
  NotoSansSC_700Bold,
  useFonts,
} from '@expo-google-fonts/noto-sans-sc';
import {
  NotoSansThai_400Regular,
  NotoSansThai_500Medium,
  NotoSansThai_700Bold,
} from '@expo-google-fonts/noto-sans-thai';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SplashScreen as AppSplashScreen } from './src/components/SplashScreen';
import { env } from './src/config/env';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/store/AuthContext';
import { LanguageProvider, useLanguage } from './src/store/LanguageContext';
import { MomentsProvider } from './src/store/MomentsContext';
import { SavedPlacesProvider } from './src/store/SavedPlacesContext';
import { appViewport, useAppViewport } from './src/lib/useAppViewport';
import { colors } from './src/theme/colors';
import { navigationTheme } from './src/theme/navigation';
import { spacing } from './src/theme/spacing';
import { typography } from './src/theme/typography';

void ExpoSplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isWebDesktop } = useAppViewport();
  const { language } = useLanguage();
  const [fontsLoaded] = useFonts(
    language === 'th'
      ? {
          AppFont_Regular: NotoSansThai_400Regular,
          AppFont_Medium: NotoSansThai_500Medium,
          AppFont_Semibold: NotoSansThai_700Bold,
        }
      : language === 'zh' || language === 'zh-Hant'
        ? {
            AppFont_Regular: NotoSansSC_400Regular,
            AppFont_Medium: NotoSansSC_500Medium,
            AppFont_Semibold: NotoSansSC_700Bold,
          }
        : {
            AppFont_Regular: InstrumentSans_400Regular,
            AppFont_Medium: InstrumentSans_500Medium,
            AppFont_Semibold: InstrumentSans_600SemiBold,
          },
  );
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);
  const [showAppSplash, setShowAppSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!fontsLoaded || nativeSplashHidden) {
      return;
    }

    const hideNativeSplash = async () => {
      await ExpoSplashScreen.hideAsync();
      setNativeSplashHidden(true);
    };

    void hideNativeSplash();
  }, [fontsLoaded, nativeSplashHidden]);

  useEffect(() => {
    if (!nativeSplashHidden || !showAppSplash) {
      return;
    }

    const timer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        duration: 450,
        toValue: 0,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setShowAppSplash(false);
        }
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [nativeSplashHidden, showAppSplash, splashOpacity]);

  if (!fontsLoaded) {
    return null;
  }

  if (!env.isConfigured) {
    return (
      <View style={styles.errorScreen}>
        <StatusBar style="dark" />
        <Text style={styles.errorEyebrow}>Startup configuration error</Text>
        <Text style={styles.errorTitle}>The app is missing required environment values.</Text>
        <Text style={styles.errorBody}>
          Add these Expo build variables and rebuild the app:
        </Text>
        <Text style={styles.errorCode}>{env.missingConfig.join('\n')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.appShell, isWebDesktop ? styles.appShellWeb : null]}>
      <View style={[styles.container, isWebDesktop ? styles.webDeviceFrame : null]}>
        <AuthProvider>
          <SavedPlacesProvider>
            <MomentsProvider>
              <NavigationContainer theme={navigationTheme}>
                <StatusBar style="dark" />
                <AppNavigator />
              </NavigationContainer>
            </MomentsProvider>
          </SavedPlacesProvider>
        </AuthProvider>
      </View>
      {showAppSplash ? (
        <Animated.View pointerEvents="none" style={[styles.splashOverlay, { opacity: splashOpacity }]}>
          <AppSplashScreen />
        </Animated.View>
      ) : null}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appShell: {
    backgroundColor: colors.background,
    flex: 1,
  },
  appShellWeb: {
    alignItems: 'center',
    backgroundColor: '#ded7cb',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    width: '100%',
  },
  webDeviceFrame: {
    borderColor: 'rgba(111, 98, 82, 0.16)',
    borderRadius: 34,
    borderWidth: 1,
    maxHeight: appViewport.mobileFrameHeight,
    maxWidth: appViewport.mobileFrameWidth,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 24px 60px rgba(64, 45, 25, 0.16)',
      },
      default: {},
    }),
  },
  errorScreen: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorEyebrow: {
    color: colors.textMuted,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.eyebrow,
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  errorTitle: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.titleMd,
    lineHeight: typography.lineHeights.title,
    marginBottom: spacing.sm,
  },
  errorBody: {
    color: colors.textSecondary,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
    marginBottom: spacing.md,
  },
  errorCode: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.bodySm,
    lineHeight: typography.lineHeights.compact,
    padding: spacing.md,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
