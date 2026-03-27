import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { MyMomentScreen } from '../screens/MyMomentScreen';
import { PlaceDetailScreen } from '../screens/PlaceDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SavedPlacesScreen } from '../screens/SavedPlacesScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { useAuth } from '../store/AuthContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isInitializing, isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 220,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: typography.fonts.semibold,
          fontSize: 17,
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MyMoment" component={MyMomentScreen} options={{ title: 'My Moment' }} />
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
