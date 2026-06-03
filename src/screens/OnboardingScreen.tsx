import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Tag } from '../components/Tag';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

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
    title: 'Follow the feeling first',
    description:
      '饭搭子帮你从吃饭心情出发，看到真实的人写下的推荐，然后决定要不要私下聊聊。',
    bullets: [
      'Swipe left when the vibe misses.',
      'Swipe right when you want to keep it.',
      'Use tags to jump into a mood quickly.',
    ],
    accent: 'Discover by vibe',
    tags: ['cozy', 'artistic', 'local'],
  },
  {
    eyebrow: 'Save what matters',
    title: 'Build a visual shortlist',
    description:
      'When something feels right, keep it. Your saved board turns loose inspiration into a plan you can actually use later.',
    bullets: [
      'Saved places stay visible in a mood-first board.',
      'Open details when you want the full story.',
      'Capture why it stood out before you forget.',
    ],
    accent: 'Keep what resonates',
    tags: ['saved board', 'details', 'moments'],
  },
  {
    eyebrow: 'Go there',
    title: 'Turn discovery into a real day out',
    description:
      '看到合适的推荐就可以直接收藏、开聊，慢慢把线上变成一次真的约饭。',
    bullets: [
      'Read the vibe summary before you commit.',
      'Check the address when you are ready to go.',
      'Start exploring whenever you want.',
    ],
    accent: 'From mood to movement',
    tags: ['weekend route', 'easy choice', 'go now'],
  },
];

type OnboardingScreenProps = {
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
    <Screen padded={false}>
      <View style={styles.container}>
        <View style={styles.decorBlobOne} pointerEvents="none" />
        <View style={styles.decorBlobTwo} pointerEvents="none" />
        <View style={styles.decorBlobThree} pointerEvents="none" />

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>fooMate</Text>
            <Text style={styles.eyebrow}>{step.eyebrow}</Text>
            <Text style={styles.progress}>{progressLabel}</Text>
          </View>
          <Button variant="ghost" onPress={handleFinish}>
            Skip
          </Button>
        </View>

        <Card style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{step.accent}</Text>
            </View>
            <View style={styles.progressDots}>
              {STEPS.map((_, index) => (
                <View
                  key={`step-${index}`}
                  style={[styles.progressDot, index === stepIndex ? styles.progressDotActive : null]}
                />
              ))}
            </View>
          </View>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          <View style={styles.tagsRow}>
            {step.tags.map((tag) => (
              <Tag key={tag} label={tag} tone="primary" />
            ))}
          </View>
        </Card>

        <Card style={styles.stepsCard}>
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
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  decorBlobOne: {
    backgroundColor: 'transparent',
    borderRadius: 150,
    height: 170,
    left: -70,
    position: 'absolute',
    top: 80,
    width: 170,
  },
  decorBlobTwo: {
    backgroundColor: 'transparent',
    borderRadius: 140,
    height: 150,
    position: 'absolute',
    right: -56,
    top: 190,
    width: 150,
  },
  decorBlobThree: {
    backgroundColor: 'transparent',
    borderRadius: 120,
    bottom: 120,
    height: 140,
    position: 'absolute',
    right: 18,
    width: 140,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  brand: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: 18,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  eyebrow: {
    color: colors.primary,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.eyebrow,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progress: {
    color: colors.textSoft,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.bodySm,
    marginTop: spacing.xs,
  },
  heroCard: {
    backgroundColor: colors.surface,
    minHeight: 280,
  },
  heroTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.tagBg,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  heroBadgeText: {
    color: colors.secondary,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.bodySm,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.hero,
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.body,
    lineHeight: 26,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.titleSm,
  },
  stepsCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  bulletList: {
    gap: spacing.md,
  },
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bulletDot: {
    backgroundColor: colors.highlight,
    borderRadius: 999,
    height: 10,
    marginTop: 7,
    width: 10,
  },
  bulletText: {
    color: colors.textMuted,
    flex: 1,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
});
