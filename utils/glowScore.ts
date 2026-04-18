import type { DailyCheckIn } from '@/types/api';

export function computeGlowScore(checkIn: Pick<DailyCheckIn, 'mood' | 'energy' | 'sleepHours' | 'stressLevel'>): number {
  const base = (checkIn.mood + checkIn.energy) / 2;
  const sleepBonus = checkIn.sleepHours >= 7 ? 1 : 0;
  const stressPenalty = checkIn.stressLevel >= 4 ? -1 : 0;
  return Math.round(Math.min(10, Math.max(1, base * 2 + sleepBonus + stressPenalty)));
}
