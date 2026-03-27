import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>CityTalk</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.text,
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    color: colors.white,
    fontSize: typography.sizes.titleLg,
    fontWeight: typography.weights.heavy,
    letterSpacing: 0.8,
  },
});
