import React from 'react';
import type { JudgeId } from '../types/court';
import { JUDGE_PERSONAS } from '../data/personas';
import { motion } from 'framer-motion';


interface JudgeSelectorProps {
  selectedJudgeId: JudgeId;
  onSelectJudge: (id: JudgeId) => void;
}

export const JudgeSelector: React.FC<JudgeSelectorProps> = ({
  selectedJudgeId,
  onSelectJudge,
}) => {
  const currentJudge = JUDGE_PERSONAS.find((j) => j.id === selectedJudgeId) || JUDGE_PERSONAS[0];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="font-court-display font-bold text-sm tracking-wide uppercase text-[#0B3A66] flex items-center gap-1.5">
          <span>⚖️</span> Select Your Judge
        </label>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#0B3A66] text-white">
          {currentJudge.severity} Mode
        </span>
      </div>

      {/* Horizontal Scrollable Persona Cards */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-1 px-1">
        {JUDGE_PERSONAS.map((judge) => {
          const isSelected = judge.id === selectedJudgeId;
          return (
            <button
              key={judge.id}
              onClick={() => onSelectJudge(judge.id)}
              className={`flex-shrink-0 snap-start rounded-2xl p-3 text-left transition-all duration-150 relative court-border ${
                isSelected
                  ? 'bg-white court-shadow-sm scale-[1.02] ring-2 ring-[#0B3A66]'
                  : 'bg-white/70 hover:bg-white/90 opacity-80 hover:opacity-100'
              }`}
              style={{ width: '136px' }}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <span className="absolute -top-2 -right-1 bg-amber-400 text-[#0B3A66] text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md court-border-sm court-shadow-sm">
                  Active
                </span>
              )}
              <div className="text-3xl mb-1.5 filter drop-shadow-sm">{judge.avatar}</div>
              <div className="font-court-display font-black text-sm text-[#0B3A66] leading-tight truncate">
                {judge.name}
              </div>
              <div className="text-[10px] text-[#0B3A66]/70 leading-tight line-clamp-1 mt-0.5 font-medium">
                {judge.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Judge Quote Card */}
      <motion.div
        key={currentJudge.id}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-2.5 p-3 rounded-xl bg-white/90 court-border-sm court-shadow-sm flex items-start gap-2.5"
      >
        <span className="text-2xl flex-shrink-0">{currentJudge.avatar}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-court-display font-extrabold text-xs text-[#0B3A66]">
              {currentJudge.name}
            </span>
            <span className="text-[10px] text-gray-500 italic truncate">
              "{currentJudge.tagline}"
            </span>
          </div>
          <p className="text-xs text-[#0B3A66]/90 mt-0.5 font-medium italic">
            "{currentJudge.catchphrase}"
          </p>
        </div>
      </motion.div>
    </div>
  );
};
