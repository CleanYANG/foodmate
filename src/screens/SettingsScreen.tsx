import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation/types';
import { useLanguage } from '../store/LanguageContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({}: Props) {
  const { language, setLanguage, t } = useLanguage();
  const languageOptions = [
    { value: 'en', label: t('language.english_full') },
    { value: 'zh', label: t('language.chinese_full') },
    { value: 'zh-Hant', label: t('language.traditional_chinese_full') },
    { value: 'th', label: t('language.thai_full') },
    { value: 'es', label: t('language.spanish_full') },
  ] as const;

  return (
    <Screen padded={false}>
      <View style={styles.screen}>
        <View style={styles.container}>
          <View style={styles.headerBlock}>
            <Text style={styles.eyebrow}>{t('me.settings')}</Text>
            <Text style={styles.title}>{t('settings.title')}</Text>
          </View>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>{t('language.label')}</Text>
            <View style={styles.languageOptions}>
              {languageOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => void setLanguage(option.value)}
                  style={[
                    styles.languageOption,
                    language === option.value ? styles.languageOptionActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.languageOptionText,
                      language === option.value ? styles.languageOptionTextActive : null,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    gap: spacing.xl,
    padding: spacing.lg,
  },
  headerBlock: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  eyebrow: {
    color: colors.accent,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.eyebrow,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.titleMd,
    letterSpacing: -0.4,
    lineHeight: typography.lineHeights.title,
  },
  card: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.body,
  },
  languageOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  languageOption: {
    alignItems: 'center',
    backgroundColor: colors.tagBg,
    borderRadius: 999,
    minWidth: 96,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  languageOptionActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  languageOptionText: {
    color: colors.textMuted,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.bodySm,
    textAlign: 'center',
  },
  languageOptionTextActive: {
    color: colors.white,
  },
});
