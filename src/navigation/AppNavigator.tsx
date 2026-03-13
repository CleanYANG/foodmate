import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { PlaceDetailScreen } from '../screens/PlaceDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SavedPlacesScreen } from '../screens/SavedPlacesScreen';
import { colors } from '../theme/colors';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
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
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'CityTalk' }} />
      <Stack.Screen
        name="PlaceDetail"
        component={PlaceDetailScreen}
        options={{ title: 'Place Detail' }}
      />
      <Stack.Screen
        name="SavedPlaces"
        component={SavedPlacesScreen}
        options={{ title: 'Saved Places' }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Stack.Navigator>
  );
}
