import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts, FontSizes, Radius, Spacing } from '@/constants/theme';

interface OptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function OptionCard({ label, description, selected, onPress, style }: OptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected && styles.selected,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  selected: {
    borderColor: Colors.gold,
    backgroundColor: `${Colors.gold}12`,
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  labelSelected: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.deepBrown,
  },
  description: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
