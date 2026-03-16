import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PlaceDetailScreen } from '../screens/PlaceDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SavedPlacesScreen } from '../screens/SavedPlacesScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { useAuth } from '../store/AuthContext';
import { colors } from '../theme/colors';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

type AppNavigatorProps = {
  shouldShowOnboarding: boolean;
  completeOnboarding: () => void;
};

export function AppNavigator({ shouldShowOnboarding, completeOnboarding }: AppNavigatorProps) {
  const { isInitializing, isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={shouldShowOnboarding ? 'Onboarding' : 'Home'}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {shouldShowOnboarding ? (
        <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
          {(props) => <OnboardingScreen {...props} completeOnboarding={completeOnboarding} />}
        </Stack.Screen>
      ) : null}
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'CityTalk' }} />
      <Stack.Screen
        name="PlaceDetail"
        component={PlaceDetailScreen}
        options={{ title: 'Place Detail' }}
      />
      <Stack.Screen
        name="SavedPlaces"
        component={SavedPlacesScreen}
        options={{ title: isAuthenticated ? 'Saved Places' : 'Saved Places (Sign in to use)' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: isInitializing ? 'Account' : isAuthenticated ? 'Profile' : 'Sign In',
        }}
      />
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: 'Sign In' }} />
    </Stack.Navigator>
  );
}
