export interface RitualGenerationRequest {
  userId: string;
  skinType: SkinType;
  goals: WellnessGoal[];
  checkIn: DailyCheckIn;
  history: CheckInSummary[];
}

export interface RitualGenerationResponse {
  morningRitual: RitualStep[];
  eveningRitual: RitualStep[];
  affirmation: string;
  glowTip: string;
  generatedAt: string;
}

export interface RitualStep {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  category: RitualCategory;
}

export interface DailyCheckIn {
  mood: MoodLevel;
  energy: EnergyLevel;
  sleepHours: number;
  stressLevel: StressLevel;
  notes?: string;
  photoUri?: string;
  completedAt: string;
}

export interface CheckInSummary {
  date: string;
  mood: MoodLevel;
  energy: EnergyLevel;
  glowScore: number;
}

export type SkinType = 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive';
export type WellnessGoal = 'hydration' | 'stress_relief' | 'sleep' | 'nutrition' | 'movement' | 'mindfulness';
export type RitualCategory = 'skincare' | 'movement' | 'nutrition' | 'mindfulness' | 'sleep';
export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type StressLevel = 1 | 2 | 3 | 4 | 5;

export type SubscriptionTier = 'free' | 'glow_plus' | 'glow_elite' | 'glow_circle';

export interface GlowScore {
  current: number;
  previous: number;
  streak: number;
  longestStreak: number;
  lastUpdated: string;
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
}
