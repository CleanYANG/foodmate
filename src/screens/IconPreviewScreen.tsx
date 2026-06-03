import { Screen } from '../components/Screen';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export function IconPreviewScreen() {
  return (
    <Screen padded={false}>
      <View style={styles.screen} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
