import { Image, StyleSheet, View } from 'react-native';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/splash-option1-review.png')}
        resizeMode="contain"
        style={styles.splashImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF4E8',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  splashImage: {
    width: '100%',
    maxWidth: 420,
    height: '100%',
    maxHeight: 760,
  },
});
