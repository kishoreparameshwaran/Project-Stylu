import React, { useEffect, useState } from 'react';
import type { VerdictResponse } from '../types/court';
import { JUDGE_PERSONAS } from '../data/personas';
import { triggerGuiltyConfetti, triggerNotGuiltyConfetti } from '../utils/confetti';
import { courtAudio } from '../utils/audio';
import { Icon } from './Icon';
import { downloadVerdictTradingCard } from '../utils/tradingCard';

interface VerdictScreenProps {
  verdict: VerdictResponse;
  onAppeal: () => void;
  onReset: () => void;
  isAppealing: boolean;
  photoUrl?: string | null;
}

export const VerdictScreen: React.FC<VerdictScreenProps> = ({
  verdict,
  onAppeal,
  onReset,
  isAppealing,
  photoUrl,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showLawyerTips, setShowLawyerTips] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const judge = JUDGE_PERSONAS.find((j) => j.id === verdict.judge_id) || JUDGE_PERSONAS[0];
  const isGuilty = verdict.verdict === 'GUILTY';

  useEffect(() => {
    // Trigger confetti burst on verdict reveal
    if (isGuilty) {
      triggerGuiltyConfetti();
    } else {
      triggerNotGuiltyConfetti();
    }

    // Animated count up for the score
    const target = verdict.fit_score;
    const duration = 1100;
    const startTime = performance.now();

    const updateScore = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const current = progress === 1 ? target : target * (1 - Math.pow(2, -10 * progress));
      setAnimatedScore(parseFloat(current.toFixed(1)));
      if (progress < 1) {
        requestAnimationFrame(updateScore);
      }
    };

    requestAnimationFrame(updateScore);
  }, [verdict.verdict, verdict.fit_score, isGuilty]);

  const handleShare = () => {
    courtAudio.playClick();
    const shareText = `⚖️ OUTFIT COURT VERDICT: ${judge.name} just sentenced my fit to ${verdict.verdict} with a score of ${verdict.fit_score}/10! Check docket ${verdict.case_number}`;
    if (navigator.share) {
      navigator.share({
        title: 'Outfit Court Verdict',
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleDownloadCard = async () => {
    courtAudio.playClick();
    setIsDownloading(true);
    try {
      await downloadVerdictTradingCard(verdict, photoUrl);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full h-full p-2.5 sm:p-3 overflow-y-auto text-left flex flex-col justify-between font-pixel-body select-text scrollbar-thin">
      {/* Top Bar inside CRT */}
      <div className="flex items-center justify-between border-b border-[#3CC8D8]/40 pb-1 mb-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-[#E8409C] animate-pulse" />
          <span className="font-pixel-title text-[9px] text-[#3CC8D8]">
            {verdict.case_number}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-sm">{judge.avatar}</span>
          <span className="font-pixel-sub text-[10px] text-white/90">{judge.name}</span>
        </div>
      </div>

      {/* Main Verdict & Rubber Stamp Section */}
      <div className="flex items-center justify-between gap-2 my-1 flex-shrink-0">
        {/* Rubber Stamp and Photo Thumbnail */}
        <div className="flex items-center gap-2">
          {photoUrl && (
            <div className="w-12 h-14 sm:w-14 sm:h-16 bg-black border border-[#3CC8D8] rounded overflow-hidden flex-shrink-0 relative">
              <img
                src={photoUrl}
                alt="Submitted outfit"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 scanlines-fx opacity-30 pointer-events-none" />
            </div>
          )}

          <div>
            {(() => {
              const raw = (verdict.verdict || '').toUpperCase();
              let ratingTier = 'GOOD';
              if (raw.includes('FAB')) ratingTier = 'FABULOUS';
              else if (raw === 'NICE') ratingTier = 'NICE';
              else if (raw === 'GOOD') ratingTier = 'GOOD';
              else if (raw === 'OK') ratingTier = 'OK';
              else if (raw === 'GUILTY') ratingTier = 'GUILTY';
              else if (verdict.fit_score >= 9.0) ratingTier = 'FABULOUS';
              else if (verdict.fit_score >= 7.5) ratingTier = 'NICE';
              else if (verdict.fit_score >= 6.0) ratingTier = 'GOOD';
              else if (verdict.fit_score >= 4.0) ratingTier = 'OK';
              else ratingTier = 'GUILTY';

              const badges: Record<string, { label: string; icon: string; border: string; text: string; bg: string }> = {
                FABULOUS: { label: 'FABULOUS', icon: '✨', border: 'border-[#FFD93B]', text: 'text-[#FFD93B]', bg: 'bg-amber-950/80 shadow-[0_0_12px_#FFD93B]' },
                NICE: { label: 'NICE', icon: '🔥', border: 'border-[#13A862]', text: 'text-[#13A862]', bg: 'bg-emerald-950/80 shadow-[0_0_12px_#13A862]' },
                GOOD: { label: 'GOOD', icon: '👍', border: 'border-[#3CC8D8]', text: 'text-[#3CC8D8]', bg: 'bg-sky-950/80 shadow-[0_0_12px_#3CC8D8]' },
                OK: { label: 'OK', icon: '⚡', border: 'border-[#FFD93B]', text: 'text-[#FFD93B]', bg: 'bg-yellow-950/80 shadow-[0_0_12px_#FFD93B]' },
                GUILTY: { label: 'GUILTY', icon: '🚨', border: 'border-[#E5243B]', text: 'text-[#E5243B]', bg: 'bg-red-950/80 shadow-[0_0_12px_#E5243B]' }
              };
              const b = badges[ratingTier] || badges.GOOD;

              return (
                <div className={`font-pixel-title text-xs sm:text-sm px-2.5 py-0.5 border-2 uppercase transform -rotate-1 ${b.border} ${b.text} ${b.bg}`}>
                  {b.icon} {b.label} {b.icon}
                </div>
              );
            })()}

            <div className="font-pixel-sub text-[9px] text-[#B9A6E8] mt-1">
              DEFENDANT: <span className="text-white font-bold">{verdict.defendant_name}</span>
            </div>

            {verdict.is_appealed && (
              <span className="mt-0.5 inline-block font-pixel-sub text-[8px] bg-[#FFD93B] text-black px-1 font-bold">
                APPEAL OVERTURNED
              </span>
            )}
          </div>
        </div>

        {/* Fit Score Display */}
        <div className="bg-[#1A0F24] border-2 border-[#FFD93B] p-1.5 sm:p-2 text-center shadow-[2px_2px_0px_#FFD93B] flex-shrink-0">
          <span className="text-[8px] font-pixel-sub text-[#FFD93B] block">FIT RATING</span>
          <span className="font-pixel-title text-lg sm:text-xl text-white">
            {animatedScore}
            <span className="text-xs text-[#FFD93B]">/10</span>
          </span>
        </div>
      </div>

      {/* 5-Tier Rating Scale Indicator */}
      {(() => {
        const raw = (verdict.verdict || '').toUpperCase();
        let cur = 'GOOD';
        if (raw.includes('FAB')) cur = 'FABULOUS';
        else if (raw === 'NICE') cur = 'NICE';
        else if (raw === 'GOOD') cur = 'GOOD';
        else if (raw === 'OK') cur = 'OK';
        else if (raw === 'GUILTY') cur = 'GUILTY';
        else if (verdict.fit_score >= 9.0) cur = 'FABULOUS';
        else if (verdict.fit_score >= 7.5) cur = 'NICE';
        else if (verdict.fit_score >= 6.0) cur = 'GOOD';
        else if (verdict.fit_score >= 4.0) cur = 'OK';
        else cur = 'GUILTY';

        const tiers = [
          { id: 'GUILTY', label: 'GUILTY', icon: '🚨', active: 'border-[#E5243B] text-[#E5243B] bg-red-950/90 shadow-[0_0_10px_#E5243B]' },
          { id: 'OK', label: 'OK', icon: '⚡', active: 'border-[#FFD93B] text-[#FFD93B] bg-yellow-950/90 shadow-[0_0_10px_#FFD93B]' },
          { id: 'GOOD', label: 'GOOD', icon: '👍', active: 'border-[#3CC8D8] text-[#3CC8D8] bg-sky-950/90 shadow-[0_0_10px_#3CC8D8]' },
          { id: 'NICE', label: 'NICE', icon: '🔥', active: 'border-[#13A862] text-[#13A862] bg-emerald-950/90 shadow-[0_0_10px_#13A862]' },
          { id: 'FABULOUS', label: 'FABULOUS', icon: '✨', active: 'border-[#FFD93B] text-[#FFD93B] bg-amber-950/90 shadow-[0_0_10px_#FFD93B]' },
        ];

        return (
          <div className="my-1.5 p-2 bg-[#120B1A]/90 border border-white/20">
            <div className="flex items-center justify-between text-[9px] font-pixel-sub mb-1 text-white/80">
              <span>STYLE RATING SCALE:</span>
              <span className="font-bold text-[#FFD93B] uppercase">{cur}</span>
            </div>
            <div className="grid grid-cols-5 gap-1 text-center font-pixel-sub text-[8px] sm:text-[9px]">
              {tiers.map((t) => (
                <div
                  key={t.id}
                  className={`py-1 px-0.5 border ${
                    t.id === cur
                      ? `${t.active} font-bold scale-105 z-10 animate-pulse`
                      : 'border-white/10 text-white/40 bg-black/40'
                  }`}
                >
                  <div>{t.icon}</div>
                  <div className="truncate mt-0.5">{t.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Style Verdict Commentary */}
      <div className="my-1.5 p-2 bg-[#1A0F24]/90 border border-[#3CC8D8]/60 shadow-[1px_1px_0px_#000] flex-shrink-0">
        <div className="font-pixel-sub text-[9px] text-[#3CC8D8] mb-0.5">STYLE VERDICT:</div>
        <p className="font-pixel-body text-sm sm:text-base text-white leading-tight">
          &ldquo;{verdict.sentence.replace(/^RULING:\s*/i, '')}&rdquo;
        </p>
      </div>

      {/* Category Scores Pixel Stat Bars */}
      <div className="my-1 space-y-1 bg-[#120B1A]/80 p-1.5 border border-white/10 flex-shrink-0">
        <div className="font-pixel-sub text-[9px] text-[#B9A6E8] mb-0.5">EVALUATION METRICS:</div>
        {Object.entries(verdict.category_scores || {}).map(([key, score]) => {
          const label = key.replace('_', ' ').toUpperCase();
          return (
            <div key={key} className="flex items-center justify-between gap-1.5 text-[9px] font-pixel-sub">
              <span className="w-20 sm:w-24 truncate text-white/70">{label}:</span>
              <div className="flex-grow h-1.5 bg-black border border-white/20 overflow-hidden">
                <div
                  style={{ width: `${score}%` }}
                  className={`h-full ${
                    score >= 70 ? 'bg-[#13A862]' : score >= 45 ? 'bg-[#FFD93B]' : 'bg-[#E5243B]'
                  }`}
                />
              </div>
              <span className="w-7 text-right font-pixel-title text-[8px] text-[#3CC8D8]">{score}%</span>
            </div>
          );
        })}
      </div>

      {/* Charges & Evidence List */}
      <div className="my-1 text-xs flex-shrink-0">
        <span className="font-pixel-sub text-[9px] text-[#FFD93B] block mb-0.5">DOCKET CHARGES:</span>
        <ul className="space-y-0.5">
          {verdict.charges.slice(0, 3).map((charge, i) => (
            <li key={i} className="text-white/85 text-xs sm:text-sm leading-tight flex items-start gap-1">
              <span className="text-[#E8409C]">▶</span>
              <span>{charge}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Wardrobe Lawyer Tips Accordion */}
      <div className="my-1 flex-shrink-0">
        <button
          onClick={() => {
            courtAudio.playClick();
            setShowLawyerTips(!showLawyerTips);
          }}
          className="w-full text-left p-1 bg-[#261338] border border-[#E8409C] text-[9px] font-pixel-sub text-[#FFD93B] flex items-center justify-between cursor-pointer"
        >
          <span>⚖️ WARDROBE LAWYER: {showLawyerTips ? 'HIDE FIX TIPS' : 'REDUCE MY SENTENCE'}</span>
          <span>{showLawyerTips ? '▲' : '▼'}</span>
        </button>

        {showLawyerTips && (
          <div className="p-1.5 bg-[#1A0F24] border-x border-b border-[#E8409C] text-xs space-y-1">
            {verdict.fix_tips.map((tip, i) => (
              <div key={i} className="text-white/90 text-xs sm:text-sm flex items-start gap-1">
                <span className="text-[#3CC8D8]">★</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1 border-t border-[#3CC8D8]/30 flex-shrink-0">
        {/* Appeal Button */}
        {!verdict.is_appealed && (
          <button
            onClick={onAppeal}
            disabled={isAppealing}
            className="flex-1 min-w-[100px] py-1 px-2 bg-[#E8409C] hover:bg-[#ff4fa8] disabled:opacity-50 text-white font-pixel-sub text-[9px] sm:text-[10px] tracking-wider uppercase border border-white shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-1"
          >
            <Icon name="gavel" size={12} />
            <span>{isAppealing ? 'APPEALING...' : 'APPEAL (1 LEFT)'}</span>
          </button>
        )}

        {/* Download Trading Card */}
        <button
          onClick={handleDownloadCard}
          disabled={isDownloading}
          className="flex-1 min-w-[100px] py-1 px-2 bg-[#3CC8D8] hover:bg-[#5ae0ee] text-black font-pixel-sub text-[9px] sm:text-[10px] tracking-wider uppercase border border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-1"
        >
          <Icon name="star" size={12} className="text-black" />
          <span>{isDownloading ? 'SAVING...' : 'TRADING CARD'}</span>
        </button>

        {/* Share Link */}
        <button
          onClick={handleShare}
          className="py-1 px-2 bg-[#1A0F24] hover:bg-[#261338] text-white font-pixel-sub text-[9px] sm:text-[10px] border border-[#3CC8D8] shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1"
        >
          <Icon name="share" size={12} className="text-[#3CC8D8]" />
          <span>{copiedLink ? 'COPIED!' : 'SHARE'}</span>
        </button>

        {/* New Docket / Reset */}
        <button
          onClick={onReset}
          className="py-1 px-2 bg-[#2A2830] hover:bg-[#3E3A46] text-white font-pixel-sub text-[9px] sm:text-[10px] border border-white/40 shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
        >
          NEW CASE
        </button>
      </div>
    </div>
  );
};
