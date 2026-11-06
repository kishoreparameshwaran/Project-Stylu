import type { JudgeId, QuickOutfitSubmission, VerdictResponse, VerdictType } from '../types/court';

export function generateQuickVerdict(submission: QuickOutfitSubmission): VerdictResponse {
  const { defendantName, judgeId, top, bottoms, shoes, extras, mood } = submission;

  const caseId = Math.floor(1000 + Math.random() * 9000);
  const caseNumber = `CASE #OC-2026-${caseId}`;

  // Deterministic scoring seed based on items
  const comboString = `${top}-${bottoms}-${shoes}-${extras.join('-')}-${mood}`;
  let hash = 0;
  for (let i = 0; i < comboString.length; i++) {
    hash = (hash << 5) - hash + comboString.charCodeAt(i);
    hash |= 0;
  }
  const normalizedHash = Math.abs(hash);

  // Check for iconic fashion felonies
  const hasCrocs = shoes.toLowerCase().includes('crocs');
  const hasBlazer = top.toLowerCase().includes('blazer');
  const hasSkinnyJeans = bottoms.toLowerCase().includes('skinny');
  const hasKurta = top.toLowerCase().includes('kurta');
  const hasBata = shoes.toLowerCase().includes('kolhapuri') || shoes.toLowerCase().includes('sandals');
  const hasMatrixShades = extras.some(e => e.toLowerCase().includes('matrix'));


  let isGuilty: boolean;
  let baseScore: number;

  if (judgeId === 'genz_judge') {
    if (hasSkinnyJeans) {
      isGuilty = true;
      baseScore = 3.2;
    } else if (hasCrocs && hasBlazer) {
      isGuilty = true;
      baseScore = 4.0;
    } else if (hasMatrixShades && !hasSkinnyJeans) {
      isGuilty = false;
      baseScore = 8.7;
    } else {
      isGuilty = (normalizedHash % 10) < 6;
      baseScore = isGuilty ? 4.8 + ((normalizedHash % 20) / 10) : 7.6 + ((normalizedHash % 20) / 10);
    }
  } else if (judgeId === 'strict_auntie') {
    if (hasKurta && hasBata) {
      isGuilty = false;
      baseScore = 9.4;
    } else if (hasSkinnyJeans || hasCrocs || top.toLowerCase().includes('crop')) {
      isGuilty = true;
      baseScore = 2.8;
    } else {
      isGuilty = (normalizedHash % 10) < 7;
      baseScore = isGuilty ? 3.5 + ((normalizedHash % 20) / 10) : 8.2 + ((normalizedHash % 15) / 10);
    }
  } else if (judgeId === 'mama_judge') {
    if (top.toLowerCase().includes('tank') || shoes.toLowerCase().includes('heels')) {
      isGuilty = true;
      baseScore = 3.4;
    } else if (hasKurta) {
      isGuilty = false;
      baseScore = 9.1;
    } else {
      isGuilty = (normalizedHash % 10) < 5;
      baseScore = isGuilty ? 4.2 + ((normalizedHash % 18) / 10) : 8.0 + ((normalizedHash % 18) / 10);
    }
  } else {
    // news_anchor or sarcastic_stylist
    isGuilty = (normalizedHash % 10) < 6;
    baseScore = isGuilty ? 3.9 + ((normalizedHash % 25) / 10) : 8.1 + ((normalizedHash % 15) / 10);
  }

  const finalScore = Math.min(10, Math.max(1, Number(baseScore.toFixed(1))));
  let verdict: VerdictType;
  if (!isGuilty && finalScore >= 9.0) verdict = 'FABULOUS';
  else if (!isGuilty && finalScore >= 7.5) verdict = 'NICE';
  else if (!isGuilty && finalScore >= 6.0) verdict = 'GOOD';
  else if (!isGuilty) verdict = 'NOT_GUILTY';
  else if (finalScore >= 4.0) verdict = 'OK';
  else verdict = 'GUILTY';

  const charges = generateCharges(judgeId, verdict, submission);
  const sentence = generateSentence(judgeId, verdict, submission);
  const fixTips = generateFixTips(submission);

  // Category scores
  const categoryScores = {
    colour_match: Math.min(98, Math.max(25, 40 + (normalizedHash % 50) + (isGuilty ? -15 : 20))),
    fit: Math.min(99, Math.max(20, 35 + ((normalizedHash >> 2) % 45) + (isGuilty ? -20 : 25))),
    originality: Math.min(95, Math.max(30, 50 + ((normalizedHash >> 4) % 40))),
    confidence: Math.min(100, Math.max(45, 60 + ((normalizedHash >> 1) % 35))),
    weather_appropriateness: Math.min(92, Math.max(15, 30 + ((normalizedHash >> 3) % 55))),
  };

  return {
    case_number: caseNumber,
    defendant_name: defendantName.trim() || 'Anonymous Defender',
    judge_id: judgeId,
    verdict,
    fit_score: finalScore,
    charges,
    sentence,
    category_scores: categoryScores,
    fix_tips: fixTips,
    is_appealed: false,
    created_at: new Date().toISOString(),
    outfit_summary: {
      top,
      bottoms,
      shoes,
      extras,
      mood,
    },
  };
}

