import { useState, useEffect, useRef } from 'react';
import { generateRitual } from '@/lib/claude';
import type { DailyCheckIn, RitualGenerationResponse, SkinType, WellnessGoal } from '@/types/api';

interface RitualRequest {
  checkIn: DailyCheckIn;
  skinType?: SkinType;
  goals?: WellnessGoal[];
}

interface RitualState {
  data: RitualGenerationResponse | null;
  isLoading: boolean;
  error: Error | null;
}

export function useRitual({ checkIn, skinType = 'normal', goals = [] }: RitualRequest) {
  const [state, setState] = useState<RitualState>({
    data: null,
    isLoading: true,
    error: null,
  });

  // Capture initial values in a ref so the effect runs exactly once.
  // Check-in params are fixed for the ritual screen's lifetime.
  const requestRef = useRef({ checkIn, skinType, goals });

  useEffect(() => {
    let cancelled = false;
    const { checkIn: ci, skinType: st, goals: g } = requestRef.current;

    async function load() {
      try {
        const ritual = await generateRitual({
          userId: 'preview',
          skinType: st,
          goals: g,
          checkIn: ci,
          history: [],
        });
        if (!cancelled) setState({ data: ritual, isLoading: false, error: null });
      } catch (err) {
        if (!cancelled) {
          setState({
            data: null,
            isLoading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []); // Intentionally runs once: request values captured in ref above

  return state;
}
