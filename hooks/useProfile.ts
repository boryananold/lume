import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types/db';

interface ProfileState {
  data: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

export function useProfile(userId: string) {
  const [state, setState] = useState<ProfileState>({
    data: null,
    isLoading: true,
    error: null,
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!userId) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, isLoading: true }));

    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setState({ data: null, isLoading: false, error: new Error(error.message) });
        } else {
          setState({ data: data as UserProfile, isLoading: false, error: null });
        }
      });

    return () => { cancelled = true; };
  }, [userId, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return { ...state, refresh };
}
