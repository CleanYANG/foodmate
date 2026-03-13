import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PlaceholderCard } from '../components/PlaceholderCard';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.container}>
        <ScreenHeader
          eyebrow="CityTalk"
          title="Discover Sapporo one card at a time"
          description="This starter screen is ready for your swipe-based place feed."
        />

        <PlaceholderCard>
          <Text style={styles.cardTitle}>Home</Text>
          <Text style={styles.cardBody}>
            Add your first place card component here, then connect it to your data source.
          </Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={styles.primaryButton}
              onPress={() => navigation.navigate('PlaceDetail')}
            >
              <Text style={styles.primaryButtonText}>Open Place Detail</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('SavedPlaces')}
            >
              <Text style={styles.secondaryButtonText}>View Saved Places</Text>
            </Pressable>
          </View>
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
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  cardBody: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  buttonRow: {
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
