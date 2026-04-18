import { View, Text, StyleSheet } from 'react-native';
import { ArcMotif } from '@/components/ui/ArcMotif';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Fonts, FontSizes, TextStyles, Spacing } from '@/constants/theme';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useProfile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { useEffect, useRef } from 'react';
import { triggerPaywallCampaign } from '@/lib/braze';
import { greetingForHour, formatToday, daysSince } from '@/utils/greeting';
import { useLastCheckIn } from '@/hooks/useLastCheckIn';
import { useStreak } from '@/hooks/useStreak';
import { useAnnualUpsell } from '@/hooks/useAnnualUpsell';

// Acceptance criteria: __tests__/acceptance/today.test.ts
// - Shows time-based greeting
// - "Begin today's check-in" routes to /check-in
// - Shows current Glow Score + streak summary if available

export default function TodayScreen() {
  const greeting = greetingForHour(new Date().getHours());
  const { data: user } = useCurrentUser();
  const { data: profile } = useProfile(user?.id ?? '');
  const { data: subscription } = useSubscription();
  const tier = subscription?.tier ?? 'free';

  const showPaywallBanner =
    tier === 'free' &&
    !!profile?.created_at &&
    daysSince(profile.created_at) >= 14;

  const firedPaywallRef = useRef(false);
  useEffect(() => {
    if (showPaywallBanner && user?.id && !firedPaywallRef.current) {
      firedPaywallRef.current = true;
      triggerPaywallCampaign(user.id);
    }
  }, [showPaywallBanner, user?.id]);

  const showAnnualUpsell = useAnnualUpsell();

  const { data: lastCheckIn } = useLastCheckIn(user?.id ?? '');
  const { data: streak } = useStreak(user?.id ?? '');
  const today = new Date().toISOString().split('T')[0];
  const lastDate = lastCheckIn?.completed_at?.split('T')[0] ?? null;
  const checkedInToday = lastDate === today;
  const daysMissed = lastCheckIn?.completed_at ? daysSince(lastCheckIn.completed_at) : 0;
  const showWinBack = daysMissed >= 3 && !!user?.id && !checkedInToday;

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Text style={styles.date}>{formatToday()}</Text>
        <Text style={TextStyles.display2}>{greeting}.</Text>
        <Text style={[TextStyles.body, styles.subtitle]}>
          {checkedInToday ? 'Your glow is tended for today.' : 'Your ritual is waiting.'}
        </Text>
      </View>

      {showWinBack && (
        <Card style={styles.winBackCard}>
          <Text style={styles.winBackLabel}>Welcome back ✨</Text>
          <Text style={[TextStyles.body, styles.winBackText]}>
            {daysMissed}d since your last ritual. Your glow is waiting.
          </Text>
          <Button
            label="Return to your ritual"
            onPress={() => router.push({ pathname: '/win-back', params: { days: String(daysMissed) } })}
            style={styles.winBackBtn}
          />
        </Card>
      )}

      {showAnnualUpsell && (
        <Card style={styles.annualCard}>
          <Text style={styles.annualLabel}>Save 40% — go annual</Text>
          <Text style={[TextStyles.body, styles.annualText]}>
            You've been glowing for 2 months. Lock in your ritual with an annual plan.
          </Text>
          <Button
            label="See annual pricing"
            onPress={() => router.push('/paywall')}
            style={styles.annualBtn}
          />
        </Card>
      )}

      {showPaywallBanner && (
        <Card style={styles.paywallCard}>
          <Text style={styles.paywallLabel}>14 days in — you're glowing.</Text>
          <Text style={[TextStyles.body, styles.paywallText]}>
            Unlock unlimited rituals, your full Glow history, and weekly reports.
          </Text>
          <Button
            label="Unlock Glow Plus"
            onPress={() => router.push('/paywall')}
            style={styles.paywallBtn}
          />
        </Card>
      )}

      <Card elevated style={[styles.ctaCard, checkedInToday && styles.ctaCardDone]}>
        <View style={styles.arcWrap} pointerEvents="none">
          <ArcMotif size={140} opacity={0.22} />
        </View>
        {checkedInToday ? (
          <>
            <Text style={styles.ctaLabel}>Ritual complete ✓</Text>
            <Text style={[TextStyles.body, styles.ctaText]}>
              You showed up today. See you tomorrow.
            </Text>
            <Button
              label="Review today's ritual"
              variant="ghost"
              onPress={() => router.push('/check-in')}
            />
          </>
        ) : (
          <>
            <Text style={styles.ctaLabel}>Today's check-in</Text>
            <Text style={[TextStyles.body, styles.ctaText]}>
              Three minutes to tune today's ritual to how you actually feel.
            </Text>
            <Button label="Begin today's check-in" onPress={() => router.push('/check-in')} />
          </>
        )}
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {streak?.current_streak ? `${streak.current_streak} 🔥` : '—'}
          </Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {lastCheckIn?.glow_score != null ? String(lastCheckIn.glow_score) : '—'}
          </Text>
          <Text style={styles.statLabel}>Glow score</Text>
        </Card>
      </View>

      <Card style={styles.hintCard}>
        <Text style={styles.hintLabel}>Today's intention</Text>
        <Text style={styles.hintText}>
          "Softness is a kind of strength — I can hold both."
        </Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.xl,
  },
  date: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: Colors.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginTop: Spacing.xs,
    color: Colors.textSecondary,
  },
  ctaCard: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  ctaCardDone: {
    backgroundColor: `${Colors.sage}12`,
    borderColor: Colors.sage,
  },
  ctaLabel: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.xl,
    color: Colors.text,
  },
  ctaText: {
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  hintCard: {
    backgroundColor: `${Colors.sage}20`,
    borderColor: Colors.sage,
  },
  hintLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xs,
    color: Colors.sage,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  arcWrap: {
    position: 'absolute',
    top: -30,
    right: -30,
    zIndex: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statNumber: {
    fontFamily: Fonts.displayBold,
    fontSize: FontSizes['2xl'],
    color: Colors.text,
    lineHeight: FontSizes['2xl'] * 1.2,
  },
  statLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hintText: {
    fontFamily: Fonts.displayRegular,
    fontSize: FontSizes.lg,
    color: Colors.text,
    fontStyle: 'italic',
    lineHeight: FontSizes.lg * 1.35,
    marginTop: Spacing.xs,
  },
  paywallCard: {
    backgroundColor: `${Colors.gold}12`,
    borderColor: Colors.gold,
    marginBottom: Spacing.md,
  },
  paywallLabel: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.lg,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  paywallText: {
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  paywallBtn: {
    marginTop: Spacing.xs,
  },
  winBackCard: {
    backgroundColor: `${Colors.sage}15`,
    borderColor: Colors.sage,
    marginBottom: Spacing.md,
  },
  winBackLabel: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.md,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  winBackText: {
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  winBackBtn: {
    marginTop: Spacing.xs,
  },
  annualCard: {
    backgroundColor: `${Colors.gold}18`,
    borderColor: Colors.gold,
    marginBottom: Spacing.md,
  },
  annualLabel: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.md,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  annualText: {
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  annualBtn: {
    marginTop: Spacing.xs,
  },
});
