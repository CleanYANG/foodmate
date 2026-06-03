import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ChatScreen } from '../screens/ChatScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MyMomentScreen } from '../screens/MyMomentScreen';
import { PlaceDetailScreen } from '../screens/PlaceDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SavedPlacesScreen } from '../screens/SavedPlacesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { useLanguage } from '../store/LanguageContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { t } = useLanguage();

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 220,
        headerBackButtonDisplayMode: 'minimal',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: typography.fonts.semibold,
          fontSize: 18,
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MyMoment" component={MyMomentScreen} options={{ title: t('me.title') }} />
      <Stack.Screen
        name="PlaceDetail"
        component={PlaceDetailScreen}
        options={{ title: '' }}
      />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: t('nav.chat') }} />
      <Stack.Screen name="SavedPlaces" component={SavedPlacesScreen} options={{ title: t('saved.title') }} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('nav.post'),
        }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings.title') }} />
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: t('nav.sign_in') }} />
    </Stack.Navigator>
  );
}
