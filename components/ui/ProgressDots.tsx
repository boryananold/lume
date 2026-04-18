import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

interface ProgressDotsProps {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i === current && styles.active, i < current && styles.complete]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  active: {
    backgroundColor: Colors.gold,
    width: 24,
  },
  complete: {
    backgroundColor: Colors.gold,
  },
});
