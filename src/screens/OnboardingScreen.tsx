import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Tag } from '../components/Tag';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

type OnboardingStep = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  accent: string;
  tags: string[];
};

const STEPS: OnboardingStep[] = [
  {
    eyebrow: 'Welcome',
    title: 'Find city spots fast',
    description:
      'CityTalk is built for quick decisions. Browse one place at a time and keep only the ones worth revisiting.',
    bullets: [
      'Swipe left to skip a place that is not for you.',
      'Swipe right to save a place for later.',
      'Use tags to filter the feed when you want a certain vibe.',
    ],
    accent: 'Swipe through the city',
    tags: ['skip left', 'save right', 'quick browse'],
  },
  {
    eyebrow: 'Save what matters',
    title: 'Build your short list',
    description:
      'When a place catches your eye, save it and jump into the detail page for the full description, address, and reviews.',
    bullets: [
      'Saved places stay easy to revisit from the Saved tab.',
      'Open details when a card needs a closer look.',
      'Reviews help you remember why a place stood out.',
    ],
    accent: 'Turn swipes into a plan',
    tags: ['saved places', 'details', 'reviews'],
  },
  {
    eyebrow: 'Go there',
    title: 'Open maps when you are ready',
    description:
      'Each place detail view can send you straight to maps, so CityTalk moves cleanly from discovery to actually going outside.',
    bullets: [
      'Use Open in maps from the place detail screen.',
      'Check the address before you head out.',
      'Skip onboarding anytime — you can start exploring immediately.',
    ],
    accent: 'From idea to destination',
    tags: ['open maps', 'address', 'skip anytime'],
  },
];

type OnboardingScreenProps = Props & {
  completeOnboarding: () => void;
};

export function OnboardingScreen({ completeOnboarding }: OnboardingScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const progressLabel = useMemo(() => `${stepIndex + 1} / ${STEPS.length}`, [stepIndex]);

  const handleFinish = () => {
    completeOnboarding?.();
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>{step.eyebrow}</Text>
            <Text style={styles.progress}>{progressLabel}</Text>
          </View>
          <Button variant="ghost" onPress={handleFinish}>
            Skip
          </Button>
        </View>

        <Card style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{step.accent}</Text>
          </View>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          <View style={styles.tagsRow}>
            {step.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.bulletList}>
            {step.bullets.map((bullet) => (
              <View key={bullet} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.footerRow}>
          {stepIndex > 0 ? (
            <Button
              variant="secondary"
              style={styles.flexButton}
              onPress={() => setStepIndex(stepIndex - 1)}
            >
              Back
            </Button>
          ) : (
            <View style={styles.flexButton} />
          )}

          <Button
            variant="primary"
            style={styles.flexButton}
            onPress={isLastStep ? handleFinish : () => setStepIndex(stepIndex + 1)}
          >
            {isLastStep ? 'Start exploring' : 'Next'}
          </Button>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.sizes.eyebrow,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  progress: {
    color: colors.textSoft,
    fontSize: typography.sizes.bodySm,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.xs,
  },
  heroCard: {
    backgroundColor: colors.surface,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  heroBadgeText: {
    color: colors.primary,
    fontSize: typography.sizes.bodySm,
    fontWeight: typography.weights.bold,
  },
  title: {
    color: colors.text,
    fontSize: typography.sizes.titleMd,
    fontWeight: typography.weights.heavy,
    lineHeight: typography.lineHeights.title,
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sizes.titleSm,
    fontWeight: typography.weights.heavy,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bulletList: {
    gap: spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  bulletDot: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 10,
    marginTop: 7,
    width: 10,
  },
  bulletText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
});
