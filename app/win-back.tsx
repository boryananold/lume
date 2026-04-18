import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Fonts, FontSizes, Spacing, TextStyles } from '@/constants/theme';

export default function WinBackScreen() {
  const { days } = useLocalSearchParams<{ days?: string }>();
  const daysMissed = Number(days) || 3;
  const message =
    daysMissed >= 14
      ? "It's been a while. Your ritual is still here — and so is your glow."
      : daysMissed >= 7
      ? "A week away. Your skin noticed. Let's come back gently."
      : "You've been away a few days. Your ritual is waiting — no judgement.";

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.overline}>We missed you</Text>
        <Text style={[TextStyles.display2, styles.title]}>Welcome back.</Text>

        <Card style={styles.card}>
          <Text style={[TextStyles.body, styles.message]}>{message}</Text>
          <Text style={styles.stat}>{daysMissed}d since your last ritual</Text>
        </Card>

        <Card style={styles.affirmationCard}>
          <Text style={styles.affirmation}>
            "Starting again is not starting over. It's showing up."
          </Text>
        </Card>

        <Button
          label="Start today's ritual"
          onPress={() => router.replace('/check-in')}
          style={styles.cta}
        />
        <Button
          label="Maybe later"
          variant="ghost"
          onPress={() => router.replace('/(tabs)')}
          style={styles.skip}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.xl,
  },
  overline: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.xs,
    color: Colors.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.xl,
  },
  card: {
    marginBottom: Spacing.md,
  },
  message: {
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  stat: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.lg,
    color: Colors.gold,
  },
  affirmationCard: {
    backgroundColor: `${Colors.gold}10`,
    borderColor: Colors.gold,
    marginBottom: Spacing.xl,
  },
  affirmation: {
    fontFamily: Fonts.displayRegular,
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  cta: {
    marginBottom: Spacing.sm,
  },
  skip: {},
});