function generateCharges(judgeId: JudgeId, verdict: VerdictType, sub: QuickOutfitSubmission): string[] {
  if (verdict === 'GUILTY') {
    switch (judgeId) {
      case 'genz_judge':
        return [
          `First-degree felony: Pairing "${sub.shoes}" with "${sub.top}" is legally categorized as emotional distress.`,
          `Aggravated NPC Behavior: Attempting to pull off "${sub.mood}" while looking like a background character in GTA 4.`,
          `Aesthetic violation: Your silhouette has lost all WiFi signal and refuses to reconnect.`,
        ];
      case 'strict_auntie':
        return [
          `Cultural misconduct: What will Mrs. Sharma think seeing you in "${sub.bottoms}"? Her son is in IIT!`,
          `Unforgivable mismatch: No ironed creases, no matching dupatta, pure circus fashion.`,
          `Public embarrassment: You walked outside wearing "${sub.shoes}" and expected people not to gossip?!`,
        ];
      case 'sarcastic_stylist':
        return [
          `Architectural catastrophe: "${sub.top}" is fighting "${sub.bottoms}" for structural dominance, and neither won.`,
          `Visual crime: The fabric tension here is higher than a reality TV reunion special.`,
          `Curatorial neglect: Accessorizing with "${sub.extras[0] || 'questionable energy'}" only confirmed the jury's worst fears.`,
        ];
      case 'mama_judge':
        return [
          `Aiyyo Kadavule: Ennada idhu combo? Even stray cows near the temple are turning their heads away!`,
          `Wasting good money: Did you pay actual rupees for "${sub.shoes}" or did you find them on a railway platform?`,
          `Motherly heartbreak: If your grandmother saw this "${sub.mood}", she would call the priest immediately.`,
        ];
      case 'news_anchor':
      default:
        return [
          `Special Alert: Eyewitnesses report widespread panic following the appearance of "${sub.top}".`,
          `National Weather Hazard: Zero coordination detected between "${sub.bottoms}" and the atmosphere.`,
          `Emergency Broadcast: City council has declared a state of visual emergency across all four blocks.`,
        ];
    }
  } else {
    // NOT GUILTY
    switch (judgeId) {
      case 'genz_judge':
        return [
          `Elite Aura Points: The synergy between "${sub.top}" and "${sub.shoes}" is certified platinum.`,
          `Aesthetic immunity: Clean proportions, zero cringe detected, pure unadulterated main character drip.`,
          `Honorary Pinterest board: You cooked with the "${sub.mood}" vibe. Leave no crumbs.`,
        ];
      case 'strict_auntie':
        return [
          `Family pride: Now THIS is respectable! Sharma ji's daughter could never pull off this "${sub.top}".`,
          `Flawless decorum: Decent, graceful, and your posture actually matches "${sub.bottoms}".`,
          `Matrimonial grade: 10/10 biodata ready. You may proceed to the family WhatsApp group.`,
        ];
      case 'sarcastic_stylist':
        return [
          `Reluctant admiration: Against all statistical odds, "${sub.bottoms}" actually balances the top proportion.`,
          `Editorial sharpness: The palette is intentional, and the "${sub.extras[0] || 'minimalism'}" doesn't scream for help.`,
          `Restraint rewarded: You knew when to stop accessorizing. The fashion gods nod in quiet respect.`,
        ];
      case 'mama_judge':
        return [
          `Nalla Payyan / Ponnu: Aiyyo, look at that! Kannu padum (warding off the evil eye right now).`,
          `Pure royal look: Walking like a collector madam / sir in that "${sub.top}".`,
          `Neighborhood benchmark: Tomorrow I am telling everyone at morning walking club about your fit.`,
        ];
      case 'news_anchor':
      default:
        return [
          `Viral Sensation: Street style analysts confirm this look has broken the internet without casualties.`,
          `Civic Pride: Local citizens applaud the flawless harmony between "${sub.top}" and "${sub.shoes}".`,
          `Headline Triumph: Our studio cameras confirm: Absolute perfection on the 6 o'clock news wire.`,
        ];
    }
  }
}

