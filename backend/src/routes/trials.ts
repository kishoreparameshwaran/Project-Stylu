import { Router, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import multer from 'multer';
import { ImageService } from '../services/imageService';
import { AiService } from '../services/aiService';
import { queries } from '../config/database';

const router = Router();

// Multer memory storage (keeps in memory buffer before sharp optimization)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP) are permitted'));
    }
  },
});

// 5 Rating Tiers requested: FABULOUS, NICE, GOOD, OK, GUILTY
export type VerdictTier = 'FABULOUS' | 'NICE' | 'GOOD' | 'OK' | 'GUILTY';

export function scoreToTier(score: number): VerdictTier {
  if (score >= 9.0) return 'FABULOUS';
  if (score >= 7.5) return 'NICE';
  if (score >= 6.0) return 'GOOD';
  if (score >= 4.0) return 'OK';
  return 'GUILTY';
}

function generateJudgeVerdict(judge: { name: string; slug: string }, tier: string, caseNo: string) {
  // Weighted tier distribution: 20% FABULOUS, 30% NICE, 25% GOOD, 15% OK, 10% GUILTY
  const rand = Math.random();
  let verdict: VerdictTier = 'GOOD';
  let score_10 = 7.0;

  if (rand < 0.20) {
    verdict = 'FABULOUS';
    score_10 = parseFloat((9.0 + Math.random() * 0.9).toFixed(1));
  } else if (rand < 0.50) {
    verdict = 'NICE';
    score_10 = parseFloat((7.5 + Math.random() * 1.3).toFixed(1));
  } else if (rand < 0.75) {
    verdict = 'GOOD';
    score_10 = parseFloat((6.0 + Math.random() * 1.4).toFixed(1));
  } else if (rand < 0.90) {
    verdict = 'OK';
    score_10 = parseFloat((4.0 + Math.random() * 1.9).toFixed(1));
  } else {
    verdict = 'GUILTY';
    score_10 = parseFloat((2.0 + Math.random() * 1.8).toFixed(1));
  }

  const drip_pct = Math.round(score_10 * 10);

  let title = '';
  let sentence = '';
  let charges: string[] = [];
  let categories = {
    tops: { score_10: parseFloat(Math.min(10, Math.max(1, score_10 + (Math.random() * 0.8 - 0.4))).toFixed(1)), comment: 'Cut and proportions analyzed' },
    bottoms: { score_10: parseFloat(Math.min(10, Math.max(1, score_10 + (Math.random() * 0.8 - 0.4))).toFixed(1)), comment: 'Fit and drape inspected' },
    footwear: { score_10: parseFloat(Math.min(10, Math.max(1, score_10 + (Math.random() * 0.8 - 0.4))).toFixed(1)), comment: 'Footwear condition and harmony evaluated' },
    accessories: { score_10: parseFloat(Math.min(10, Math.max(1, score_10 + (Math.random() * 0.8 - 0.4))).toFixed(1)), comment: 'Accents and hardware checked' }
  };
  let fix_tips: string[] = [];

  switch (verdict) {
    case 'FABULOUS':
      title = '✨ FABULOUS // RUNWAY ROYALTY';
      sentence = 'Supreme drip detected! Flawless silhouette balance, impeccable color coordination, and standout confidence.';
      charges = [
        'Impeccable silhouette tension with museum-grade balance across all layers.',
        'Colorway harmony executed with masterclass aesthetic confidence.',
        'Main-character aura that demands sidewalk attention and admiration.'
      ];
      fix_tips = [
        'Preserve this exact styling formula. Perfect as a signature high-stakes outfit!'
      ];
      break;

    case 'NICE':
      title = '🔥 NICE // CERTIFIED FRESH';
      sentence = 'Very sharp styling! Proportions are well-curated and each garment works together seamlessly.';
      charges = [
        'Clean garment proportions with natural, flattering drape.',
        'Color coordination demonstrates genuine aesthetic intuition and style.',
        'Accessories complement the base outfit with effortless swagger.'
      ];
      fix_tips = [
        'Add a structured accessory or subtle statement piece to push this into FABULOUS territory!'
      ];
      break;

    case 'GOOD':
      title = '👍 GOOD // SOLID LOOK';
      sentence = 'Clean and dependable look. Good basic coordination with solid everyday aesthetic.';
      charges = [
        'Comfortable, dependable styling with neat lines and proper fit.',
        'Everyday essentials paired with thoughtful coherence and clean finish.',
        'Versatile palette suitable for casual and social settings.'
      ];
      fix_tips = [
        'Experiment with footwear contrast or layer textures to add more visual depth.'
      ];
      break;

    case 'OK':
      title = '⚡ OK // AVERAGE FIT';
      sentence = 'Decent baseline outfit, but plays it safe. Needs a standout accent or tailored tweaks to shine.';
      charges = [
        'Baseline garments are in order, but the fit lacks a distinctive focal accent.',
        'Proportions could be elevated with a cleaner cuff break or tighter silhouette.',
        'Color palette is slightly timid; could benefit from intentional contrast.'
      ];
      fix_tips = [
        'Swap one neutral item for a statement color or upgrade shoes to immediately elevate the look.'
      ];
      break;

    case 'GUILTY':
    default:
      title = '🚨 GUILTY // FASHION CITATION';
      sentence = 'Major aesthetic clash detected! Proportions and colors conflict. Time for a wardrobe restyle!';
      charges = [
        'Silhouette imbalance causing upper and lower garments to conflict.',
        'Uncoordinated color contrast creating distracting visual noise.',
        'Footwear and accents do not align with the overall outfit theme.'
      ];
      fix_tips = [
        'Stick to a maximum of 3 harmonious colors and rebalance top-to-bottom proportions.'
      ];
      break;
  }

  // Judge flavor prefix for sentence
  switch (judge.slug) {
    case 'mall-cop':
      sentence = `[CH 01 // OFFICER RANDY]: ${sentence}`;
      break;
    case 'harajuku-elite':
      sentence = `[CH 02 // REN]: ${sentence}`;
      break;
    case 'vintage-thrift-king':
      sentence = `[CH 03 // SILAS]: ${sentence}`;
      break;
    case 'runway-czar':
      sentence = `[CH 05 // JULIAN VANCE]: ${sentence}`;
      break;
    case 'strict-auntie':
    default:
      sentence = `[CH 04 // AUNTIE SUNITA]: ${sentence}`;
      break;
  }

  return {
    case_no: caseNo,
    judge: judge.name,
    tier: tier.toUpperCase(),
    score_10,
    drip_pct,
    title,
    verdict,
    rating: verdict,
    sentence,
    charges,
    categories,
    fix_tips,
    dresscode_match: true
  };
}

