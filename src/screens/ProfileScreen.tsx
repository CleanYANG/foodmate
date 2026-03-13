import { StyleSheet, Text, View } from 'react-native';

import { PlaceholderCard } from '../components/PlaceholderCard';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function ProfileScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <ScreenHeader
          eyebrow="Profile"
          title="A simple account and settings area"
          description="For MVP, this can stay lightweight and mostly informational."
        />

        <PlaceholderCard>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Text style={styles.bodyText}>
            Use this space for preferences, saved counts, or future account settings.
          </Text>
        </PlaceholderCard>
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
    fontSize: 20,
    fontWeight: '700',
  },
  bodyText: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
});
