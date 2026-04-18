import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors, Fonts, FontSizes, Radius, Spacing } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.cream : Colors.deepBrown} />
      ) : (
        <Text style={[styles.labelBase, variantLabelStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
  labelBase: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    letterSpacing: 0.3,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.deepBrown,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.deepBrown,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
});

const variantLabelStyles = StyleSheet.create({
  primary: {
    color: Colors.cream,
  },
  secondary: {
    color: Colors.deepBrown,
  },
  ghost: {
    color: Colors.textSecondary,
  },
});
