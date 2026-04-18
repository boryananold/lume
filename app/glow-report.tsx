import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Share, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Fonts, FontSizes, Spacing, TextStyles } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface WeeklyStats {
  totalCheckIns: number;
  avgGlowScore: number;
  bestDay: string;
  bestScore: number;
  avgMood: number;
  avgEnergy: number;
  avgSleep: number;
}

export default function GlowReportScreen() {
  const { data: user } = useCurrentUser();
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    async function load() {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data } = await supabase
        .from('check_ins')
        .select('completed_at, glow_score, mood, energy, sleep_hours')
        .eq('user_id', user!.id)
        .gte('completed_at', sevenDaysAgo)
        .order('completed_at', { ascending: false });

      if (!data || data.length === 0) {
        setIsLoading(false);
        return;
      }

      const scores = data.map((r) => Number(r.glow_score));
      const best = data.reduce((a, b) => Number(a.glow_score) >= Number(b.glow_score) ? a : b);

      setStats({
        totalCheckIns: data.length,
        avgGlowScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
        bestDay: new Date(best.completed_at as string).toLocaleDateString(undefined, { weekday: 'long' }),
        bestScore: Number(best.glow_score),
        avgMood: Math.round((data.reduce((a, b) => a + Number(b.mood), 0) / data.length) * 10) / 10,
        avgEnergy: Math.round((data.reduce((a, b) => a + Number(b.energy), 0) / data.length) * 10) / 10,
        avgSleep: Math.round((data.reduce((a, b) => a + Number(b.sleep_hours), 0) / data.length) * 10) / 10,
      });
      setIsLoading(false);
    }

    void load();
  }, [user?.id]);

  async function handleShare() {
    if (!stats) return;
    try {
      await Share.share({
        message:
          `My Lumé Weekly Glow Report\n\n` +
          `✨ Avg Glow Score: ${stats.avgGlowScore}/10\n` +
          `🔥 Check-ins this week: ${stats.totalCheckIns}/7\n` +
          `🌟 Best day: ${stats.bestDay} (${stats.bestScore}/10)\n` +
          `😌 Avg mood: ${stats.avgMood}/5 | Energy: ${stats.avgEnergy}/5\n` +
          `💤 Avg sleep: ${stats.avgSleep}h\n\n` +
          `Tracked with Lumé — Your light, amplified.`,
      });
    } catch (err) {
      if (err instanceof Error && (err.message.toLowerCase().includes('cancel') || (err as { name?: string }).name === 'AbortError')) return;
    }
  }

  if (isLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator color={Colors.gold} style={{ marginTop: Spacing.xl }} />
      </ScreenContainer>
    );
  }

  if (!stats) {
    return (
      <ScreenContainer>
        <Text style={[TextStyles.display2, styles.title]}>Weekly Glow Report</Text>
        <Card>
          <Text style={[TextStyles.body, { color: Colors.textSecondary }]}>
            Complete your first check-in to see your weekly report.
          </Text>
        </Card>
        <Button label="Back" variant="ghost" onPress={() => router.back()} style={{ marginTop: Spacing.md }} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <Text style={styles.overline}>Your week</Text>
      <Text style={[TextStyles.display2, styles.title]}>Weekly Glow Report</Text>

      <Card elevated style={styles.heroCard}>
        <Text style={styles.heroScore}>{stats.avgGlowScore}</Text>
        <Text style={styles.heroLabel}>Average Glow Score</Text>
        <Text style={styles.heroSub}>{stats.totalCheckIns} of 7 days checked in</Text>
      </Card>

      <Card style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statVal}>{stats.bestDay}</Text>
          <Text style={styles.statLabel}>Best day</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statVal}>{stats.bestScore}/10</Text>
          <Text style={styles.statLabel}>Best score</Text>
        </View>
      </Card>

      <Card style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statVal}>{stats.avgMood}/5</Text>
          <Text style={styles.statLabel}>Avg mood</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statVal}>{stats.avgEnergy}/5</Text>
          <Text style={styles.statLabel}>Avg energy</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statVal}>{stats.avgSleep}h</Text>
          <Text style={styles.statLabel}>Avg sleep</Text>
        </View>
      </Card>

      <Button label="Share my report" onPress={handleShare} style={styles.shareBtn} />
      <Button label="Back" variant="ghost" onPress={() => router.back()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  heroCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
  },
  heroScore: {
    fontFamily: Fonts.displayBold,
    fontSize: 64,
    color: Colors.gold,
    lineHeight: 72,
  },
  heroLabel: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.lg,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  heroSub: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.md,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.xl,
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  shareBtn: {
    marginBottom: Spacing.sm,
  },
});
