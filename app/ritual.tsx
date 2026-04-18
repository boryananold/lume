import { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Fonts, FontSizes, Spacing, TextStyles } from '@/constants/theme';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { RitualStep, DailyCheckIn, MoodLevel, EnergyLevel, StressLevel } from '@/types/api';

// Acceptance criteria: __tests__/acceptance/ritual.test.ts
// - Shows loading state while Claude generates
// - Renders morning ritual, evening ritual, affirmation, and glow tip
// - "Save & finish" routes back to tabs

export default function RitualScreen() {
  const params = useLocalSearchParams<{
    mood: string;
    energy: string;
    stress: string;
    sleepHours: string;
    notes?: string;
    photoUri?: string;
  }>();

  // Params come from the check-in form URL and are fixed for this screen's lifetime.
  const checkIn = useMemo<DailyCheckIn>(() => ({
    mood: (Number(params.mood) || 3) as MoodLevel,           // as: 1-5 integer from Scale component
    energy: (Number(params.energy) || 3) as EnergyLevel,     // as: 1-5 integer from Scale component
    stressLevel: (Number(params.stress) || 3) as StressLevel, // as: 1-5 integer from Scale component
    sleepHours: Number(params.sleepHours) || 7,
    notes: params.notes,
    completedAt: new Date().toISOString(),
  }), [params.mood, params.energy, params.stress, params.sleepHours, params.notes]);

  const { data: user, isLoading: userLoading } = useCurrentUser();
  const userId = user?.id ?? '';
  const { data: ritual, skinAnalysis, isLoading: checkInLoading, error, submitCheckIn } = useCheckIn(userId, params.photoUri || undefined);

  // Submit once — as soon as we have a userId. Ref prevents double-fire on re-renders.
  const submittedRef = useRef(false);
  useEffect(() => {
    if (!userId || submittedRef.current) return;
    submittedRef.current = true;
    void submitCheckIn(checkIn);
  }, [userId, submitCheckIn, checkIn]);

  const isLoading = userLoading || checkInLoading || !ritual?.morningRitual;

  if (error) {
    return (
      <ScreenContainer>
        <Text style={TextStyles.heading}>Something's off.</Text>
        <Text style={[TextStyles.body, styles.subtitle]}>{error?.message}</Text>
        <Button label="Try again" onPress={() => router.back()} style={styles.cta} />
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return <RitualLoadingScreen />;
  }

  return (
    <ScreenContainer scroll>
      <Text style={styles.overline}>Today's ritual</Text>
      <Text style={[TextStyles.display2, styles.title]}>Tend to yourself.</Text>

      {skinAnalysis ? (
        <Card style={styles.skinCard}>
          <Text style={styles.skinLabel}>Your skin today</Text>
          <Text style={[TextStyles.body, styles.skinText]}>{skinAnalysis}</Text>
        </Card>
      ) : null}

      <Card style={styles.affirmationCard}>
        <Text style={styles.affirmationLabel}>Affirmation</Text>
        <Text style={[TextStyles.body, styles.affirmationText]}>"{ritual.affirmation}"</Text>
      </Card>

      <Text style={styles.sectionHeading}>Morning</Text>
      {ritual.morningRitual.map((step) => (
        <RitualStepCard key={step.id} step={step} />
      ))}

      <Text style={styles.sectionHeading}>Evening</Text>
      {ritual.eveningRitual.map((step) => (
        <RitualStepCard key={step.id} step={step} />
      ))}

      <Card style={styles.tipCard}>
        <Text style={styles.tipLabel}>Glow tip</Text>
        <Text style={[TextStyles.body, styles.tipText]}>{ritual.glowTip}</Text>
      </Card>

      <Button label="Save & finish" onPress={() => router.replace('/(tabs)')} style={styles.cta} />
    </ScreenContainer>
  );
}

function RitualLoadingScreen() {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.92, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [spinAnim, pulseAnim]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.loadingBox}>
      <View style={styles.loadingOrbWrap}>
        <Animated.View style={[styles.spinRing, { transform: [{ rotate: spin }] }]} />
        <Animated.View style={[styles.glowOrb, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.glowOrbInner} />
          <View style={styles.glowOrbSpecular} />
        </Animated.View>
      </View>
      <Text style={styles.loadingText}>Crafting your ritual…</Text>
      <Text style={styles.loadingCaption}>Weaving your check-in into something beautiful.</Text>
    </View>
  );
}

function RitualStepCard({ step }: { step: RitualStep }) {
  const [done, setDone] = useState(false);
  return (
    <TouchableOpacity onPress={() => setDone((v) => !v)} activeOpacity={0.75}>
      <Card style={[styles.stepCard, done && styles.stepCardDone]}>
        <View style={styles.stepHeader}>
          <View style={styles.stepTitleRow}>
            <View style={[styles.checkbox, done && styles.checkboxDone]}>
              {done && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.stepTitle, done && styles.stepTitleDone]}>{step.title}</Text>
          </View>
          <Text style={styles.stepDuration}>{step.durationMinutes} min</Text>
        </View>
        <Text style={[TextStyles.body, styles.stepDescription, done && styles.stepDescriptionDone]}>
          {step.description}
        </Text>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overline: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xs,
    color: Colors.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.lg,
  },
  subtitle: {
    color: Colors.textSecondary,
  },
  affirmationCard: {
    backgroundColor: `${Colors.blush}20`,
    borderColor: Colors.blush,
    marginBottom: Spacing.xl,
  },
  affirmationLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xs,
    color: Colors.blush,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  affirmationText: {
    fontFamily: Fonts.displayRegular,
    fontSize: FontSizes.lg,
    color: Colors.text,
    fontStyle: 'italic',
  },
  sectionHeading: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.xl,
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  stepCard: {
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  stepTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.text,
    flex: 1,
  },
  stepDuration: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.gold,
  },
  stepCardDone: {
    opacity: 0.6,
    backgroundColor: `${Colors.sage}10`,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxDone: {
    borderColor: Colors.sage,
    backgroundColor: Colors.sage,
  },
  checkmark: {
    fontSize: 11,
    color: '#fff',
    fontFamily: Fonts.bodySemiBold,
  },
  stepTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  stepDescription: {
    color: Colors.textSecondary,
  },
  stepDescriptionDone: {
    color: Colors.textMuted,
  },
  tipCard: {
    backgroundColor: `${Colors.sage}20`,
    borderColor: Colors.sage,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  tipLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xs,
    color: Colors.sage,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  tipText: {
    color: Colors.text,
  },
  cta: {
    marginTop: Spacing.md,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  loadingOrbWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  spinRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 0.7,
    borderColor: `${Colors.gold}60`,
    borderStyle: 'dashed',
  },
  glowOrb: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.gold,
    overflow: 'hidden',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 8,
  },
  glowOrbInner: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    bottom: '10%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,245,210,0.55)',
  },
  glowOrbSpecular: {
    position: 'absolute',
    top: '14%',
    left: '22%',
    width: '28%',
    height: '22%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  loadingText: {
    fontFamily: Fonts.displayRegular,
    fontSize: FontSizes.xl,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  loadingCaption: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
  },
  skinCard: {
    backgroundColor: `${Colors.gold}10`,
    borderColor: Colors.gold,
    marginBottom: Spacing.lg,
  },
  skinLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xs,
    color: Colors.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  skinText: {
    color: Colors.text,
    fontStyle: 'italic',
  },
});
