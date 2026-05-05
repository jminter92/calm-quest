export type TabKey = 'today' | 'log' | 'progress' | 'motivation' | 'settings';

export type DrinkType = 'coffee' | 'tea' | 'energy drink' | 'cola' | 'decaf' | 'other';

export type TriggerLabel =
  | 'afternoon slump'
  | 'autopilot'
  | 'boredom'
  | 'early morning fog'
  | 'low mood'
  | 'poor sleep'
  | 'social cafe'
  | 'stressful work'
  | 'tired'
  | 'other';

export type TriggerOutcome = 'resisted' | 'partial_win' | 'had_caffeine';

export type XpEventType =
  | 'log_caffeine'
  | 'log_trigger'
  | 'resisted_craving'
  | 'partial_win'
  | 'stayed_under_cap'
  | 'three_day_streak'
  | 'seven_day_streak'
  | 'setback';

export interface Profile {
  id: string;
  created_at: string;
}

export interface DailySettings {
  id: string;
  user_id: string;
  caffeine_cap: number;
  cost_per_shot: number | null;
  taper_start_day: string | null;
  taper_end_day: string | null;
  taper_start_cap: number | null;
  taper_end_cap: number | null;
  created_at: string;
  updated_at: string;
}

export interface CaffeineLog {
  id: string;
  user_id: string;
  logged_at: string;
  shots: number;
  drink_type: DrinkType;
  note: string | null;
  trigger_label: TriggerLabel | null;
  created_at: string;
}

export interface TriggerLog {
  id: string;
  user_id: string;
  logged_at: string;
  trigger_label: TriggerLabel;
  craving_intensity: number;
  outcome: TriggerOutcome;
  note: string | null;
  created_at: string;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  day: string;
  mood: number | null;
  energy: number | null;
  sleep_quality: number | null;
  created_at: string;
  updated_at: string;
}

export interface XpEvent {
  id: string;
  user_id: string;
  event_type: XpEventType;
  xp_amount: number;
  related_date: string | null;
  created_at: string;
}

export interface CalmQuestData {
  settings: DailySettings;
  caffeineLogs: CaffeineLog[];
  triggerLogs: TriggerLog[];
  checkins: DailyCheckin[];
  xpEvents: XpEvent[];
}

export interface AppUser {
  id: string;
  email?: string;
  mode: 'supabase' | 'demo';
}
