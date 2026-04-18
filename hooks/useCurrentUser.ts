import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface CurrentUserState {
  data: User | null;
  isLoading: boolean;
  error: Error | null;
}

export function useCurrentUser() {
  const [state, setState] = useState<CurrentUserState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ data: session?.user ?? null, isLoading: false, error: null });
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ data: session?.user ?? null, isLoading: false, error: null });
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
