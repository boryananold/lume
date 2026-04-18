import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, FontSizes } from '@/constants/theme';

interface GlowScoreRingProps {
  score: number;
  max?: number;
  size?: number;
}

export function GlowScoreRing({ score, max = 10, size = 180 }: GlowScoreRingProps) {
  const pct = Math.min(1, Math.max(0, score / max));
  const thickness = 10;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderWidth: thickness }]} />
      <View
        style={[
          styles.ringFilled,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: thickness,
            transform: [{ rotate: `${pct * 360 - 90}deg` }],
            opacity: pct > 0 ? 1 : 0,
          },
        ]}
      />
      <View style={styles.center}>
        <Text style={styles.score}>{score.toFixed(1)}</Text>
        <Text style={styles.label}>Glow Score</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderColor: Colors.border,
  },
  ringFilled: {
    position: 'absolute',
    borderColor: Colors.gold,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  center: {
    alignItems: 'center',
  },
  score: {
    fontFamily: Fonts.displayBold,
    fontSize: FontSizes['4xl'],
    color: Colors.text,
    lineHeight: FontSizes['4xl'] * 1.1,
  },
  label: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.xs,
    color: Colors.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
