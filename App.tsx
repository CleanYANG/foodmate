import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/store/AuthContext';
import { SavedPlacesProvider } from './src/store/SavedPlacesContext';
import { navigationTheme } from './src/theme/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SavedPlacesProvider>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar style="dark" />
            <AppNavigator />
          </NavigationContainer>
        </SavedPlacesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
