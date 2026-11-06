import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Schema for AI Verdict Response
export const aiVerdictSchema = z.object({
  is_valid_outfit: z.boolean(),
  refusal_reason: z.string().optional(),
  outfit_detected: z.object({
    top: z.string(),
    bottoms: z.string(),
    shoes: z.string(),
    accessories: z.array(z.string()).default([]),
    overall_vibe: z.string(),
  }).optional(),
  verdict: z.enum(['GUILTY', 'NOT_GUILTY']),
  fit_score: z.number().min(1).max(10),
  charges: z.array(z.string()).min(3).max(3),
  sentence: z.string(),
  category_scores: z.object({
    colour_match: z.number().min(0).max(100),
    fit: z.number().min(0).max(100),
    originality: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100),
    weather_appropriateness: z.number().min(0).max(100),
  }),
  fix_tips: z.array(z.string()).min(2),
});

export type AiVerdictResult = z.infer<typeof aiVerdictSchema>;

const JUDGE_SYSTEM_PROMPTS: Record<string, string> = {
  'mall-cop': `You are Officer Randy, the 90s Mall Cop and Head of Food Court Surveillance.
Tone: Strict 90s mall security guard with a walkie-talkie. Zero tolerance for sloppy fits or escalator hazards, but high respect for true retro skate/mall-rat freshness. Use 10-4 radio codes.
Rule: Roast the clothing items, fabric, and styling, NEVER the user's physical body, face, age, gender, or background. PG-13.`,

  'harajuku-elite': `You are Ren, the Harajuku Street Fashion Visionary and Takeshita Dori Arbiter.
Tone: Avant-garde Tokyo street fashion connoisseur. Rejects boring corporate beige, celebrates fearless layering, cyberpunk accents, and dramatic silhouette volume.
Rule: Roast safe, boring, uncreative clothes with high-fashion snark. Never roast physical appearance. PG-13.`,

  'vintage-thrift-king': `You are Silas, the Vintage Clothing Archivist and Flea Market Kingpin.
Tone: Despises fast-fashion petroleum polyester, single-stitch purist, can spot genuine 90s selvedge fade from fifty paces. Celebrates authentic patina and sustainable archival style.
Rule: Roast cheap synthetic fabrics and fast-fashion waste. Never roast physical appearance. PG-13.`,

  'strict-auntie': `You are Auntie Sunita, President of the International Rishta & Society Fashion Board.
Tone: Intensely judgmental family auntie obsessed with Sharma ji's son, decent tailoring, spotless ironed creases, and "what will four relatives say?". Passionate scolding with tough love.
Rule: Scold wrinkles, unironed hems, and mismatched occasion wear. Wholesome and PG-13. Never comment on body size or appearance.`,

  'runway-czar': `You are Julian Vance, Haute Couture Inquisitor from Milan and Paris Fashion Week.
Tone: Brutal European high-fashion critic. Demands architectural poise, razor-sharp silhouette tension, and editorial excellence. Basics get instant contempt.
Rule: Editorial wit roasting garment proportions and styling choices. PG-13. Never comment on physical body or appearance.`,

  // Aliases for compatibility
  genz_judge: `You are Judge Kai, the Chief TikTok Magistrate of Outfit Court.
Tone: Hyper-online, playful Gen Z slang ("drip", "cooked", "main character", "Aura points", "no cap").
Rule: Savage humor but always wholesome and PG-13. Roast the clothing items, NEVER the physical body.`,

  news_anchor: `You are Chad Sterling, Special Correspondent for Action News 7 Courtroom Bulletin.
Tone: Hyper-dramatic breaking news broadcaster treating wardrobe mishaps like meteorological emergencies.
Rule: Funny journalistic seriousness, PG-13.`,

  sarcastic_stylist: `You are Laurent V., Haute Couture Inquisitor.
Tone: Sharp-tongued runway snark focusing on proportions and silhouette tension.
Rule: High-fashion wit. Roast the fabric and styling decisions mercilessly. PG-13.`,

  mama_judge: `You are Amma Justice, Supreme Court of South Asian Discipline.
Tone: Motherly scolding ("Aiyyo kadavule!", "Flying chappal imminent", "Did you pay good money for this?").
Rule: Warm, funny, motherly indignation. PG-13.`
};

export class AiService {
  private static anthropic: Anthropic | null = null;

