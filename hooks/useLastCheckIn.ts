import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface LastCheckInState {
  data: { completed_at: string; glow_score: number | null } | null;
  isLoading: boolean;
  error: Error | null;
}

export function useLastCheckIn(userId: string) {
  const [state, setState] = useState<LastCheckInState>({ data: null, isLoading: true, error: null });

  useEffect(() => {
    if (!userId) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await supabase
          .from('check_ins')
          .select('completed_at, glow_score')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
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
