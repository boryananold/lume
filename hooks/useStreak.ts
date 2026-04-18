import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { StreakRow } from '@/types/db';

interface StreakState {
  data: StreakRow | null;
  isLoading: boolean;
  error: Error | null;
}

export function useStreak(userId: string) {
  const [state, setState] = useState<StreakState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await supabase
          .from('streaks')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!cancelled) setState({ data: data ?? null, isLoading: false, error: null });
      } catch (err) {
        if (!cancelled) {
          setState({ data: null, isLoading: false, error: err instanceof Error ? err : new Error(String(err)) });
        }
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [userId]);

  return state;
}
