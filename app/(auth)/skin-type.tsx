import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { OptionCard } from '@/components/ui/OptionCard';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { TextStyles, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';
import type { SkinType } from '@/types/api';

const OPTIONS: { value: SkinType; label: string; description: string }[] = [
  { value: 'dry', label: 'Dry', description: 'Often feels tight or flaky' },
  { value: 'oily', label: 'Oily', description: 'Shine by midday, visible pores' },
  { value: 'combination', label: 'Combination', description: 'Oily T-zone, dry elsewhere' },
  { value: 'normal', label: 'Normal', description: 'Balanced, rarely reactive' },
  { value: 'sensitive', label: 'Sensitive', description: 'Reacts easily to new products' },
];

export default function SkinTypeScreen() {
  const { draft, update } = useOnboarding();

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <ProgressDots total={5} current={0} />
        <Text style={[TextStyles.display2, styles.title]}>Your skin today</Text>
        <Text style={[TextStyles.body, styles.subtitle]}>
          We'll tune every ritual to how your skin actually feels.
        </Text>
      </View>

      <View style={styles.options}>
        {OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={draft.skinType === option.value}
            onPress={() => update('skinType', option.value)}
          />
        ))}
      </View>

      <Button
        label="Continue"
        onPress={() => router.push('/(auth)/goals')}
        disabled={!draft.skinType}
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
