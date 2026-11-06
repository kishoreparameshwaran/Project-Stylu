export type JudgeId = 'strict_auntie' | 'genz_judge' | 'news_anchor' | 'sarcastic_stylist' | 'mama_judge';

export type VerdictType = 'FABULOUS' | 'NICE' | 'GOOD' | 'OK' | 'GUILTY' | 'NOT_GUILTY';

export interface JudgePersona {
  id: JudgeId;
  name: string;
  title: string;
  avatar: string;
  tagline: string;
  catchphrase: string;
  severity: 'Brutal' | 'Savage' | 'Dramatic' | 'Passive-Aggressive' | 'Fiery';
  accentColor: string;
  bgGradient: string;
}

export interface QuickOutfitSubmission {
  defendantName: string;
  judgeId: JudgeId;
  top: string;
  bottoms: string;
  shoes: string;
  extras: string[];
  mood: string;
}

export interface CategoryScores {
  colour_match: number;       // 0-100
  fit: number;                // 0-100
  originality: number;        // 0-100
  confidence: number;         // 0-100
  weather_appropriateness: number; // 0-100
}

export interface VerdictResponse {
  case_number: string;
  defendant_name: string;
  judge_id: JudgeId;
  verdict: VerdictType;
  fit_score: number;          // e.g. 3.5, 7.8, 9.2 out of 10
  charges: string[];          // 3 points (charges or compliments)
  sentence: string;           // Dramatic ruling
  category_scores: CategoryScores;
  fix_tips: string[];         // Wardrobe lawyer suggestions
  is_appealed: boolean;
  appeal_note?: string;
  created_at: string;
  outfit_summary: {
    top: string;
    bottoms: string;
    shoes: string;
    extras: string[];
    mood: string;
  };
}
