import React, { useState } from 'react';
import {
  TOP_OPTIONS,
  BOTTOM_OPTIONS,
  SHOE_OPTIONS,
  EXTRA_OPTIONS,
  MOOD_OPTIONS,
} from '../data/quickOptions';
import type { QuickOutfitSubmission, JudgeId } from '../types/court';
import { courtAudio } from '../utils/audio';
import { Icon } from './Icon';

interface QuickModeBuilderProps {
  selectedJudgeId: JudgeId;
  onSubmit: (submission: QuickOutfitSubmission) => void;
  isLoading: boolean;
}

const RANDOM_NAMES = [
  'Baggy Pant Bandit',
  'Crocs In Sport Mode',
  'Minimalist Threat',
  'Drip Defendant #99',
  'Oversized Overlord',
  'Auntie’s Worst Nightmare',
  'Couture Culprit',
  'Retro Runner',
];

export const QuickModeBuilder: React.FC<QuickModeBuilderProps> = ({
  selectedJudgeId,
  onSubmit,
  isLoading,
}) => {
  const [defendantName, setDefendantName] = useState('Drip Defendant #99');
  const [selectedTop, setSelectedTop] = useState(TOP_OPTIONS[0].label);
  const [selectedBottoms, setSelectedBottoms] = useState(BOTTOM_OPTIONS[0].label);
  const [selectedShoes, setSelectedShoes] = useState(SHOE_OPTIONS[0].label);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([EXTRA_OPTIONS[0].label]);
  const [selectedMood, setSelectedMood] = useState(MOOD_OPTIONS[0].label);
  const [activeTab, setActiveTab] = useState<'top' | 'bottoms' | 'shoes' | 'extras' | 'mood'>('top');

  const handleRandomize = () => {
    courtAudio.playClick();
    const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setDefendantName(randomName);
    setSelectedTop(TOP_OPTIONS[Math.floor(Math.random() * TOP_OPTIONS.length)].label);
    setSelectedBottoms(BOTTOM_OPTIONS[Math.floor(Math.random() * BOTTOM_OPTIONS.length)].label);
    setSelectedShoes(SHOE_OPTIONS[Math.floor(Math.random() * SHOE_OPTIONS.length)].label);
    const randomExtra = EXTRA_OPTIONS[Math.floor(Math.random() * EXTRA_OPTIONS.length)].label;
    setSelectedExtras([randomExtra]);
    setSelectedMood(MOOD_OPTIONS[Math.floor(Math.random() * MOOD_OPTIONS.length)].label);
  };

  const toggleExtra = (label: string) => {
    courtAudio.playClick();
    if (selectedExtras.includes(label)) {
      setSelectedExtras(selectedExtras.filter((e) => e !== label));
    } else {
      if (selectedExtras.length < 3) {
        setSelectedExtras([...selectedExtras, label]);
      } else {
        setSelectedExtras([...selectedExtras.slice(1), label]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    courtAudio.playGavel();
    onSubmit({
      defendantName: defendantName.trim() || 'Anonymous Defender',
      judgeId: selectedJudgeId,
      top: selectedTop,
      bottoms: selectedBottoms,
      shoes: selectedShoes,
      extras: selectedExtras,
      mood: selectedMood,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3 font-pixel-body">
      {/* Defendant Name Box */}
      <div className="bg-[#1A0F24] border-2 border-[#3CC8D8] p-3 shadow-pixel-lavender">
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-pixel-sub text-[10px] text-[#B9A6E8] tracking-widest uppercase flex items-center gap-1.5">
            <Icon name="user" size={12} className="text-[#3CC8D8]" />
            <span>DEFENDANT NAME:</span>
          </label>
          <button
            type="button"
            onClick={handleRandomize}
            className="text-[10px] font-pixel-sub text-[#FFD93B] hover:text-white flex items-center gap-1 bg-[#261338] px-2 py-0.5 border border-[#FFD93B] cursor-pointer"
          >
            <span>[🎲 RANDOMIZE]</span>
          </button>
        </div>
        <input
          type="text"
          value={defendantName}
          onChange={(e) => setDefendantName(e.target.value)}
          placeholder="Enter defendant name..."
          className="w-full px-2.5 py-1.5 text-base bg-[#090B10] border border-[#3CC8D8] text-white font-pixel-body focus:outline-none focus:border-[#FFD93B]"
          maxLength={30}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {(
          [
            { id: 'top', label: 'TOP', icon: 'shirt', selected: selectedTop },
            { id: 'bottoms', label: 'BOTTOMS', icon: 'zap', selected: selectedBottoms },
            { id: 'shoes', label: 'SHOES', icon: 'shoes', selected: selectedShoes },
            { id: 'extras', label: 'EXTRAS', icon: 'star', selected: selectedExtras.join(', ') },
            { id: 'mood', label: 'VIBE', icon: 'heart', selected: selectedMood },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                courtAudio.playClick();
                setActiveTab(tab.id);
              }}
              className={`flex-1 min-w-[70px] py-1.5 px-1 border-2 text-center transition-all cursor-pointer font-pixel-sub text-[10px] ${
                isActive
                  ? 'bg-[#E8409C] border-white text-white shadow-[2px_2px_0px_#B9A6E8]'
                  : 'bg-[#1A0F24] border-[#3CC8D8]/60 text-white/80 hover:border-white'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Icon name={tab.icon as any} size={10} />
                <span>{tab.label}</span>
              </div>
              <div className="text-[9px] text-[#FFD93B] truncate max-w-[80px] mx-auto">
                {tab.selected}
              </div>
            </button>
          );
        })}
      </div>

      {/* Options Chip Grid */}
      <div className="bg-[#1A0F24] border-2 border-[#3CC8D8] p-3 max-h-52 overflow-y-auto">
        {activeTab === 'top' && (
          <div className="grid grid-cols-2 gap-1.5">
            {TOP_OPTIONS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  courtAudio.playClick();
                  setSelectedTop(item.label);
                }}
                className={`p-1.5 text-left text-xs font-pixel-sub border cursor-pointer ${
                  selectedTop === item.label
                    ? 'border-[#FFD93B] bg-[#2A1538] text-[#FFD93B] font-bold shadow-[2px_2px_0px_#FFD93B]'
                    : 'border-white/20 bg-[#0E0716] text-white/80 hover:border-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'bottoms' && (
          <div className="grid grid-cols-2 gap-1.5">
            {BOTTOM_OPTIONS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  courtAudio.playClick();
                  setSelectedBottoms(item.label);
                }}
                className={`p-1.5 text-left text-xs font-pixel-sub border cursor-pointer ${
                  selectedBottoms === item.label
                    ? 'border-[#FFD93B] bg-[#2A1538] text-[#FFD93B] font-bold shadow-[2px_2px_0px_#FFD93B]'
                    : 'border-white/20 bg-[#0E0716] text-white/80 hover:border-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'shoes' && (
          <div className="grid grid-cols-2 gap-1.5">
            {SHOE_OPTIONS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  courtAudio.playClick();
                  setSelectedShoes(item.label);
                }}
                className={`p-1.5 text-left text-xs font-pixel-sub border cursor-pointer ${
                  selectedShoes === item.label
                    ? 'border-[#FFD93B] bg-[#2A1538] text-[#FFD93B] font-bold shadow-[2px_2px_0px_#FFD93B]'
                    : 'border-white/20 bg-[#0E0716] text-white/80 hover:border-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'extras' && (
          <div className="grid grid-cols-2 gap-1.5">
            {EXTRA_OPTIONS.map((item) => {
              const isSelected = selectedExtras.includes(item.label);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => toggleExtra(item.label)}
                  className={`p-1.5 text-left text-xs font-pixel-sub border cursor-pointer ${
                    isSelected
                      ? 'border-[#3CC8D8] bg-[#142636] text-[#3CC8D8] font-bold shadow-[2px_2px_0px_#3CC8D8]'
                      : 'border-white/20 bg-[#0E0716] text-white/80 hover:border-white'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'mood' && (
          <div className="grid grid-cols-2 gap-1.5">
            {MOOD_OPTIONS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  courtAudio.playClick();
                  setSelectedMood(item.label);
                }}
                className={`p-1.5 text-left text-xs font-pixel-sub border cursor-pointer ${
                  selectedMood === item.label
                    ? 'border-[#E8409C] bg-[#2E1026] text-[#E8409C] font-bold shadow-[2px_2px_0px_#E8409C]'
                    : 'border-white/20 bg-[#0E0716] text-white/80 hover:border-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-[#E8409C] hover:bg-[#ff4fa8] text-white font-pixel-title text-xs tracking-wider uppercase border-2 border-white shadow-[3px_3px_0px_#B9A6E8] active:translate-x-[2px] active:translate-y-[2px] cursor-pointer flex items-center justify-center gap-2"
      >
        <Icon name="gavel" size={14} />
        <span>{isLoading ? 'DELIBERATING SENTENCE...' : 'SUBMIT OUTFIT FOR JUDGMENT'}</span>
      </button>
    </form>
  );
};
