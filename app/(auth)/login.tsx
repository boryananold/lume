import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Colors, Fonts, FontSizes, Radius, Spacing, TextStyles } from '@/constants/theme';
import { signInWithEmail, signUpWithEmail, supabase } from '@/lib/supabase';
import { identifyUser } from '@/lib/braze';
import { initRevenueCat } from '@/lib/revenuecat';

// Acceptance criteria: __tests__/acceptance/login.test.ts
// - Email + password fields visible
// - Toggle between Sign in / Create account modes
// - Error message displayed on failed auth
// - Success routes to /(tabs)

type Mode = 'signin' | 'signup';

async function applyPendingOnboardingDraft(userId: string, userEmail: string) {
  try {
    const raw = await AsyncStorage.getItem('lume.onboarding');
    if (!raw) return;
    const draft = JSON.parse(raw) as {
      skinType?: string; goals?: string[];
      morningTime?: string; eveningTime?: string; referralSource?: string;
    };
    await supabase.from('profiles').upsert({
      id: userId,
      email: userEmail,
      skin_type: draft.skinType ?? 'normal',
      goals: draft.goals ?? [],
      morning_time: draft.morningTime ?? null,
      evening_time: draft.eveningTime ?? null,
      referral_source: draft.referralSource ?? null,
    });
  } catch {
    // non-fatal — profile was created by trigger, draft apply is best-effort
  }
}

export default function LoginScreen() {
  const params = useLocalSearchParams<{ signup?: string }>();
  const [mode, setMode] = useState<Mode>(params.signup === '1' ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email || !password) return;
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        identifyUser({ userId: session.user.id, email: session.user.email ?? '', subscriptionTier: 'free' });
        initRevenueCat(session.user.id);
        await applyPendingOnboardingDraft(session.user.id, session.user.email ?? '');
      }
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>Lumé</Text>
          <Text style={TextStyles.display2}>
            {mode === 'signin' ? 'Welcome back.' : 'Start glowing.'}
          </Text>
          <Text style={[TextStyles.body, styles.subtitle]}>
            {mode === 'signin'
              ? 'Sign in to continue your ritual.'
              : 'Create your account to begin.'}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={[styles.label, styles.labelSpaced]}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            placeholder="••••••••"
            placeholderTextColor={Colors.textMuted}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label={mode === 'signin' ? 'Sign in' : 'Create account'}
            onPress={handleSubmit}
            loading={isLoading}
            disabled={!email || !password}
            style={styles.cta}
          />
        </View>

        <TouchableOpacity onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}>
          <Text style={styles.toggle}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <Text style={styles.toggleAccent}>
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xl,
  },
  header: {
    paddingTop: Spacing['2xl'],
  },
  brand: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.md,
    color: Colors.gold,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: Spacing.xl,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  labelSpaced: {
    marginTop: Spacing.md,
  },
  input: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  error: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.error,
    marginTop: Spacing.sm,
  },
  cta: {
    marginTop: Spacing.lg,
  },
  toggle: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingBottom: Spacing.md,
  },
  toggleAccent: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.gold,
  },
});
