import { StyleSheet, Text, View } from 'react-native';

import { PlaceholderCard } from '../components/PlaceholderCard';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function PlaceDetailScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <ScreenHeader
          eyebrow="Place Detail"
          title="A deeper look at each place"
          description="Use this screen for photos, reviews, tags, and a Google Maps link."
        />

        <PlaceholderCard>
          <Text style={styles.sectionTitle}>Placeholder layout</Text>
          <Text style={styles.bodyText}>- Hero image area</Text>
          <Text style={styles.bodyText}>- Place title and short review</Text>
          <Text style={styles.bodyText}>- Tags and save button</Text>
          <Text style={styles.bodyText}>- Open in Google Maps action</Text>
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
