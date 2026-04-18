import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Share, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors, Fonts, FontSizes, Radius, Spacing, TextStyles } from '@/constants/theme';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCircle } from '@/hooks/useCircle';

// Acceptance criteria: __tests__/acceptance/circle.test.ts
// - Shows create/join options when no circle exists
// - Shows invite code + share button when circle exists
// - Join via invite code updates the circle view

export default function CircleScreen() {
  const { data: user } = useCurrentUser();
  const userId = user?.id ?? '';
  const { data: circle, memberCount, isLoading, createCircle, joinCircle } = useCircle(userId);
  const [joinCode, setJoinCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setActionLoading(true);
    setError(null);
    try {
      await createCircle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create Circle.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setActionLoading(true);
    setError(null);
    try {
      await joinCircle(joinCode);
      setJoinCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join Circle.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleShare() {
    if (!circle) return;
    try {
      await Share.share({
        message: `Join my Lumé Circle and glow together 🌟\nInvite code: ${circle.invite_code}`,
      });
    } catch (err) {
      if (err instanceof Error && err.message.toLowerCase().includes('cancel')) return;
      if (err instanceof Error && (err as { name?: string }).name === 'AbortError') return;
    }
  }

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.gold} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <Text style={styles.overline}>Accountability</Text>
      <Text style={[TextStyles.display2, styles.title]}>Your Circle</Text>
      <Text style={[TextStyles.body, styles.subtitle]}>
        Women with accountability partners are 2.3× more likely to keep their streak.
      </Text>

      {circle ? (
        <>
          <Card style={styles.codeCard}>
            <Text style={styles.cardLabel}>Invite code</Text>
            <Text style={styles.code}>{circle.invite_code}</Text>
            <Text style={[TextStyles.body, styles.memberCount]}>
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </Text>
            <Button label="Share invite" onPress={handleShare} style={styles.btn} />
          </Card>

          <Card style={styles.insightCard}>
            <Text style={styles.cardLabel}>Keep going</Text>
            <Text style={TextStyles.body}>
              Your Circle sees your streak. Show up for them — and for yourself.
            </Text>
          </Card>
        </>
      ) : (
        <>
          <Button
            label={actionLoading ? 'Creating…' : 'Create a Circle'}
            onPress={handleCreate}
            disabled={actionLoading || !userId}
            style={styles.btn}
          />

          <Text style={styles.or}>— or join one —</Text>

          <Card style={styles.joinCard}>
            <Text style={styles.cardLabel}>Join with an invite code</Text>
            <TextInput
              style={styles.input}
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="e.g. a1b2c3d4"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
            />
            <Button
              label={actionLoading ? 'Joining…' : 'Join'}
              onPress={handleJoin}
              disabled={actionLoading || !joinCode.trim()}
              style={styles.btn}
            />
          </Card>
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
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
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeCard: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  code: {
    fontFamily: Fonts.displayBold,
    fontSize: FontSizes['3xl'],
    color: Colors.gold,
    letterSpacing: 6,
    marginBottom: Spacing.xs,
  },
  memberCount: {
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  insightCard: {
    backgroundColor: `${Colors.sage}15`,
    borderColor: Colors.sage,
  },
  joinCard: {
    marginTop: Spacing.sm,
  },
  input: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  btn: {
    marginTop: Spacing.sm,
  },
  or: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginVertical: Spacing.lg,
  },
  error: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
