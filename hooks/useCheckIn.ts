import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { generateRitual, analyzePhoto } from '@/lib/claude';
import { Events } from '@/lib/mixpanel';
import { scheduleStreakReminder } from '@/lib/braze';
import { computeGlowScore } from '@/utils/glowScore';
import { scheduleStreakNotification } from '@/lib/notifications';
import type { DailyCheckIn, RitualGenerationResponse } from '@/types/api';

interface CheckInState {
  data: RitualGenerationResponse | null;
  skinAnalysis: string | null;
  isLoading: boolean;
  error: Error | null;
}

export function useCheckIn(userId: string, photoUrl?: string) {
  const [state, setState] = useState<CheckInState>({
    data: null,
    skinAnalysis: null,
    isLoading: false,
    error: null,
  });

  const submitCheckIn = useCallback(
    async (checkIn: DailyCheckIn) => {
      setState({ data: null, skinAnalysis: null, isLoading: true, error: null });

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('skin_type, goals')
          .eq('id', userId)
          .single();

        const { data: recentRows } = await supabase
          .from('check_ins')
          .select('completed_at, mood, energy, glow_score')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(7);

        const history = (recentRows ?? []).map((row) => ({
          date: row.completed_at as string,
          mood: row.mood as import('@/types/api').MoodLevel,
          energy: row.energy as import('@/types/api').EnergyLevel,
          glowScore: row.glow_score as number,
        }));

        const skinAnalysis = photoUrl
          ? await analyzePhoto(photoUrl).catch(() => undefined)
          : undefined;

        // Upload photo to Supabase Storage if we have a local URI
        let storedPhotoUrl: string | null = null;
        if (photoUrl) {
          try {
            const ext = photoUrl.split('.').pop()?.split('?')[0] ?? 'jpg';
            const path = `${userId}/${Date.now()}.${ext}`;
            const resp = await fetch(photoUrl);
            const blob = await resp.blob();
            const { error: uploadErr } = await supabase.storage
              .from('photos')
              .upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: false });
            if (!uploadErr) {
              const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path);
              storedPhotoUrl = urlData.publicUrl ?? null;
            }
          } catch {
            // non-fatal — proceed without photo URL
          }
        }

        const ritual = await generateRitual({
          userId,
          skinType: (profile?.skin_type ?? 'normal') as Parameters<typeof generateRitual>[0]['skinType'],
          goals: profile?.goals ?? [],
          checkIn,
          history,
          skinAnalysis,
        });

        await supabase.from('check_ins').insert({
          user_id: userId,
          mood: checkIn.mood,
          energy: checkIn.energy,
          sleep_hours: checkIn.sleepHours,
          stress_level: checkIn.stressLevel,
          notes: checkIn.notes ?? null,
          photo_url: storedPhotoUrl,
          glow_score: computeGlowScore(checkIn),
          completed_at: checkIn.completedAt,
        });

        const glowScore = computeGlowScore(checkIn);
        Events.checkInCompleted(glowScore);
        Events.ritualGenerated();
        scheduleStreakReminder(userId, glowScore);
        void scheduleStreakNotification(glowScore);

        // Update streak
        const today = new Date().toISOString().split('T')[0];
        const { data: streakRow } = await supabase
          .from('streaks')
          .select('current_streak, longest_streak, last_check_in_date')
          .eq('user_id', userId)
          .maybeSingle();

        const lastDate = streakRow?.last_check_in_date ?? null;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let newStreak = 1;
        if (lastDate === today) {
          newStreak = streakRow?.current_streak ?? 1;
        } else if (lastDate === yesterday) {
          newStreak = (streakRow?.current_streak ?? 0) + 1;
        }
        const newLongest = Math.max(newStreak, streakRow?.longest_streak ?? 0);
        await supabase.from('streaks').upsert({
          user_id: userId,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_check_in_date: today,
          updated_at: new Date().toISOString(),
        });

        setState({ data: ritual, skinAnalysis: skinAnalysis ?? null, isLoading: false, error: null });
      } catch (err) {
        setState({ data: null, skinAnalysis: null, isLoading: false, error: err instanceof Error ? err : new Error(String(err)) });
      }
    },
    [userId, photoUrl]
  );

  return { ...state, submitCheckIn };
}
