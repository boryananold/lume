import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, FontSizes, Radius, Spacing } from '@/constants/theme';

interface ScaleProps {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
}

export function Scale({ label, value, onChange, min = 1, max = 5, lowLabel, highLabel }: ScaleProps) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((n) => (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            style={({ pressed }) => [
              styles.dot,
              value === n && styles.dotSelected,
              pressed && styles.dotPressed,
            ]}
          >
            <Text style={[styles.dotText, value === n && styles.dotTextSelected]}>{n}</Text>
          </Pressable>
        ))}
      </View>
      {(lowLabel || highLabel) && (
        <View style={styles.captions}>
          <Text style={styles.caption}>{lowLabel}</Text>
          <Text style={styles.caption}>{highLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.md,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  dot: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 56,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSelected: {
    backgroundColor: Colors.deepBrown,
    borderColor: Colors.deepBrown,
  },
  dotPressed: {
    opacity: 0.85,
  },
  dotText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  dotTextSelected: {
    color: Colors.cream,
  },
  captions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  caption: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
});
