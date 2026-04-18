import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors, Fonts, FontSizes, Radius, Spacing, TextStyles } from '@/constants/theme';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useProfile } from '@/hooks/useProfile';
import { useSignOut } from '@/hooks/useSignOut';
import { supabase } from '@/lib/supabase';
import type { SkinType, WellnessGoal } from '@/types/api';

// Acceptance criteria: __tests__/acceptance/profile.test.ts
// - Shows user email and skin type
// - Shows wellness goals as pills
// - Sign out routes to login

const SKIN_TYPES: { value: SkinType; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'dry', label: 'Dry' },
  { value: 'oily', label: 'Oily' },
  { value: 'combination', label: 'Combination' },
  { value: 'sensitive', label: 'Sensitive' },
];

const GOALS: { value: WellnessGoal; label: string }[] = [
  { value: 'hydration', label: 'Hydration' },
  { value: 'stress_relief', label: 'Stress Relief' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'movement', label: 'Movement' },
  { value: 'mindfulness', label: 'Mindfulness' },
];

export default function ProfileScreen() {
  const { data: user } = useCurrentUser();
  const { data: profile, isLoading, refresh: refreshProfile } = useProfile(user?.id ?? '');
  const { isLoading: signingOut, signOut } = useSignOut();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [skinType, setSkinType] = useState<SkinType | null>(null);
  const [goals, setGoals] = useState<WellnessGoal[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  function startEdit() {
    setDisplayName(profile?.display_name ?? '');
    setSkinType((profile?.skin_type as SkinType) ?? 'normal');
    setGoals((profile?.goals as WellnessGoal[]) ?? []);
    setEditing(true);
  }

  function toggleGoal(g: WellnessGoal) {
    setGoals((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  }

  async function saveEdit() {
    if (!user?.id) return;
    setSaving(true);
    await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() || null, skin_type: skinType, goals })
      .eq('id', user.id);
    setSaving(false);
    setEditing(false);
    refreshProfile();
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.overline}>Your account</Text>
          <Text style={[TextStyles.display2, styles.title]}>Profile</Text>
        </View>
        {!editing && profile && (
          <TouchableOpacity onPress={startEdit} style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>Display name</Text>
        <Text style={[TextStyles.body, styles.cardValue]}>
          {profile?.display_name || user?.email?.split('@')[0] || '—'}
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>Email</Text>
        <Text style={[TextStyles.body, styles.cardValue]}>{user?.email ?? '—'}</Text>
      </Card>

      {!isLoading && profile && !editing && (
        <>
          <Card style={styles.card}>
            <Text style={styles.cardLabel}>Skin type</Text>
            <Text style={[TextStyles.body, styles.cardValue]}>
              {SKIN_TYPES.find((s) => s.value === profile.skin_type)?.label ?? 'Normal'}
            </Text>
          </Card>

          {profile.goals.length > 0 && (
            <Card style={styles.card}>
              <Text style={styles.cardLabel}>Wellness goals</Text>
              <View style={styles.pillRow}>
                {profile.goals.map((goal) => (
                  <View key={goal} style={styles.pill}>
                    <Text style={styles.pillText}>{goal.replace(/_/g, ' ')}</Text>
                  </View>
                ))}
              </View>
            </Card>
          )}
        </>
      )}

      {editing && (
        <>
          <Card style={styles.card}>
            <Text style={styles.cardLabel}>Display name</Text>
            <TextInput
              style={styles.nameInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
              maxLength={40}
              autoCorrect={false}
            />
          </Card>

          <Card style={styles.card}>
            <Text style={styles.cardLabel}>Skin type</Text>
            <View style={styles.chipRow}>
              {SKIN_TYPES.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  onPress={() => setSkinType(s.value)}
                  style={[styles.chip, skinType === s.value && styles.chipActive]}
                >
                  <Text style={[styles.chipText, skinType === s.value && styles.chipTextActive]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.cardLabel}>Wellness goals</Text>
            <View style={styles.chipRow}>
              {GOALS.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  onPress={() => toggleGoal(g.value)}
                  style={[styles.chip, goals.includes(g.value) && styles.chipActive]}
                >
                  <Text style={[styles.chipText, goals.includes(g.value) && styles.chipTextActive]}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <View style={styles.editActions}>
            <Button label={saving ? 'Saving…' : 'Save changes'} onPress={saveEdit} loading={saving} style={{ flex: 1 }} />
            <Button label="Cancel" variant="ghost" onPress={() => setEditing(false)} style={{ flex: 1 }} />
          </View>
        </>
      )}

      <Text style={styles.sectionLabel}>My reports</Text>
      <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/glow-report')}>
        <Text style={styles.menuItem}>Weekly Glow Report</Text>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/photos')}>
        <Text style={styles.menuItem}>Before &amp; After Photos</Text>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>Glow Elite</Text>
      <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/booking')}>
        <Text style={styles.menuItem}>Book an Expert Session</Text>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>

      {confirmSignOut ? (
        <View style={styles.signOutConfirm}>
          <Text style={styles.signOutQuestion}>Sign out of Lumé?</Text>
          <View style={styles.signOutActions}>
            <Button
              label="Yes, sign out"
              onPress={() => signOut().then(() => router.replace('/(auth)/login')).catch(() => null)}
              loading={signingOut}
              style={{ flex: 1 }}
            />
            <Button label="Cancel" variant="ghost" onPress={() => setConfirmSignOut(false)} style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <Button
          label="Sign out"
          variant="ghost"
          onPress={() => setConfirmSignOut(true)}
          style={styles.signOut}
        />
      )}
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
  card: {
    marginBottom: Spacing.sm,
  },
  cardLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  cardValue: {
    color: Colors.text,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  pill: {
    backgroundColor: `${Colors.gold}15`,
    borderColor: Colors.gold,
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  pillText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.xs,
    color: Colors.gold,
    textTransform: 'capitalize',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  editBtn: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  editBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
    color: Colors.gold,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    borderColor: Colors.gold,
    backgroundColor: `${Colors.gold}15`,
  },
  chipText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.gold,
  },
  editActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  signOut: {
    marginTop: Spacing.xl,
  },
  signOutConfirm: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  signOutQuestion: {
    fontFamily: Fonts.displayRegular,
    fontSize: FontSizes.lg,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  signOutActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItem: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  menuArrow: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.xl,
    color: Colors.textMuted,
  },
  nameInput: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.md,
    color: Colors.text,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginTop: Spacing.xs,
  },
});
