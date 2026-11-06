import { z } from 'zod';

// Trial submission validation
export const trialSubmissionSchema = z.object({
  judge_slug: z.string().min(1),
  tier: z.enum(['standard', 'premium', 'vip']).default('standard'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Consent required before AI processing' })
  })
});

// Settings validation
export const settingsSchema = z.object({
  sound: z.enum(['ON', 'MUTED']).optional(),
  crt: z.enum(['HI-RES', 'ANALOG']).optional(),
  default_judge: z.string().optional(),
  auto_delete_days: z.number().int().min(1).max(365).optional(),
  share_verdicts: z.boolean().optional(),
  show_on_leaderboard: z.boolean().optional()
});

// Verdict schema (for AI output validation)
export const verdictSchema = z.object({
  case_no: z.string(),
  judge: z.string(),
  tier: z.string(),
  score_10: z.number().min(0).max(10),
  drip_pct: z.number().int().min(0).max(100),
  title: z.string(),
  verdict: z.enum(['ELITE', 'APPROVED', 'PROBATION', 'GUILTY']),
  sentence: z.string(),
  charges: z.array(z.string()).min(1).max(3),
  categories: z.object({
    tops: z.object({
      score_10: z.number().min(0).max(10),
      comment: z.string()
    }),
    bottoms: z.object({
      score_10: z.number().min(0).max(10),
      comment: z.string()
    }),
    footwear: z.object({
      score_10: z.number().min(0).max(10),
      comment: z.string()
    }),
    accessories: z.object({
      score_10: z.number().min(0).max(10),
      comment: z.string()
    })
  }),
  fix_tips: z.array(z.string()),
  dresscode_match: z.string().optional()
});

// Image validation constants
export const IMAGE_CONFIG = {
  MAX_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10'),
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_DIMENSION: parseInt(process.env.MAX_IMAGE_DIMENSION || '1280'),
  MAGIC_BYTES: {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/webp': [0x52, 0x49, 0x46, 0x46] // RIFF
  }
};
