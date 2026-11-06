import React, { useState } from 'react';
import { Icon } from './Icon';

interface CourtInfoCardProps {
  activeJudgeName?: string;
  activeJudgeTitle?: string;
  totalTrialsToday?: number;
  onOpenQuickMode?: () => void;
}

export const CourtInfoCard: React.FC<CourtInfoCardProps> = ({
  activeJudgeName = 'Auntie Sunita',
  activeJudgeTitle = 'President of Rishta Fashion Board',
  totalTrialsToday = 1420,
  onOpenQuickMode,
}) => {
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(false);

  return (
    <aside
      className="w-full lg:w-72 xl:w-80 flex-shrink-0"
      aria-label="Court Information and Rules"
    >
      <div className="bg-[#1A0F24] border-2 border-[#3CC8D8] shadow-pixel-lavender p-4 sm:p-5 relative panel-scanlines">
        {/* Decorative corner bolts */}
        <span className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#B9A6E8]" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#B9A6E8]" />
        <span className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#B9A6E8]" />
        <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#B9A6E8]" />

        {/* Small header */}
        <div className="flex items-center justify-between border-b border-[#3CC8D8]/30 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#E8409C]" />
            <h2 className="font-pixel-sub text-[11px] text-[#B9A6E8] tracking-widest uppercase">
              COURT POSITION // 001
            </h2>
          </div>
          {/* Mobile Collapse Toggle */}
          <button
            onClick={() => setIsMobileCollapsed(!isMobileCollapsed)}
            className="lg:hidden text-[#3CC8D8] text-xs font-pixel-sub px-1 py-0.5 border border-[#3CC8D8]/50"
            aria-label="Toggle court info"
          >
            {isMobileCollapsed ? '[EXPAND]' : '[MIN]'}
          </button>
        </div>

        {/* Content body - collapsible on mobile */}
        <div className={`${isMobileCollapsed ? 'hidden lg:block' : 'block'}`}>
          {/* One-line headline with cyan accent phrase */}
          <h3 className="font-pixel-title text-sm sm:text-base text-white leading-snug mb-3">
            OUTFIT CRIME <span className="text-[#3CC8D8] cyan-glow">TRIBUNAL</span> IN SESSION.
          </h3>

          {/* Short paragraph in typewriter/pixel font explaining what the app does */}
          <p className="font-pixel-body text-base sm:text-lg text-white/90 mb-4 leading-relaxed">
            Welcome to the televised court of fashion justice. Submit your daily outfit to face ruthless,
            hilarious AI judges. Receive your case charges, fit score, and rehabilitation sentence.
          </p>

          <div className="p-2.5 bg-[#261338] border border-[#E8409C]/50 text-xs font-pixel-sub text-[#FFD93B] mb-4 flex items-start gap-2">
            <Icon name="gavel" size={14} className="text-[#E8409C] mt-0.5" />
            <span>Use the menu to start a trial or switch judge personas!</span>
          </div>

          {/* Active presiding judge info badge */}
          <div className="border-t border-[#3CC8D8]/20 pt-3 mt-2 text-xs font-pixel-sub text-white/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#B9A6E8]">PRESIDING JUDGE:</span>
              <span className="text-[#3CC8D8] font-bold">{activeJudgeName}</span>
            </div>
            <div className="text-[11px] text-white/60 truncate">{activeJudgeTitle}</div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[#B9A6E8]">TODAY&apos;S TRIALS:</span>
              <span className="text-[#FFD93B] font-bold">{totalTrialsToday} CASES</span>
            </div>
          </div>

          {/* Quick alternative button */}
          {onOpenQuickMode && (
            <button
              onClick={onOpenQuickMode}
              className="mt-4 w-full py-2 px-3 bg-[#E8409C] text-white font-pixel-sub text-xs tracking-wider uppercase border border-white hover:bg-[#ff4fa8] active:translate-x-[2px] active:translate-y-[2px] shadow-[3px_3px_0px_#1A0F24] cursor-pointer flex items-center justify-center gap-2"
            >
              <Icon name="shirt" size={14} />
              <span>NO PHOTO? QUICK MODE</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