// Handle trial submission
async function submitTrialHandler(req: Request, res: Response) {
  try {
    // 1. Validate Consent
    const consent = req.body.consent;
    if (consent !== 'true' && consent !== true) {
      return res.status(400).json({ error: 'User consent required for AI outfit analysis' });
    }

    // 2. Validate File
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No outfit image provided' });
    }

    // 3. User & Judge identification
    const userId = req.user?.id || 1;
    const judgeSlug = (req.body.judge_slug || req.body.judgeId || 'strict-auntie').toString().toLowerCase().trim();
    const tier = (req.body.tier || 'STANDARD').toString().toUpperCase();

    let judge = queries.getJudgeBySlug.get(judgeSlug);
    if (!judge) {
      const allJudges = queries.getAllJudges.all();
      judge = allJudges.find((j: any) => j.slug.includes(judgeSlug) || judgeSlug.includes(j.slug)) || allJudges[0] || {
        id: 4,
        slug: 'strict-auntie',
        name: 'STRICT AUNTIE',
        channel_no: 4
      };
    }

    // 4. Process image through Sharp via ImageService
    const processed = await ImageService.processImage(file.buffer);

    // 5. Save optimized image to uploads directory
    const filename = `fit-${Date.now()}-${nanoid(6)}.jpg`;
    await ImageService.saveToFile(processed.buffer, filename);
    const photoUrl = `/uploads/${filename}`;

    // 6. Generate Case Number
    const caseSuffix = ['A', 'B', 'C', 'D', 'X', 'Z'][Math.floor(Math.random() * 6)];
    const caseNumber = `#${Math.floor(1000 + Math.random() * 9000)}-${caseSuffix}`;

    // 7. Generate verdict (Mock or Claude Vision)
    let verdictObj: any;
    const isMock = process.env.MOCK_AI === 'true' || !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes('your_api_key');

    if (isMock) {
      verdictObj = generateJudgeVerdict(judge, tier, caseNumber);
    } else {
      try {
        const aiResult = await AiService.judgeOutfitPhoto(
          processed.base64,
          judge.slug,
          req.user?.handle || 'Defendant'
        );

        const score_10 = aiResult.fit_score;
        const drip_pct = Math.round(score_10 * 10);
        const ratingTier = scoreToTier(score_10);

        verdictObj = {
          case_no: caseNumber,
          judge: judge.name,
          tier,
          score_10,
          drip_pct,
          title: `${ratingTier} // OUTFIT EVALUATION`,
          verdict: ratingTier,
          rating: ratingTier,
          sentence: aiResult.sentence,
          charges: aiResult.charges,
          categories: {
            tops: { score_10: parseFloat((score_10 * 0.95).toFixed(1)), comment: aiResult.outfit_detected?.top || 'Fit analyzed' },
            bottoms: { score_10: parseFloat((score_10 * 1.02).toFixed(1)), comment: aiResult.outfit_detected?.bottoms || 'Cut analyzed' },
            footwear: { score_10: parseFloat((score_10 * 0.98).toFixed(1)), comment: aiResult.outfit_detected?.shoes || 'Footwear examined' },
            accessories: { score_10: parseFloat((score_10 * 0.92).toFixed(1)), comment: aiResult.outfit_detected?.accessories?.join(', ') || 'Accents inspected' }
          },
          fix_tips: aiResult.fix_tips,
          dresscode_match: true
        };
      } catch (err) {
        console.warn('AI Vision error, falling back to persona generator:', err);
        verdictObj = generateJudgeVerdict(judge, tier, caseNumber);
      }
    }

    // 8. Persist Trial into Database
    const trialRecord = queries.createTrial.get(
      caseNumber,
      userId,
      judge.id,
      tier.toLowerCase(),
      photoUrl
    );

    queries.updateTrialVerdict.run(
      'done',
      verdictObj.score_10,
      verdictObj.drip_pct,
      verdictObj.title,
      JSON.stringify(verdictObj),
      trialRecord.id
    );

    return res.status(201).json({
      trial_id: trialRecord.id,
      case_no: caseNumber,
      photo_url: photoUrl,
      verdict: verdictObj
    });
  } catch (err: any) {
    console.error('Trial submission error:', err);
    return res.status(500).json({ error: err.message || 'Failed to submit trial' });
  }
}

