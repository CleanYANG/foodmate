import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
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

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function SignInScreen({ navigation }: Props) {
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
    <Screen>
      <View style={styles.container}>
        <ScreenHeader
          eyebrow="Sign in"
          title="Save places with a magic link"
          description="Guests can browse freely. Sign in with your email when you want your saved list to stick."
        />

        <Card>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
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
            {isSubmitting ? 'Sending link...' : 'Email me a sign-in link'}
          </Button>

          {hasSentLink ? (
            <Text style={styles.successText}>
              Magic link sent. Open it on this device and CityTalk will sign you in.
            </Text>
          ) : null}

          {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
        </Card>

        <Button variant="ghost" onPress={() => navigation.goBack()}>
          Back
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: typography.sizes.bodySm,
    fontWeight: typography.weights.bold,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.sizes.body,
    minHeight: 54,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  successText: {
    color: colors.secondary,
    fontSize: typography.sizes.bodySm,
    lineHeight: typography.lineHeights.body,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.sizes.bodySm,
    lineHeight: typography.lineHeights.body,
  },
});