function generateSentence(judgeId: JudgeId, verdict: VerdictType, sub: QuickOutfitSubmission): string {
  if (verdict === 'GUILTY') {
    switch (judgeId) {
      case 'genz_judge':
        return `RULING: Sentenced to 72 hours of mandatory Pinterest moodboarding and banned from TikTok OOTD audios until further notice.`;
      case 'strict_auntie':
        return `RULING: 3 weeks of wearing decent cotton kurtas and you will personally serve tea and samosas to 5 neighborhood aunties.`;
      case 'sarcastic_stylist':
        return `RULING: Immediate confiscation of "${sub.shoes}". You are remanded to a closet detox clinic for severe silhouette malpractice.`;
      case 'mama_judge':
        return `RULING: Apply coconut oil right now, sit in your room, and rethink your life choices while reciting 100 apologies to your wardrobe.`;
      case 'news_anchor':
      default:
        return `RULING: The defendant is quarantined from public walkways until a licensed stylist certifies safe visual reentry.`;
    }
  } else {
    switch (judgeId) {
      case 'genz_judge':
        return `RULING: Full pardon! Awarded +5,000 Aura Points and VIP access to the fashion Hall of Fame. Keep slaying, bestie.`;
      case 'strict_auntie':
        return `RULING: Case dismissed with sweets! You are hereby granted front-row seating at the next family wedding reception.`;
      case 'sarcastic_stylist':
        return `RULING: Acquitted on all counts. Don't let this victory go to your head, but tonight, the sidewalk is your Paris runway.`;
      case 'mama_judge':
        return `RULING: Full blessings granted! Take 500 rupees for pocket money and go buy yourself some nice filter coffee.`;
      case 'news_anchor':
      default:
        return `RULING: Complete exoneration! The key to the city’s best-dressed district is hereby presented on live television.`;
    }
  }
}

function generateFixTips(sub: QuickOutfitSubmission): string[] {
  return [
    `Wardrobe Lawyer tip: Swap the ${sub.shoes} for a sleeker neutral tone to ground the ${sub.bottoms}.`,
    `Tuck in or crop the ${sub.top} to create an elongated 1/3 to 2/3 body proportion ratio.`,
    `Add one focal accessory (like a vintage leather belt or structural sunglasses) to tie the vibe together.`,
  ];
}

export function generateAppealVerdict(original: VerdictResponse): VerdictResponse {
  // Appeal reconsideration
  const isOverturned = Math.random() > 0.45; // 55% chance of hilarious reconsideration
  const newVerdict: VerdictType = isOverturned ? 'NOT_GUILTY' : 'GUILTY';

  const appealNotes: Record<JudgeId, string> = {
    genz_judge: isOverturned
      ? "Wait wait wait... The defense submitted new angles under natural golden hour lighting. You know what? It’s kinda giving subversive avant-garde ironical high fashion. I revoke the conviction!"
      : "The jury reviewed your defense argument and we regret to inform you: you are DOUBLE COOKED. Sentence increased by 10 days of fashion detention.",
    strict_auntie: isOverturned
      ? "Your mother called me and begged for mercy. Out of respect for your family, I am giving you one chance on probation. But wear a proper jacket next time!"
      : "Aiyyo! Even your own cousins voted against your appeal in the family WhatsApp poll! Guilty stamp stands permanently!",
    sarcastic_stylist: isOverturned
      ? "Upon inspecting the archival references from 1997 Antwerp design schools, your hideous styling was perhaps misunderstood genius. Sentence commuted to community service at Zara."
      : "Your appeal lacked any coherence, much like your hemline. Fine doubled.",
    mama_judge: isOverturned
      ? "Okay okay, don't cry! Amma's heart is soft like fresh idli. I will let you go this time, but wash your face and wear a nice shirt tomorrow!"
      : "You dare appeal to Amma?! Where is the respect?! Go study for your exams first before playing fashion lawyer!",
    news_anchor: isOverturned
      ? "BREAKING APPEAL BULLETIN: High Court reverses previous verdict following explosive leaked footage showing superior lighting conditions!"
      : "APPEAL DENIED: Supreme Court confirms unanimous verdict. The fashion catastrophe remains officially on the public record.",
  };

  const newScore = isOverturned
    ? Math.min(9.5, original.fit_score + 3.2)
    : Math.max(1.5, original.fit_score - 0.8);

  return {
    ...original,
    verdict: newVerdict,
    fit_score: parseFloat(newScore.toFixed(1)),
    is_appealed: true,
    appeal_note: appealNotes[original.judge_id],
    sentence: isOverturned
      ? `APPEAL RULING: Conviction overturned on humanitarian grounds! Defendant free on conditional fashion parole.`
      : `APPEAL RULING: Appeal rejected! Defendant ordered to complete 40 hours of community styling education.`,
  };
}
