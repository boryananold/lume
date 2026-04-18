import { StyleSheet } from 'react-native';

export const Colors = {
  gold: '#C9A96E',
  cream: '#F7F3EE',
  deepBrown: '#1A1208',
  blush: '#E8B4B8',
  sage: '#A8C5C0',

  // Semantic
  background: '#F7F3EE',
  surface: '#FFFFFF',
  text: '#1A1208',
  textSecondary: '#6B5B45',
  textMuted: '#A89880',
  border: '#E8E0D5',
  error: '#C0392B',
  success: '#A8C5C0',
} as const;

export const Fonts = {
  displayRegular: 'PlayfairDisplay_400Regular',
  displayMedium: 'PlayfairDisplay_500Medium',
  displayBold: 'PlayfairDisplay_700Bold',
  bodyRegular: 'Lato_400Regular',
  bodyMedium: 'Lato_400Regular',
  bodySemiBold: 'Lato_700Bold',
} as const;

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const Radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 9999,
} as const;

export const Shadows = StyleSheet.create({
  sm: {
    shadowColor: Colors.deepBrown,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.deepBrown,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
});

export const TextStyles = StyleSheet.create({
  display1: {
    fontFamily: Fonts.displayBold,
    fontSize: FontSizes['4xl'],
    color: Colors.text,
    lineHeight: FontSizes['4xl'] * 1.2,
  },
  display2: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes['3xl'],
    color: Colors.text,
    lineHeight: FontSizes['3xl'] * 1.25,
  },
  heading: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes['2xl'],
    color: Colors.text,
    lineHeight: FontSizes['2xl'] * 1.3,
  },
  subheading: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.lg,
    color: Colors.text,
    lineHeight: FontSizes.lg * 1.4,
  },
  body: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: FontSizes.md * 1.6,
  },
  caption: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: FontSizes.sm * 1.5,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
    color: Colors.text,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
