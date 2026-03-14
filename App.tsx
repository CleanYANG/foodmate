import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';
import { SavedPlacesProvider } from './src/store/SavedPlacesContext';
import { navigationTheme } from './src/theme/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <SavedPlacesProvider>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="dark" />
          <AppNavigator />
        </NavigationContainer>
      </SavedPlacesProvider>
    </SafeAreaProvider>
  );
}
