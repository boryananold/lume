import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Colors, TextStyles, Spacing } from '@/constants/theme';
import { Events } from '@/lib/mixpanel';

// Acceptance criteria: __tests__/acceptance/onboarding-welcome.test.ts
// - Displays brand tagline
// - "Begin" button advances to skin-type screen
// - Fires 'Onboarding Started' event

export default function OnboardingWelcomeScreen() {
  function handleBegin() {
    Events.onboardingStarted();
    router.push('/(auth)/skin-type');
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.brand}>Lumé</Text>
          <Text style={[TextStyles.display1, styles.tagline]}>
            Your light,{'\n'}amplified.
          </Text>
          <Text style={[TextStyles.body, styles.subtitle]}>
            Finally, a science-backed ritual designed for the woman you're becoming.
          </Text>
        </View>
        <Button label="Begin" onPress={handleBegin} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  brand: {
    fontFamily: 'PlayfairDisplay_500Medium',
    fontSize: 20,
    color: Colors.gold,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: Spacing.xl,
  },
  tagline: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: Colors.textSecondary,
    maxWidth: 320,
  },
});
