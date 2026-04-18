export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  skin_type: string | null;
  goals: string[];
  created_at: string;
  updated_at: string;
}

export interface CheckInRow {
  id: string;
  user_id: string;
  mood: number;
  energy: number;
  sleep_hours: number;
  stress_level: number;
  notes: string | null;
  photo_url: string | null;
  glow_score: number;
  completed_at: string;
  created_at: string;
}

export interface RitualRow {
  id: string;
  user_id: string;
  check_in_id: string;
  morning_ritual: unknown;
  evening_ritual: unknown;
  affirmation: string;
  glow_tip: string;
  generated_at: string;
}

export interface StreakRow {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_check_in_date: string;
  updated_at: string;
}

export interface CircleRow {
  id: string;
  name: string;
  created_by: string;
  invite_code: string;
  created_at: string;
}

export interface CircleMemberRow {
  circle_id: string;
  user_id: string;
  joined_at: string;
}

export type Tables = {
  profiles: UserProfile;
  check_ins: CheckInRow;
  rituals: RitualRow;
  streaks: StreakRow;
  circles: CircleRow;
  circle_members: CircleMemberRow;
};
