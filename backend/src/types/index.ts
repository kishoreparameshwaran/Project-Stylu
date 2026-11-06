export interface User {
  id: number;
  handle: string;
  email?: string;
  google_id?: string;
  created_at: number;
  settings_json: string;
  is_guest: number;
}

export interface Judge {
  id: number;
  slug: string;
  channel_no: number;
  name: string;
  persona_prompt: string;
  severity: number;
  sort_order: number;
}

export interface Trial {
  id: number;
  case_no: string;
  user_id: number;
  judge_id: number;
  tier: string;
  image_path: string;
  status: 'queued' | 'scanning' | 'done' | 'failed';
  score_10?: number;
  drip_pct?: number;
  title?: string;
  verdict_json?: string;
  appeal_of?: number;
  created_at: number;
  deleted_at?: number;
  share_allowed: number;
}

export interface Verdict {
  case_no: string;
  judge: string;
  tier: string;
  score_10: number;
  drip_pct: number;
  title: string;
  verdict: 'ELITE' | 'APPROVED' | 'PROBATION' | 'GUILTY';
  sentence: string;
  charges: string[];
  categories: {
    tops: { score_10: number; comment: string };
    bottoms: { score_10: number; comment: string };
    footwear: { score_10: number; comment: string };
    accessories: { score_10: number; comment: string };
  };
  fix_tips: string[];
  dresscode_match?: string;
}

export interface Dresscode {
  id: number;
  day_index: number;
  day: string;
  full_name: string;
  title: string;
  score_pct: number;
  description: string;
  rule: string;
  crime: string;
  swatches_json: string;
  items: string;
  status: string;
}

export interface WeekPlan {
  id: number;
  user_id: number;
  week_start: string;
  slots_json: string;
  created_at: number;
}

export interface UserSettings {
  sound: 'ON' | 'MUTED';
  crt: 'HI-RES' | 'ANALOG';
  default_judge?: string;
  auto_delete_days: number;
  share_verdicts: boolean;
  show_on_leaderboard: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  sound: 'ON',
  crt: 'HI-RES',
  auto_delete_days: 30,
  share_verdicts: false,
  show_on_leaderboard: true
};
