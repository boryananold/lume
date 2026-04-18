import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { GlowScoreRing } from '@/components/ui/GlowScoreRing';
import { Colors, Fonts, FontSizes, Spacing, TextStyles } from '@/constants/theme';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useGlowScore } from '@/hooks/useGlowScore';
import { useStreak } from '@/hooks/useStreak';
import { supabase } from '@/lib/supabase';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface DayBar { day: string; score: number | null }

function WeekTrend({ userId }: { userId: string }) {
  const [bars, setBars] = useState<DayBar[]>([]);

  useEffect(() => {
    if (!userId) return;
    void supabase
      .from('check_ins')
      .select('glow_score, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(7)
      .then(({ data }) => {
        if (!data) return;
        const filled: DayBar[] = Array.from({ length: 7 }, (_, i) => {
          const d = data[6 - i];
          if (!d) return { day: DAY_LABELS[i] ?? '', score: null };
          const label = new Date(d.completed_at as string)
            .toLocaleDateString('en-US', { weekday: 'short' });
          return { day: label, score: Number(d.glow_score) };
        });
        setBars(filled);
      });
  }, [userId]);

  if (!bars.length) return null;
  const max = 10;

  return (
    <Card style={styles.trendCard}>
      <Text style={styles.trendLabel}>7-Day Trend</Text>
      <View style={styles.trendBars}>
        {bars.map((b, i) => (
          <View key={i} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { height: `${b.score != null ? (b.score / max) * 100 : 0}%` },
                  b.score == null && styles.barEmpty,
                ]}
              />
            </View>
            <Text style={styles.barDay}>{b.day.slice(0, 2)}</Text>
            {b.score != null && (
              <Text style={styles.barScore}>{b.score.toFixed(0)}</Text>
            )}
          </View>
        ))}
      </View>
    </Card>
  );
}

// Acceptance criteria: __tests__/acceptance/glow-score.test.ts
// - Shows Glow Score ring with current score
// - Shows streak counter and longest streak
// - Shows 7-day trend

export default function GlowScreen() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const userId = user?.id ?? '';
  const { data: glowScore, isLoading: scoreLoading } = useGlowScore(userId);
  const { data: streak } = useStreak(userId);

  const isLoading = userLoading || (!!userId && scoreLoading);

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Colors.gold} />
        </View>
      </ScreenContainer>
    );
  }

  const currentScore = glowScore?.current ?? 0;
  const currentStreak = streak?.current_streak ?? glowScore?.streak ?? 0;
  const longestStreak = streak?.longest_streak ?? glowScore?.longestStreak ?? 0;

  return (
    <ScreenContainer scroll>
      <Text style={styles.overline}>Your Glow</Text>
      <Text style={[TextStyles.display2, styles.title]}>
        {currentScore >= 7 ? 'You\'re tending well.' : 'Keep tending your light.'}
      </Text>

      <View style={styles.ringWrap}>
        <GlowScoreRing score={currentScore} />
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{longestStreak}</Text>
          <Text style={styles.statLabel}>Longest streak</Text>
        </Card>
      </View>

      <WeekTrend userId={userId} />

      <Card style={styles.insightCard}>
        <Text style={styles.insightLabel}>This week's insight</Text>
        <Text style={[TextStyles.body, styles.insightText]}>
          {currentScore > 0
            ? `Your current Glow Score is ${currentScore.toFixed(1)}. Complete today's check-in to keep your streak alive.`
            : 'Complete your first check-in to start tracking your Glow Score.'}
        </Text>
      </Card>
    </ScreenContainer>
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
    marginBottom: Spacing.xl,
  },
  ringWrap: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Fonts.displayBold,
    fontSize: FontSizes['3xl'],
    color: Colors.text,
  },
  statLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightCard: {
    backgroundColor: `${Colors.sage}15`,
    borderColor: Colors.sage,
    marginBottom: Spacing.md,
  },
  insightLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xs,
    color: Colors.sage,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  insightText: {
    color: Colors.text,
  },
  trendCard: {
    marginBottom: Spacing.md,
  },
  trendLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  trendBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 4,
  },
  barEmpty: {
    backgroundColor: Colors.border,
  },
  barDay: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  barScore: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 9,
    color: Colors.gold,
    textAlign: 'center',
  },
});