// POST /api/trials - Main Outfit Submission Route
router.post('/', upload.single('image'), submitTrialHandler);

// Alias for photo upload endpoint
router.post('/photo', upload.single('photo'), submitTrialHandler);

// GET /api/trials - List user trials (My Cases)
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || 1;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const offset = Math.max(0, parseInt(req.query.offset as string, 10) || 0);

    const rows = queries.getTrialsByUser.all(userId, limit, offset);
    const trials = rows.map((r: any) => {
      let parsedVerdict = null;
      if (r.verdict_json) {
        try {
          parsedVerdict = JSON.parse(r.verdict_json);
        } catch (e) {
          parsedVerdict = r.verdict_json;
        }
      }
      return {
        id: r.id,
        case_no: r.case_no,
        tier: r.tier,
        photo_url: r.image_path,
        status: r.status,
        score_10: r.score_10,
        drip_pct: r.drip_pct,
        title: r.title,
        judge_name: r.judge_name || 'STRICT AUNTIE',
        judge_slug: r.judge_slug || 'strict-auntie',
        channel_no: r.channel_no || 4,
        created_at: r.created_at,
        verdict: parsedVerdict
      };
    });

    return res.json({ trials, total: trials.length });
  } catch (err: any) {
    console.error('Failed to retrieve cases:', err);
    return res.status(500).json({ error: 'Failed to retrieve cases' });
  }
});

