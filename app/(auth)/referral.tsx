import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { OptionCard } from '@/components/ui/OptionCard';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { TextStyles, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';

const SOURCES = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'friend', label: 'A friend' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'search', label: 'Search' },
  { value: 'other', label: 'Somewhere else' },
];

export default function ReferralScreen() {
  const { draft, update } = useOnboarding();

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <ProgressDots total={5} current={3} />
        <Text style={[TextStyles.display2, styles.title]}>How did you find us?</Text>
        <Text style={[TextStyles.body, styles.subtitle]}>
          This helps us reach more women who'd love Lumé.
        </Text>
      </View>

      <View style={styles.options}>
        {SOURCES.map((source) => (
          <OptionCard
            key={source.value}
            label={source.label}
            selected={draft.referralSource === source.value}
            onPress={() => update('referralSource', source.value)}
          />
        ))}
      </View>

      <Button
        label="Continue"
        onPress={() => router.push('/(auth)/circle')}
        disabled={!draft.referralSource}
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
