import React from 'react';
import { Icon } from './Icon';

interface RetroHeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  scanlinesEnabled: boolean;
  onToggleScanlines: () => void;
}

export const RetroHeader: React.FC<RetroHeaderProps> = ({
  soundEnabled,
  onToggleSound,
  scanlinesEnabled,
  onToggleScanlines,
}) => {
  return (
    <header className="w-full pt-4 pb-3 px-4 flex flex-col items-center justify-center relative z-20">
      {/* Top utility row */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-2 text-xs font-pixel-sub text-[#B9A6E8]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 bg-[#E8409C] border border-white animate-pulse" />
          <span className="tracking-widest uppercase text-[#3CC8D8]">BROADCAST CH. 04</span>
          <span className="hidden sm:inline text-white/50">// LIVE FROM TOKYO-88 STUDIO</span>
        </div>

        {/* Quick Toggles: Scanlines & Audio */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleScanlines}
            className="flex items-center gap-1.5 px-2 py-1 bg-[#1A0F24] border border-[#3CC8D8] text-[10px] text-white hover:border-[#FFD93B] shadow-[2px_2px_0px_#B9A6E8] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            title="Toggle Analog Scanlines"
            aria-label="Toggle scanlines"
          >
            <Icon name="tv" size={12} className="text-[#3CC8D8]" />
            <span className="hidden xs:inline">SCANLINES:</span>
            <span className={scanlinesEnabled ? 'text-[#13A862]' : 'text-[#E5243B]'}>
              {scanlinesEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            onClick={onToggleSound}
            className="flex items-center gap-1.5 px-2 py-1 bg-[#1A0F24] border border-[#3CC8D8] text-[10px] text-white hover:border-[#FFD93B] shadow-[2px_2px_0px_#B9A6E8] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            title="Toggle Sound Effects"
            aria-label="Toggle sound"
          >
            <Icon
              name={soundEnabled ? 'volume' : 'volume-mute'}
              size={12}
              className={soundEnabled ? 'text-[#FFD93B]' : 'text-[#E5243B]'}
            />
            <span className="hidden xs:inline">AUDIO:</span>
            <span className={soundEnabled ? 'text-[#13A862]' : 'text-[#E5243B]'}>
              {soundEnabled ? 'ON' : 'MUTED'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Title: TOP CENTER */}
      <div className="text-center">
        <h1 className="font-pixel-title text-xl sm:text-2xl md:text-3xl text-white tracking-widest title-glow leading-snug">
          WELCOME TO <span className="text-[#3CC8D8] cyan-glow">OUTFIT</span>{' '}
          <span className="text-[#E8409C] pink-glow">COURT</span>
        </h1>
        <p className="font-pixel-sub text-xs sm:text-sm text-[#B9A6E8] mt-1 tracking-wider uppercase">
          AI FASHION TRIBUNAL <span className="text-[#FFD93B]">★</span> SAVAGE VERDICTS GUARANTEED
        </p>
      </div>
    </header>
  );
};
