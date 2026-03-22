import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ScreenProps = PropsWithChildren<{
  padded?: boolean;
}>;

export function Screen({ children, padded = true }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.content, padded && styles.padded]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  padded: {
    padding: spacing.md,
  },
});
