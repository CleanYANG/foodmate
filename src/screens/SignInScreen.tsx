import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { InlineNotice } from '../components/InlineNotice';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../store/AuthContext';
import { useLanguage } from '../store/LanguageContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function SignInScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const { sendMagicLink, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSentLink, setHasSentLink] = useState(false);

  const handleSendLink = async () => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return;
    }

    clearAuthError();
    setIsSubmitting(true);

    try {
      await sendMagicLink(normalizedEmail);
      setHasSentLink(true);
    } catch {
      setHasSentLink(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen padded={false}>
      <View style={styles.container}>
        <View style={styles.decorBlobOne} pointerEvents="none" />
        <View style={styles.decorBlobTwo} pointerEvents="none" />

        <View style={styles.headerBlock}>
          <Text style={styles.brand}>fooMate</Text>
          <Text style={styles.title}>{t('nav.sign_in')}</Text>
        </View>

        <Card style={styles.signInCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('signin.email')}</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textSoft}
              style={styles.input}
              value={email}
            />
          </View>

          <Button variant="primary" onPress={() => void handleSendLink()}>
            {isSubmitting ? t('signin.sending') : t('signin.send')}
          </Button>

          {hasSentLink ? (
            <InlineNotice
              message={t('signin.success')}
              tone="success"
            />
          ) : null}

          {authError ? <InlineNotice message={authError} tone="error" /> : null}
        </Card>

        <Button variant="ghost" onPress={() => navigation.goBack()}>
          {t('common.back')}
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  decorBlobOne: {
    backgroundColor: 'transparent',
    borderRadius: 140,
    height: 160,
    left: -60,
    position: 'absolute',
    top: 90,
    width: 160,
  },
  decorBlobTwo: {
    backgroundColor: 'transparent',
    borderRadius: 130,
    height: 150,
    position: 'absolute',
    right: -50,
    top: 220,
    width: 150,
  },
  headerBlock: {
    paddingTop: spacing.sm,
  },
  brand: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.titleLg,
    letterSpacing: -0.5,
    lineHeight: 32,
    marginTop: spacing.sm,
    maxWidth: 290,
  },
  signInCard: {
    backgroundColor: colors.white,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.bodySm,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 0,
    color: colors.text,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.body,
    minHeight: 54,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
