import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { CircleRow } from '@/types/db';

interface CircleState {
  data: CircleRow | null;
  memberCount: number;
  isLoading: boolean;
  error: Error | null;
}

export function useCircle(userId: string) {
  const [state, setState] = useState<CircleState>({
    data: null,
    memberCount: 0,
    isLoading: true,
    error: null,
  });

  const load = useCallback(async () => {
    if (!userId) {
      setState({ data: null, memberCount: 0, isLoading: false, error: null });
      return;
    }

    setState((s) => ({ ...s, isLoading: true }));
    try {
      // Find a circle the user created or belongs to
      const { data: created } = await supabase
        .from('circles')
        .select('*')
        .eq('created_by', userId)
        .limit(1)
        .single();

      let circle: CircleRow | null = created as CircleRow | null;

      if (!circle) {
        const { data: membership } = await supabase
          .from('circle_members')
          .select('circles(*)')
          .eq('user_id', userId)
          .limit(1)
          .single();
        circle = (membership as { circles: CircleRow } | null)?.circles ?? null;
      }

      if (!circle) {
        setState({ data: null, memberCount: 0, isLoading: false, error: null });
        return;
      }

      const { count } = await supabase
        .from('circle_members')
        .select('*', { count: 'exact', head: true })
        .eq('circle_id', circle.id);

      setState({ data: circle, memberCount: count ?? 0, isLoading: false, error: null });
    } catch (err) {
      setState({ data: null, memberCount: 0, isLoading: false, error: err instanceof Error ? err : new Error(String(err)) });
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const createCircle = useCallback(async () => {
    const { data, error } = await supabase
      .from('circles')
      .insert({ created_by: userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const circle = data as CircleRow;
    // Add creator as first member
    await supabase.from('circle_members').insert({ circle_id: circle.id, user_id: userId });
    await load();
    return circle;
  }, [userId, load]);

  const joinCircle = useCallback(async (inviteCode: string) => {
    const { data: circle, error: findErr } = await supabase
      .from('circles')
      .select('*')
      .eq('invite_code', inviteCode.trim())
      .single();
    if (findErr || !circle) throw new Error('Invite code not found.');

    const { error: joinErr } = await supabase
      .from('circle_members')
      .insert({ circle_id: circle.id, user_id: userId });
    if (joinErr) throw new Error(joinErr.message);
    await load();
  }, [userId, load]);

  return { ...state, createCircle, joinCircle, reload: load };
}
