import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { OptionCard } from '@/components/ui/OptionCard';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { TextStyles, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';
import type { WellnessGoal } from '@/types/api';

const OPTIONS: { value: WellnessGoal; label: string; description: string }[] = [
  { value: 'hydration', label: 'Hydration', description: 'Plumper, dewier, more radiant skin' },
  { value: 'stress_relief', label: 'Stress relief', description: 'Calmer mornings, softer evenings' },
  { value: 'sleep', label: 'Better sleep', description: 'Deeper rest, brighter mornings' },
  { value: 'nutrition', label: 'Nourishment', description: 'Foods that make your skin sing' },
  { value: 'movement', label: 'Movement', description: 'Rituals that meet your body where it is' },
  { value: 'mindfulness', label: 'Mindfulness', description: 'A few minutes of stillness every day' },
];

export default function GoalsScreen() {
  const { draft, toggleGoal } = useOnboarding();

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <ProgressDots total={5} current={1} />
        <Text style={[TextStyles.display2, styles.title]}>What matters most?</Text>
        <Text style={[TextStyles.body, styles.subtitle]}>
          Pick any that feel right. You can always adjust later.
        </Text>
      </View>

      <View style={styles.options}>
        {OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={draft.goals.includes(option.value)}
            onPress={() => toggleGoal(option.value)}
          />
        ))}
      </View>

      <Button
        label="Continue"
        onPress={() => router.push('/(auth)/schedule')}
        disabled={draft.goals.length === 0}
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
  options: {
    marginBottom: Spacing.xl,
  },
  cta: {
    marginTop: 'auto',
  },
});
