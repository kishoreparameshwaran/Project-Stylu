import React from 'react';
import { JUDGE_PERSONAS } from '../data/personas';

interface JudgeDossierModalProps {
  currentJudgeId: string;
  onSelectJudge: (index: number) => void;
  onClose: () => void;
}

export const JudgeDossierModal: React.FC<JudgeDossierModalProps> = ({
  currentJudgeId,
  onSelectJudge,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm font-terminal">
      <div className="w-full max-w-xl bg-[#28221b] border-2 border-[#dfd0bc] p-5 shadow-pixel-card text-[#fcf2e3] space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#dfd0bc]/40 pb-2 flex-shrink-0">
          <div>
            <span className="font-pixel text-xs text-sky-300 block">
              JUDICIAL DOSSIER // CHOOSE YOUR CRITIC
            </span>
            <span className="text-xs text-[#d7c3af]">5 CERTIFIED TRIBUNAL MAGISTRATES AVAILABLE</span>
          </div>
          <button
            onClick={onClose}
            className="font-pixel text-xs text-red-400 hover:text-white"
          >
            [X]
          </button>
        </div>

        {/* Judges List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1 scrollbar-none">
          {JUDGE_PERSONAS.map((judge, idx) => {
            const isSelected = judge.id === currentJudgeId;
            return (
              <div
                key={judge.id}
                className={`p-3 border-2 transition-all ${
                  isSelected
                    ? 'border-sky-400 bg-[#161d24] shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                    : 'border-[#8c7865] bg-[#17130e] hover:border-[#dfd0bc]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl p-1 bg-black/40 border border-sky-400/50 rounded flex-shrink-0">
                      {judge.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-pixel text-xs text-[#fcf2e3]">{judge.name}</span>
                        <span className="font-pixel text-[8px] px-1 py-0.5 bg-black/80 text-sky-300 border border-sky-400/40">
                          CH.0{idx + 1}
                        </span>
                      </div>
                      <div className="text-xs text-[#d7c3af] font-semibold">{judge.title}</div>
                    </div>
                  </div>

                  <span
                    className={`font-pixel text-[8px] px-1.5 py-0.5 border uppercase ${
                      judge.severity === 'Brutal'
                        ? 'bg-red-950 text-red-300 border-red-500'
                        : judge.severity === 'Savage'
                        ? 'bg-amber-950 text-amber-300 border-amber-500'
                        : 'bg-sky-950 text-sky-300 border-sky-500'
                    }`}
                  >
                    {judge.severity}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#8c7865]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-xs text-[#f5ece1] italic">
                    "{judge.catchphrase}"
                  </p>
                  <button
                    onClick={() => {
                      onSelectJudge(idx);
                      onClose();
                    }}
                    className={`font-pixel text-[9px] px-3 py-1.5 flex-shrink-0 border uppercase transition-colors ${
                      isSelected
                        ? 'bg-sky-400 text-black border-white font-bold'
                        : 'bg-[#28221b] hover:bg-sky-900 text-sky-200 border-sky-300'
                    }`}
                  >
                    {isSelected ? 'ACTIVE' : '[ TUNE CHANNEL ]'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