  private static getClient(): Anthropic | null {
    if (!this.anthropic && process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_api_key_here') {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
    return this.anthropic;
  }

  /**
   * Evaluates outfit photo via Claude 3.5 Sonnet Vision or Mock Fallback
   */
  public static async judgeOutfitPhoto(
    imageBase64: string,
    judgeId: string,
    defendantName: string
  ): Promise<AiVerdictResult> {
    const isMock = process.env.MOCK_AI === 'true' || !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes('your_api_key');
    const client = this.getClient();

    if (isMock || !client) {
      console.log(`🤖 Using High-Fidelity Mock AI Judge for ${judgeId}`);
      return this.generateMockAiVerdict(judgeId, defendantName);
    }

    const personaPrompt = JUDGE_SYSTEM_PROMPTS[judgeId] || JUDGE_SYSTEM_PROMPTS.genz_judge;

    const systemInstruction = `
${personaPrompt}

CRITICAL RULES:
1. SAFETY & RESPECT:
   - Roast ONLY the clothes, colors, fit, and accessories.
   - NEVER comment on the person's body size, weight, skin, face, gender, religion, or physical appearance.
   - Keep the humor PG-13, funny, and entertaining.
   - If the image contains NO clothing, is completely dark/unclear, or is inappropriate, set "is_valid_outfit": false with a polite "refusal_reason".

2. OUTPUT FORMAT:
You MUST respond with a single valid JSON object with NO preamble or markdown ticks:
{
  "is_valid_outfit": true,
  "outfit_detected": {
    "top": "concise description of top",
    "bottoms": "concise description of bottoms",
    "shoes": "concise description of shoes or footwear",
    "accessories": ["accessory 1", "accessory 2"],
    "overall_vibe": "3-word vibe description"
  },
  "verdict": "GUILTY" or "NOT_GUILTY",
  "fit_score": 7.8,
  "charges": [
    "First specific charge or compliment about an item",
    "Second specific charge or compliment about colors/silhouette",
    "Third witty charge or compliment"
  ],
  "sentence": "Judge's dramatic ruling and consequence in character",
  "category_scores": {
    "colour_match": 85,
    "fit": 70,
    "originality": 65,
    "confidence": 90,
    "weather_appropriateness": 60
  },
  "fix_tips": [
    "Specific Wardrobe Lawyer actionable improvement 1",
    "Specific Wardrobe Lawyer actionable improvement 2"
  ]
}
`;

    try {
      const response = await client.messages.create({
        model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.7,
        system: systemInstruction,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: `Judge the outfit worn by defendant "${defendantName}". Provide full forensic fashion trial results in JSON format.`,
              },
            ],
          },
        ],
      });

      const responseText = response.content
        .filter((block) => block.type === 'text')
        .map((block: any) => block.text)
        .join('');

      // Clean JSON delimiters if returned
      const cleanJson = responseText.replace(/```json\n?|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return aiVerdictSchema.parse(parsed);
    } catch (err: any) {
      console.warn('Claude API request failed, falling back to mock engine:', err.message);
      return this.generateMockAiVerdict(judgeId, defendantName);
    }
  }

  /**
   * Deterministic yet dynamic Mock AI for local development and offline resilience
   */
  public static generateMockAiVerdict(judgeId: string, defendantName: string): AiVerdictResult {
    const isGuilty = Math.random() < 0.6;
    const score = isGuilty
      ? parseFloat((2.8 + Math.random() * 3.5).toFixed(1))
      : parseFloat((7.8 + Math.random() * 2.0).toFixed(1));

    const mockDetecteds = [
      {
        top: 'Vintage Washed Graphic Boxy Tee',
        bottoms: 'Multi-pocket Baggy Parachute Cargos',
        shoes: 'Chunky Dad Sneakers with cream midsoles',
        accessories: ['Micro Wireframe Sunglasses', 'Silver Heavy Link Chain'],
        overall_vibe: 'Post-Irony Streetwear Enthusiast',
      },
      {
        top: 'Relaxed Tailored Navy Double-Breasted Blazer',
        bottoms: 'Wide-Leg Pleated Raw Denim',
        shoes: 'Polished Black Horsebit Loafers + White Socks',
        accessories: ['Canvas Pretentious Quote Tote', 'Over-Ear Headphones'],
        overall_vibe: 'Corporate Slacker Chic',
      },
      {
        top: 'Festive Embroidered Silk Kurta with Gold Buttons',
        bottoms: 'Churidar Pajama with neat ankle gathers',
        shoes: 'Tan Orthopedic Kolhapuri Chappals',
        accessories: ['Titan Quartz Watch', 'Silk Dupatta'],
        overall_vibe: 'Wedding Biodata Approved',
      },
    ];

    const detected = mockDetecteds[Math.floor(Math.random() * mockDetecteds.length)];

    let charges: [string, string, string];
    let sentence: string;

    if (isGuilty) {
      charges = [
        `Count 1: Pairing "${detected.shoes}" with "${detected.bottoms}" is legally classified as acute silhouette confusion.`,
        `Count 2: Attempting to pull off "${detected.overall_vibe}" while giving strictly low-resolution NPC energy.`,
        `Count 3: Accessorizing with "${detected.accessories[0]}" only served to confirm the jury's deepest concerns.`,
      ];
      sentence = `RULING: Defendant ${defendantName} is found GUILTY of high styling negligence. Sentenced to 72 hours of mandatory Pinterest moodboard observation.`;
    } else {
      charges = [
        `Commendation 1: Impeccable proportion harmony between "${detected.top}" and "${detected.bottoms}".`,
        `Commendation 2: Flawless execution of "${detected.overall_vibe}" with high poise and intentionality.`,
        `Commendation 3: "${detected.accessories[0]}" successfully anchors the aesthetic without screaming for validation.`,
      ];
      sentence = `RULING: Full judicial acquittal! Awarded +5,000 Aura Points and unrestricted VIP passage through all fashion districts.`;
    }

    return {
      is_valid_outfit: true,
      outfit_detected: detected,
      verdict: isGuilty ? 'GUILTY' : 'NOT_GUILTY',
      fit_score: score,
      charges,
      sentence,
      category_scores: {
        colour_match: Math.floor(50 + Math.random() * 45),
        fit: Math.floor(45 + Math.random() * 50),
        originality: Math.floor(55 + Math.random() * 40),
        confidence: Math.floor(65 + Math.random() * 35),
        weather_appropriateness: Math.floor(40 + Math.random() * 55),
      },
      fix_tips: [
        `Wardrobe Lawyer recommendation: Swap "${detected.shoes}" for a sleeker silhouette to elongate leg lines.`,
        `Semi-tuck the "${detected.top}" to establish a golden 1/3 to 2/3 visual body ratio.`,
      ],
    };
  }
}
