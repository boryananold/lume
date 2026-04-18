import { ReactNode, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';

interface ScreenContainerProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
}

export function ScreenContainer({ children, scroll = false, padded = true, style }: ScreenContainerProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const contentStyle = [styles.content, padded && styles.padded, style];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Animated.View style={[styles.fade, { opacity: fadeAnim }]}>
        {scroll ? (
          <ScrollView contentContainerStyle={contentStyle} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={contentStyle}>{children}</View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  fade: {
    flex: 1,
  },
});
