import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SplashScreen } from './src/components/SplashScreen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/store/AuthContext';
import { MomentsProvider } from './src/store/MomentsContext';
import { SavedPlacesProvider } from './src/store/SavedPlacesContext';
import { navigationTheme } from './src/theme/navigation';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SavedPlacesProvider>
          <MomentsProvider>
            <NavigationContainer theme={navigationTheme}>
              <StatusBar style={showSplash ? 'light' : 'dark'} />
              {showSplash ? <SplashScreen /> : <AppNavigator />}
            </NavigationContainer>
          </MomentsProvider>
        </SavedPlacesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
