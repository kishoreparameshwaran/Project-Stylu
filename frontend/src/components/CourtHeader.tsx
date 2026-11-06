import React from 'react';
import { Volume2, VolumeX, Flame } from 'lucide-react';

interface CourtHeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  streakCount?: number;
  onResetToNewCase?: () => void;
}

export const CourtHeader: React.FC<CourtHeaderProps> = ({
  soundEnabled,
  onToggleSound,
  streakCount = 3,
  onResetToNewCase,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#9AD8FF]/90 backdrop-blur-md border-b-4 border-[#0B3A66] px-4 py-2.5 shadow-sm">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo and Gavel */}
        <button
          onClick={onResetToNewCase}
          className="flex items-center gap-2 text-left focus:outline-none group text-[#0B3A66]"
          aria-label="Outfit Court Home"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0B3A66] text-white flex items-center justify-center font-bold text-xl court-shadow-sm group-hover:rotate-6 transition-transform">
            ⚖️
          </div>
          <div>
            <div className="font-court-display font-black text-xl tracking-tight leading-none text-[#0B3A66] flex items-center gap-1">
              OUTFIT COURT
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B3A66]/70">
              AI Fashion Tribunal
            </span>
          </div>
        </button>

        {/* Action Pills */}
        <div className="flex items-center gap-2">
          {/* Daily Streak Pill */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 bg-white court-border-sm rounded-full court-shadow-sm text-xs font-bold text-[#0B3A66]"
            title="Daily trial streak"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{streakCount}D</span>
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl court-border-sm court-shadow-sm transition-colors ${
              soundEnabled ? 'bg-emerald-100 text-[#0B3A66]' : 'bg-white text-gray-400'
            }`}
            title={soundEnabled ? 'Sound effects ON' : 'Sound effects MUTED'}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#0B3A66]" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
