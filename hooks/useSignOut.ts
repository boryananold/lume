import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface SignOutState {
  isLoading: boolean;
  error: Error | null;
}

export function useSignOut() {
  const [state, setState] = useState<SignOutState>({ isLoading: false, error: null });

  const signOut = useCallback(async () => {
    setState({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setState({ isLoading: false, error: null });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setState({ isLoading: false, error: e });
      throw e;
    }
  }, []);

  return { ...state, signOut };
}
