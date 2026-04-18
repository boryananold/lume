import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { OptionCard } from '@/components/ui/OptionCard';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { TextStyles, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';

const MORNING_OPTIONS = [
  { value: '06:00', label: 'Early — 6:00' },
  { value: '07:00', label: 'Gentle — 7:00' },
  { value: '08:00', label: 'Unhurried — 8:00' },
  { value: '09:00', label: 'Slow — 9:00' },
];

const EVENING_OPTIONS = [
  { value: '20:00', label: 'Early — 8:00 PM' },
  { value: '21:00', label: 'Classic — 9:00 PM' },
  { value: '22:00', label: 'Later — 10:00 PM' },
  { value: '23:00', label: 'Night owl — 11:00 PM' },
];

export default function ScheduleScreen() {
  const { draft, update } = useOnboarding();

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <ProgressDots total={5} current={2} />
        <Text style={[TextStyles.display2, styles.title]}>Your rhythm</Text>
        <Text style={[TextStyles.body, styles.subtitle]}>
          When should your ritual reminders land?
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Morning</Text>
      <View style={styles.section}>
        {MORNING_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            selected={draft.morningTime === option.value}
            onPress={() => update('morningTime', option.value)}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Evening</Text>
      <View style={styles.section}>
        {EVENING_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            selected={draft.eveningTime === option.value}
            onPress={() => update('eveningTime', option.value)}
          />
        ))}
      </View>

      <Button
        label="Continue"
        onPress={() => router.push('/(auth)/referral')}
        disabled={!draft.morningTime || !draft.eveningTime}
        style={styles.cta}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    opacity: 0.8,
  },
  sectionLabel: {
    ...TextStyles.label,
    color: '#A89880',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  cta: {
    marginTop: Spacing.lg,
  },
});
