import { StyleSheet, Text, View } from 'react-native';

import { PlaceholderCard } from '../components/PlaceholderCard';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function SavedPlacesScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <ScreenHeader
          eyebrow="Saved"
          title="Your favorite places"
          description="This screen will show saved spots once favorites are connected."
        />

        <PlaceholderCard>
          <Text style={styles.sectionTitle}>Saved Places</Text>
          <Text style={styles.bodyText}>
            Start with local storage or Supabase later when you are ready for user accounts.
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