// GET /api/trials/:id - Retrieve trial details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const trialId = parseInt(req.params.id, 10);
    if (isNaN(trialId)) {
      return res.status(400).json({ error: 'Invalid trial ID' });
    }

    const trial = queries.getTrialById.get(trialId);
    if (!trial) {
      return res.status(404).json({ error: 'Trial not found' });
    }

    let parsedVerdict = null;
    if (trial.verdict_json) {
      try {
        parsedVerdict = JSON.parse(trial.verdict_json);
      } catch (e) {
        parsedVerdict = trial.verdict_json;
      }
    }

    return res.json({
      trial: {
        ...trial,
        verdict: parsedVerdict
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve trial' });
  }
});

// DELETE /api/trials/:id - Soft delete a trial (expunge from docket)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const trialId = parseInt(req.params.id, 10);
    if (isNaN(trialId)) {
      return res.status(400).json({ error: 'Invalid trial ID' });
    }

    const userId = req.user?.id || 1;
    const trial = queries.getTrialById.get(trialId);
    if (!trial) {
      return res.status(404).json({ error: 'Trial not found' });
    }

    // Soft delete
    queries.softDeleteTrialByUser.run(trialId, userId);

    return res.json({
      success: true,
      message: `Case ${trial.case_no} expunged from courtroom registry.`
    });
  } catch (err: any) {
    console.error('Delete trial error:', err);
    return res.status(500).json({ error: 'Failed to delete case' });
  }
});

// POST /api/trials/:id/appeal - File an appeal with persistent DB updates
router.post('/:id/appeal', async (req: Request, res: Response) => {
  try {
    const trialId = parseInt(req.params.id, 10);
    if (isNaN(trialId)) {
      return res.status(400).json({ error: 'Invalid trial ID' });
    }

    const trial = queries.getTrialById.get(trialId);
    if (!trial) {
      return res.status(404).json({ error: 'Trial not found' });
    }

    let parsedVerdict: any = null;
    if (trial.verdict_json) {
      try {
        parsedVerdict = JSON.parse(trial.verdict_json);
      } catch (e) {
        parsedVerdict = null;
      }
    }

    const currentTier = parsedVerdict?.verdict || 'OK';
    const isOverturned = Math.random() > 0.45;
    const appealNote = isOverturned
      ? 'Upon re-examining the daylight balance and silhouette lines, the appellate bench commuted your sentence on grounds of misunderstood avant-garde vision.'
      : `Appellate bench upheld the initial decision. Your ${currentTier} rating remains locked in public records.`;

    // If overturned, update verdict in DB
    if (isOverturned && parsedVerdict) {
      parsedVerdict.score_10 = Math.min(9.8, parseFloat(((parsedVerdict.score_10 || 3.0) + 2.5).toFixed(1)));
      parsedVerdict.drip_pct = Math.round(parsedVerdict.score_10 * 10);
      const upgradedTier = scoreToTier(parsedVerdict.score_10);
      parsedVerdict.verdict = upgradedTier;
      parsedVerdict.rating = upgradedTier;
      parsedVerdict.title = `✨ APPEAL WON // UPGRADED TO ${upgradedTier}`;
      parsedVerdict.sentence = `COMMUTED ON APPEAL: ${appealNote}`;

      queries.updateTrialVerdict.run(
        'done',
        parsedVerdict.score_10,
        parsedVerdict.drip_pct,
        parsedVerdict.title,
        JSON.stringify(parsedVerdict),
        trialId
      );
    }

    return res.json({
      trial_id: trialId,
      is_overturned: isOverturned,
      new_verdict: isOverturned ? (parsedVerdict?.verdict || 'NICE') : currentTier,
      appeal_note: appealNote,
      updated_verdict: parsedVerdict
    });
  } catch (err: any) {
    console.error('Appeal error:', err);
    return res.status(500).json({ error: 'Failed to process appeal' });
  }
});

export default router;
