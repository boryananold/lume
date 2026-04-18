import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { OnboardingProvider } from '@/hooks/useOnboarding';

export default function AuthLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      />
    </OnboardingProvider>
  );
}
