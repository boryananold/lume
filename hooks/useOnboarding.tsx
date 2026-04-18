import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { requestNotificationPermissions, scheduleDailyReminder } from '@/lib/notifications';
import type { SkinType, WellnessGoal } from '@/types/api';

const STORAGE_KEY = 'lume.onboarding';

export interface OnboardingDraft {
  skinType: SkinType | null;
  goals: WellnessGoal[];
  morningTime: string | null;
  eveningTime: string | null;
  referralSource: string | null;
  circleInviteCodes: string[];
}

const EMPTY_DRAFT: OnboardingDraft = {
  skinType: null,
  goals: [],
  morningTime: null,
  eveningTime: null,
  referralSource: null,
  circleInviteCodes: [],
};

interface OnboardingContextValue {
  draft: OnboardingDraft;
  update: <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => void;
  toggleGoal: (goal: WellnessGoal) => void;
  complete: () => Promise<void>;
  isSaving: boolean;
  error: Error | null;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_DRAFT);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(<K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleGoal = useCallback((goal: WellnessGoal) => {
    setDraft((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal) ? prev.goals.filter((g) => g !== goal) : [...prev.goals, goal],
    }));
  }, []);

  const complete = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, completedAt: new Date().toISOString() }));

      // Persist profile to Supabase if the user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error: upsertError } = await supabase.from('profiles').upsert({
          id: session.user.id,
          email: session.user.email ?? '',
          skin_type: draft.skinType ?? 'normal',
          goals: draft.goals,
          morning_time: draft.morningTime,
          evening_time: draft.eveningTime,
          referral_source: draft.referralSource,
        });
        if (upsertError) throw upsertError;
      }

      const granted = await requestNotificationPermissions();
      if (granted) {
        if (draft.morningTime) await scheduleDailyReminder('morning', draft.morningTime);
        if (draft.eveningTime) await scheduleDailyReminder('evening', draft.eveningTime);
      }
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, [draft]);

  return (
    <OnboardingContext.Provider value={{ draft, update, toggleGoal, complete, isSaving, error }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}
