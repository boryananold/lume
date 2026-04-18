import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { Colors, Fonts, FontSizes, TextStyles, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Events } from '@/lib/mixpanel';

// Acceptance criteria: __tests__/acceptance/onboarding-circle.test.ts
// - Shows 2x reach benefit
// - "Start my ritual" button completes onboarding and routes to (tabs)
// - Fires 'Onboarding Completed' event with selected skin_type

export default function CircleInviteScreen() {
  const { draft, complete, isSaving } = useOnboarding();

  async function handleFinish() {
    try {
      await complete();
      Events.onboardingCompleted(draft.skinType ?? 'unknown');
      router.replace({ pathname: '/(auth)/login', params: { signup: '1' } });
    } catch {
      // already captured in context state
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View>
          <ProgressDots total={5} current={4} />
          <Text style={[TextStyles.display2, styles.title]}>Glow together</Text>
          <Text style={[TextStyles.body, styles.subtitle]}>
            Invite up to 5 friends to share a Circle. Women in Circles are 2.3× more likely to keep their streak.
          </Text>

          <Card style={styles.benefitCard}>
            <Text style={styles.benefitLabel}>Science-backed</Text>
            <Text style={[TextStyles.body, styles.benefitText]}>
              Accountability multiplies consistency. We've seen it in our beta — your Circle becomes your quiet cheer squad.
            </Text>
          </Card>

          <Text style={[TextStyles.caption, styles.skipHint]}>
            You can invite your Circle anytime from your profile.
          </Text>
        </View>

        <View style={styles.ctas}>
          <Button label="Start my ritual" onPress={handleFinish} loading={isSaving} />
          <Button label="Invite later" variant="ghost" onPress={handleFinish} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    opacity: 0.8,
    marginBottom: Spacing.xl,
  },
  benefitCard: {
    borderColor: Colors.gold,
    backgroundColor: `${Colors.gold}10`,
  },
  benefitLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xs,
    color: Colors.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  benefitText: {
    color: Colors.text,
  },
  skipHint: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  ctas: {
    gap: Spacing.sm,
  },
});
