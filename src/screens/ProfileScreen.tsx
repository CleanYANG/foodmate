import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../store/AuthContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { user, isAuthenticated, isInitializing, authError, signOut } = useAuth();

  if (isInitializing) {
    return (
      <Screen>
        <View style={styles.container}>
          <ScreenHeader
            eyebrow="Account"
            title="Checking your session"
            description="Just a second while CityTalk figures out whether you're signed in."
          />
        </View>
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return (
      <Screen>
        <View style={styles.container}>
          <ScreenHeader
            eyebrow="Guest"
            title="Browse freely, sign in when you want to save"
            description="CityTalk works fine as a guest. Use email magic link sign-in when you want your saved places synced to your account."
          />

          <Card>
            <Text style={styles.sectionTitle}>Guest mode</Text>
            <Text style={styles.bodyText}>
              You can explore all places without an account. Saving places turns on after you sign
              in.
            </Text>
            {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
            <Button variant="primary" onPress={() => navigation.navigate('SignIn')}>
              Continue with email
            </Button>
          </Card>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <ScreenHeader
          eyebrow="Profile"
          title="You’re signed in"
          description="Minimal account controls for now — just enough to manage your CityTalk session cleanly."
        />

        <Card>
          <Text style={styles.sectionTitle}>Email</Text>
          <Text style={styles.bodyText}>{user?.email ?? 'Signed in'}</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Session</Text>
          <Text style={styles.bodyText}>Your saved places are tied to this signed-in account.</Text>
          <Button variant="secondary" onPress={() => navigation.navigate('SavedPlaces')}>
            Open saved places
          </Button>
          <Button
            variant="danger"
            onPress={() =>
              void signOut().catch(() => {
                // Auth error state is surfaced in context.
              })
            }
          >
            Sign out
          </Button>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sizes.titleSm,
    fontWeight: typography.weights.bold,
  },
  bodyText: {
    color: colors.textMuted,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.sizes.bodySm,
    lineHeight: typography.lineHeights.body,
  },
});
