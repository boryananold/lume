import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { GlowScore } from '@/types/api';

interface GlowScoreState {
  data: GlowScore | null;
  isLoading: boolean;
  error: Error | null;
}

export function useGlowScore(userId: string) {
  const [state, setState] = useState<GlowScoreState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data: rows, error } = await supabase
          .from('check_ins')
          .select('glow_score, completed_at')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(2);

        if (error) throw error;

        const current = rows?.[0]?.glow_score ?? 0;
        const previous = rows?.[1]?.glow_score ?? 0;

        const { data: streak } = await supabase
          .from('streaks')
          .select('current_streak, longest_streak, last_check_in_date')
          .eq('user_id', userId)
          .single();

        if (!cancelled) {
          setState({
            data: {
              current,
              previous,
              streak: streak?.current_streak ?? 0,
              longestStreak: streak?.longest_streak ?? 0,
              lastUpdated: rows?.[0]?.completed_at ?? new Date().toISOString(),
            },
            isLoading: false,
            error: null,
          });
        }
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
