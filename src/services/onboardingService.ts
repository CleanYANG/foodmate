import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = 'citytalk:onboarding-complete';

export async function getHasCompletedOnboarding() {
  const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
  return value === 'true';
}

export async function setHasCompletedOnboarding() {
  await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
}
