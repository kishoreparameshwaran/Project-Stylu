import React, { useState, useEffect, useRef } from 'react';
import type { JudgeId, QuickOutfitSubmission, VerdictResponse } from './types/court';
import { JUDGE_PERSONAS } from './data/personas';
import { generateQuickVerdict, generateAppealVerdict } from './utils/courtEngine';
import { triggerGuiltyConfetti, triggerNotGuiltyConfetti } from './utils/confetti';
import { courtAudio } from './utils/audio';
import { speakJudgeCatchphrase } from './utils/speech';

import { LoginPage } from './components/LoginPage';
import { RetroHeader } from './components/RetroHeader';
import { readSession, writeSession, type StyluSession } from './utils/session';
import { CourtInfoCard } from './components/CourtInfoCard';
import { MenuSidebar } from './components/MenuSidebar';
import { CrtTelevision } from './components/CrtTelevision';
import { PixelModal } from './components/PixelModal';
import { Icon } from './components/Icon';
import { CameraCapture } from './components/CameraCapture';
import { VerdictScreen } from './components/VerdictScreen';
import { QuickModeBuilder } from './components/QuickModeBuilder';

// Sample pre-loaded mock trials for viral testing
const DEMO_OUTFITS = [
  {
    name: 'Neon Tokyo Drifter',
    top: 'Cyberpunk Reflective Windbreaker',
    bottoms: 'Wide Modular Tactical Cargos',
    shoes: 'Chunky Lug-Sole Combat Boots',
    extras: ['Matrix Sunglasses', 'Industrial Key Link Chain'],
    mood: 'Main Character Energy',
  },
  {
    name: 'Sharma Ji Ke Beta',
    top: 'Crisp Ironed Oxford Collar Shirt',
    bottoms: 'Tailored Wide Pleated Slacks',
    shoes: 'Polished Italian Leather Loafers',
    extras: ['Gold Signet Ring'],
    mood: 'Rishta Approved',
  },
  {
    name: 'Baggy Y2K Sleeper',
    top: 'Boxy Heavyweight Distressed Hoodie',
    bottoms: 'Acid Wash Carpenter Jeans',
    shoes: 'Vintage Dad Skate Sneakers',
    extras: ['Silver Link Necklace'],
    mood: 'Streetwear Royalty',
  },
];

export const App: React.FC = () => {
  const [session, setSession] = useState<StyluSession | null>(() => readSession());

  const handleEnterStudio = (next: StyluSession) => {
    writeSession(next);
    setSession(next);
  };

  if (!session) {
    return <LoginPage onEnter={handleEnterStudio} />;
  }

  return <CourtStudio />;
};

const CourtStudio: React.FC = () => {
  // Sound & CRT Toggles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanlinesEnabled, setScanlinesEnabled] = useState(true);
  const [activeLanguage, setActiveLanguage] = useState<'EN' | 'TA' | 'HI'>('EN');

  // TV Controls
  const [isTvPowered, setIsTvPowered] = useState(true);
  const [isTvMuted, setIsTvMuted] = useState(false);
  const [channelIndex, setChannelIndex] = useState(3); // Default CH 04 (Auntie Sunita)

  // Active Menu / Modal selection
  const [activeMenuId, setActiveMenuId] = useState<string>('trial');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Submissions & Trial State
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [activeVerdict, setActiveVerdict] = useState<VerdictResponse | null>(null);
  const [isTrialProcessing, setIsTrialProcessing] = useState(false);
  const [isAppealing, setIsAppealing] = useState(false);

  // Modals & Camera State
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Duel Mode state in Daily Trial
  const [duelFriendName, setDuelFriendName] = useState('Opponent Fit');
  const [duelResult, setDuelResult] = useState<string | null>(null);

  // High Scores Leaderboard Tab
  const [leaderboardTab, setLeaderboardTab] = useState<'best' | 'guilty' | 'appealed'>('best');

  // Cases History (with 2 starter dockets if empty)
  const [casesHistory, setCasesHistory] = useState<VerdictResponse[]>(() => {
    try {
      const saved = localStorage.getItem('outfit_court_cases');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Seed initial cases
    const initialCase1 = generateQuickVerdict({
      defendantName: 'Neon Tokyo Drifter',
      judgeId: 'genz_judge',
      top: 'Reflective Windbreaker',
      bottoms: 'Wide Tactical Cargos',
      shoes: 'Lug-Sole Combat Boots',
      extras: ['Matrix Sunglasses'],
      mood: 'Main Character Energy',
    });
    const initialCase2 = generateQuickVerdict({
      defendantName: 'Gym Rat Bro',
      judgeId: 'strict_auntie',
      top: 'Stringer Tank Top',
      bottoms: 'Faded Gym Shorts',
      shoes: 'Neon Ankle Socks',
      extras: ['Gallon Water Jug'],
      mood: 'Sigma Grind',
    });
    return [initialCase1, initialCase2];
  });

  // Jury Vote state
  const [juryVotes, setJuryVotes] = useState({
    guilty: 184,
    notGuilty: 126,
    userVoted: null as 'GUILTY' | 'NOT_GUILTY' | null,
    copiedShareLink: false,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync sound with audio manager
  useEffect(() => {
    courtAudio.setMuted(!soundEnabled || isTvMuted);
  }, [soundEnabled, isTvMuted]);

  // Sync cases history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('outfit_court_cases', JSON.stringify(casesHistory));
    } catch (e) {
      console.warn('Failed to save cases history', e);
    }
  }, [casesHistory]);

  const currentJudge = JUDGE_PERSONAS[channelIndex % JUDGE_PERSONAS.length];

  // TV Channel Navigation
  const handleChannelUp = () => {
    if (!isTvPowered) return;
    const nextIdx = (channelIndex + 1) % JUDGE_PERSONAS.length;
    setChannelIndex(nextIdx);
    courtAudio.playGavel();
    courtAudio.playStatic();
    speakJudgeCatchphrase(JUDGE_PERSONAS[nextIdx].catchphrase, soundEnabled && !isTvMuted);
  };

  const handleChannelDown = () => {
    if (!isTvPowered) return;
    const nextIdx = (channelIndex - 1 + JUDGE_PERSONAS.length) % JUDGE_PERSONAS.length;
    setChannelIndex(nextIdx);
    courtAudio.playGavel();
    courtAudio.playStatic();
    speakJudgeCatchphrase(JUDGE_PERSONAS[nextIdx].catchphrase, soundEnabled && !isTvMuted);
  };

  const handleTogglePower = () => {
    setIsTvPowered((prev) => !prev);
    courtAudio.playClick();
  };

  const handleToggleMute = () => {
    setIsTvMuted((prev) => !prev);
    courtAudio.playClick();
  };

  // Menu selection handler
  const handleSelectMenu = (id: string) => {
    setActiveMenuId(id);
    courtAudio.playClick();
    setActiveModal(id);
  };

  // Photo Selection
  const handleFileSelected = (file: File) => {
    courtAudio.playClick();
    processUploadedFile(file);
  };

  const processUploadedFile = (blob: Blob) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setUploadedPhotoUrl(url);
      runTrialProcess(blob);
    };
    reader.readAsDataURL(blob);
  };

  // Camera capture
  const handleCameraCapture = (blob: Blob, previewUrl: string) => {
    setShowCameraModal(false);
    setUploadedPhotoUrl(previewUrl);
    runTrialProcess(blob);
  };

  // Run Trial Execution with 3.5s timeout fallback so it NEVER hangs
  const runTrialProcess = async (blob: Blob) => {
    setIsTrialProcessing(true);
    courtAudio.playStatic();
    courtAudio.playGavel();

    try {
      let verdict: VerdictResponse;

      try {
        const formData = new FormData();
        formData.append('photo', blob, 'outfit.jpg');
        formData.append('defendantName', 'Street Defendant');
        formData.append('judgeId', currentJudge.id);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch('/api/trials/photo', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          verdict = await res.json();
        } else {
          verdict = generateQuickVerdict({
            defendantName: 'Street Defendant',
            judgeId: currentJudge.id as JudgeId,
            top: 'Detected Boxy Silhouette',
            bottoms: 'Wide-Leg Street Cargo',
            shoes: 'Chunky Retro Dad Shoes',
            extras: ['Matrix Sunglasses'],
            mood: 'Main Character Energy',
          });
        }
      } catch {
        verdict = generateQuickVerdict({
          defendantName: 'Street Defendant',
          judgeId: currentJudge.id as JudgeId,
          top: 'Detected Boxy Silhouette',
          bottoms: 'Wide-Leg Street Cargo',
          shoes: 'Chunky Retro Dad Shoes',
          extras: ['Matrix Sunglasses'],
          mood: 'Main Character Energy',
        });
      }

      setActiveVerdict(verdict);
      setCasesHistory((prev) => [verdict, ...prev]);

      if (verdict.verdict === 'GUILTY') {
        triggerGuiltyConfetti();
        courtAudio.playGuiltyBuzzer();
      } else {
        triggerNotGuiltyConfetti();
        courtAudio.playNotGuiltyCheer();
      }
    } finally {
      setIsTrialProcessing(false);
    }
  };

  // Run Instant Demo Fit
  const handleRunDemoFit = () => {
    courtAudio.playClick();
    const demo = DEMO_OUTFITS[Math.floor(Math.random() * DEMO_OUTFITS.length)];
    setIsTrialProcessing(true);
    courtAudio.playStatic();
    courtAudio.playGavel();

    setTimeout(() => {
      const verdict = generateQuickVerdict({
        defendantName: demo.name,
        judgeId: currentJudge.id as JudgeId,
        top: demo.top,
        bottoms: demo.bottoms,
        shoes: demo.shoes,
        extras: demo.extras,
        mood: demo.mood,
      });

      setActiveVerdict(verdict);
      setCasesHistory((prev) => [verdict, ...prev]);
      setIsTrialProcessing(false);

      if (verdict.verdict === 'GUILTY') {
        triggerGuiltyConfetti();
        courtAudio.playGuiltyBuzzer();
      } else {
        triggerNotGuiltyConfetti();
        courtAudio.playNotGuiltyCheer();
      }
    }, 1400);
  };

  // Quick mode submission
  const handleQuickModeSubmit = (submission: QuickOutfitSubmission) => {
    courtAudio.playGavel();
    courtAudio.playStatic();
    setIsTrialProcessing(true);

    setTimeout(() => {
      const verdict = generateQuickVerdict(submission);
      setActiveVerdict(verdict);
      setCasesHistory((prev) => [verdict, ...prev]);
      setActiveModal(null);
      setIsTrialProcessing(false);

      if (verdict.verdict === 'GUILTY') {
        triggerGuiltyConfetti();
        courtAudio.playGuiltyBuzzer();
      } else {
        triggerNotGuiltyConfetti();
        courtAudio.playNotGuiltyCheer();
      }
    }, 1300);
  };

  // Appeal Handler
  const handleAppeal = () => {
    if (!activeVerdict || activeVerdict.is_appealed) return;
    setIsAppealing(true);
    courtAudio.playGavel();
    courtAudio.playStatic();

    setTimeout(() => {
      const appealResult = generateAppealVerdict(activeVerdict);
      setActiveVerdict(appealResult);
      setCasesHistory((prev) =>
        prev.map((c) => (c.case_number === appealResult.case_number ? appealResult : c))
      );

      if (appealResult.verdict === 'NOT_GUILTY') {
        triggerNotGuiltyConfetti();
        courtAudio.playNotGuiltyCheer();
      } else {
        triggerGuiltyConfetti();
        courtAudio.playGuiltyBuzzer();
      }
      setIsAppealing(false);
    }, 1200);
  };

  // Reset trial
  const handleResetTrial = () => {
    setActiveVerdict(null);
    setUploadedPhotoUrl(null);
    courtAudio.playClick();
  };

  // Jury vote submission
  const handleVote = (type: 'GUILTY' | 'NOT_GUILTY') => {
    if (juryVotes.userVoted) return;
    courtAudio.playClick();
    if (type === 'GUILTY') {
      setJuryVotes((prev) => ({ ...prev, guilty: prev.guilty + 1, userVoted: 'GUILTY' }));
      courtAudio.playGuiltyBuzzer();
    } else {
      setJuryVotes((prev) => ({ ...prev, notGuilty: prev.notGuilty + 1, userVoted: 'NOT_GUILTY' }));
      courtAudio.playNotGuiltyCheer();
    }
  };

  // Friend Duel Simulator
  const handleRunDuel = () => {
    courtAudio.playGavel();
    const isUserWin = Math.random() > 0.45;
    const userScore = (7.5 + Math.random() * 2.3).toFixed(1);
    const friendScore = (6.0 + Math.random() * 3.5).toFixed(1);

    setDuelResult(
      isUserWin
        ? `🏆 WINNER: YOU (${userScore}/10) defeated ${duelFriendName} (${friendScore}/10)! +1,000 COURT XP!`
        : `💀 DEFEATED: ${duelFriendName} (${friendScore}/10) edged out your fit (${userScore}/10)! Sentenced to rematch!`
    );
    courtAudio.playNotGuiltyCheer();
  };

  const totalVotes = juryVotes.guilty + juryVotes.notGuilty;
  const guiltyPercent = Math.round((juryVotes.guilty / totalVotes) * 100);
  const notGuiltyPercent = 100 - guiltyPercent;

  // Filter leaderboard
  const getSortedLeaderboard = () => {
    if (leaderboardTab === 'best') {
      return [...casesHistory].sort((a, b) => b.fit_score - a.fit_score);
    }
    if (leaderboardTab === 'guilty') {
      return [...casesHistory].sort((a, b) => a.fit_score - b.fit_score);
    }
    return [...casesHistory].filter((c) => c.is_appealed);
  };

  return (
    <div className="tie-dye-bg tie-dye-animated min-h-screen text-white flex flex-col justify-between relative studio-vignette selection:bg-[#E8409C] selection:text-white">
      {/* Hidden file input for header or menu upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelected(e.target.files[0]);
            e.target.value = '';
          }
        }}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-hidden="true"
      />

      {/* Film grain noise overlay */}
      <div className="fixed inset-0 film-grain z-0 pointer-events-none" />

      {/* Optional analog scanlines over full page if toggle is ON */}
      {scanlinesEnabled && (
        <div className="fixed inset-0 scanlines-fx opacity-40 z-30 pointer-events-none" />
      )}

      {/* TOP CENTER: Retro Studio Header */}
      <RetroHeader
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          if (next) {
            courtAudio.playNotGuiltyCheer();
          }
        }}
        scanlinesEnabled={scanlinesEnabled}
        onToggleScanlines={() => setScanlinesEnabled(!scanlinesEnabled)}
      />

      {/* MAIN THREE-ZONE WORKSPACE */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex-grow flex items-center justify-center relative z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start lg:items-center">
          {/* ZONE 1: LEFT INFO CARD */}
          <div className="lg:col-span-3 order-3 lg:order-1 flex justify-center">
            <CourtInfoCard
              activeJudgeName={currentJudge.name}
              activeJudgeTitle={currentJudge.title}
              totalTrialsToday={1420 + casesHistory.length}
              onOpenQuickMode={() => setActiveModal('quick')}
            />
          </div>

          {/* ZONE 2: CENTER CRT TELEVISION */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center">
            <CrtTelevision
              isPowered={isTvPowered}
              onTogglePower={handleTogglePower}
              channelIndex={channelIndex}
              judgeName={currentJudge.name}
              judgeAvatar={currentJudge.avatar}
              isMuted={isTvMuted}
              onToggleMute={handleToggleMute}
              onChannelUp={handleChannelUp}
              onChannelDown={handleChannelDown}
              scanlinesEnabled={scanlinesEnabled}
              onFileSelected={handleFileSelected}
              onDemoFitClick={handleRunDemoFit}
              onQuickModeClick={() => setActiveModal('quick')}
              onCameraClick={() => setShowCameraModal(true)}
            >
              {/* Verdict Screen inside the CRT glass when trial completes */}
              {activeVerdict && (
                <VerdictScreen
                  verdict={activeVerdict}
                  onAppeal={handleAppeal}
                  onReset={handleResetTrial}
                  isAppealing={isAppealing}
                  photoUrl={uploadedPhotoUrl}
                />
              )}

              {/* Scanning Laser state while AI judge deliberates */}
              {isTrialProcessing && (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-black/90 relative overflow-hidden">
                  <div className="absolute inset-x-0 h-1.5 bg-[#3CC8D8] shadow-[0_0_20px_#3CC8D8] animate-bounce" />
                  <div className="text-center z-10">
                    <div className="text-4xl mb-3 animate-spin">⚖️</div>
                    <p className="font-pixel-title text-sm sm:text-base text-[#FFD93B] blink-pixel tracking-widest">
                      SCANNING OUTFIT EVIDENCE...
                    </p>
                    <p className="font-pixel-sub text-xs text-[#3CC8D8] mt-2">
                      {currentJudge.name} IS DELIBERATING YOUR FATE
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-1">
                      <span className="w-2 h-2 bg-[#E8409C] rounded-full animate-ping" />
                      <span className="w-2 h-2 bg-[#3CC8D8] rounded-full animate-ping delay-100" />
                      <span className="w-2 h-2 bg-[#FFD93B] rounded-full animate-ping delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </CrtTelevision>
          </div>

          {/* ZONE 3: RIGHT MENU SIDEBAR (7 BUTTONS) */}
          <div className="lg:col-span-3 order-2 lg:order-3 flex justify-center">
            <MenuSidebar activeId={activeMenuId} onSelect={handleSelectMenu} />
          </div>
        </div>
      </main>

      {/* BOTTOM FOOTER */}
      <footer className="w-full py-2 px-4 text-center text-xs font-pixel-sub text-[#B9A6E8] relative z-10 border-t border-[#3CC8D8]/20 bg-[#1A0F24]/75">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span>OUTFIT COURT © 1988-2026</span>
          <span>•</span>
          <span className="text-[#3CC8D8]">AI FASHION TRIBUNAL</span>
          <span>•</span>
          <span className="text-[#FFD93B]">ROAST CLOTHES, NEVER BODIES</span>
          <span>•</span>
          <span className="text-[#13A862]">PRESS SPACE / DROP PHOTO ON TV</span>
        </div>
      </footer>

      {/* =========================================================
          MODALS FOR THE 7 RIGHT MENU ITEMS
          ========================================================= */}

      {/* 01: START TRIAL LAUNCHER */}
      <PixelModal
        isOpen={activeModal === 'trial'}
        onClose={() => setActiveModal(null)}
        title="START OUTFIT TRIAL"
        badge="OPTION 01 // SUBMIT EVIDENCE"
      >
        <div className="space-y-3 font-pixel-body">
          <p className="text-base text-white/90">
            Choose how you want to present your outfit to {currentJudge.name}:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Action 1: Upload Photo */}
            <button
              onClick={() => {
                setActiveModal(null);
                fileInputRef.current?.click();
              }}
              className="p-3 bg-[#1A0F24] border-2 border-[#3CC8D8] hover:border-white shadow-pixel-lavender text-left cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon name="upload" size={16} className="text-[#3CC8D8]" />
                <span className="font-pixel-title text-xs text-white">UPLOAD PHOTO</span>
              </div>
              <p className="text-xs font-pixel-sub text-[#B9A6E8]">
                Browse from files or drop directly on the TV glass
              </p>
            </button>

            {/* Action 2: Camera Capture */}
            <button
              onClick={() => {
                setActiveModal(null);
                setShowCameraModal(true);
              }}
              className="p-3 bg-[#1A0F24] border-2 border-[#E8409C] hover:border-white shadow-pixel-lavender text-left cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon name="camera" size={16} className="text-[#FFD93B]" />
                <span className="font-pixel-title text-xs text-white">OPEN CAMERA</span>
              </div>
              <p className="text-xs font-pixel-sub text-[#B9A6E8]">
                Snap live outfit selfie on phone or webcam
              </p>
            </button>

            {/* Action 3: Quick Mode */}
            <button
              onClick={() => {
                setActiveModal('quick');
              }}
              className="p-3 bg-[#1A0F24] border-2 border-[#FFD93B] hover:border-white shadow-pixel-lavender text-left cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon name="shirt" size={16} className="text-[#FFD93B]" />
                <span className="font-pixel-title text-xs text-white">QUICK MODE</span>
              </div>
              <p className="text-xs font-pixel-sub text-[#B9A6E8]">
                No camera? Pick tops, pants, shoes &amp; vibe chips
              </p>
            </button>

            {/* Action 4: Instant Demo Fit */}
            <button
              onClick={() => {
                setActiveModal(null);
                handleRunDemoFit();
              }}
              className="p-3 bg-[#261338] border-2 border-[#13A862] hover:border-white shadow-pixel-lavender text-left cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon name="zap" size={16} className="text-[#13A862]" />
                <span className="font-pixel-title text-xs text-[#13A862]">INSTANT DEMO</span>
              </div>
              <p className="text-xs font-pixel-sub text-[#B9A6E8]">
                Run immediate test fit to see verdict &amp; score in 1s
              </p>
            </button>
          </div>
        </div>
      </PixelModal>

      {/* QUICK MODE CHIPS MODAL */}
      <PixelModal
        isOpen={activeModal === 'quick'}
        onClose={() => setActiveModal(null)}
        title="QUICK TRIAL BUILDER"
        badge="OPTION 01 // NO PHOTO MODE"
      >
        <div className="space-y-3">
          <p className="font-pixel-body text-base text-white/90">
            Assemble your outfit chips below and submit for high-stakes judgment:
          </p>
          <QuickModeBuilder
            selectedJudgeId={currentJudge.id}
            onSubmit={handleQuickModeSubmit}
            isLoading={isTrialProcessing}
          />
        </div>
      </PixelModal>

      {/* 02: PICK A JUDGE */}
      <PixelModal
        isOpen={activeModal === 'judge'}
        onClose={() => setActiveModal(null)}
        title="FASHION MAGISTRATE DOSSIER"
        badge="OPTION 02 // CHOOSE YOUR CRITIC"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {JUDGE_PERSONAS.map((judge, idx) => {
            const isSelected = channelIndex === idx;
            return (
              <button
                key={judge.id}
                onClick={() => {
                  setChannelIndex(idx);
                  courtAudio.playGavel();
                  courtAudio.playStatic();
                  speakJudgeCatchphrase(judge.catchphrase, soundEnabled && !isTvMuted);
                  setActiveModal(null);
                }}
                className={`p-3 text-left border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#FFD93B] bg-[#2A1538] shadow-[4px_4px_0px_#FFD93B]'
                    : 'border-[#3CC8D8] bg-[#1A0F24] shadow-[3px_3px_0px_#B9A6E8] hover:border-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl">{judge.avatar}</span>
                  <span className="font-pixel-title text-[10px] text-[#E8409C]">
                    CH {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-pixel-title text-xs text-white">{judge.name}</h3>
                <p className="font-pixel-sub text-[11px] text-[#3CC8D8] mt-0.5">{judge.title}</p>
                <div className="mt-2 text-xs font-pixel-body text-white/80 line-clamp-2 italic">
                  &ldquo;{judge.catchphrase}&rdquo;
                </div>
                <div className="mt-2 flex items-center justify-between pt-1 border-t border-white/10 text-[10px] font-pixel-sub">
                  <span className="text-[#B9A6E8]">SEVERITY:</span>
                  <span className="text-[#FFD93B] font-bold">{judge.severity}</span>
                </div>
              </button>
            );
          })}
        </div>
      </PixelModal>

      {/* 03: MY CASES */}
      <PixelModal
        isOpen={activeModal === 'cases'}
        onClose={() => setActiveModal(null)}
        title="PAST CASE RECORDS"
        badge="OPTION 03 // DOCKET HISTORY"
      >
        {casesHistory.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="scales" size={32} className="text-[#3CC8D8] mb-2" />
            <p className="font-pixel-title text-sm text-white">NO VERDICTS ON FILE</p>
            <p className="font-pixel-body text-base text-[#B9A6E8] mt-1">
              Drop your first outfit on the TV to begin your courtroom rap sheet!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="text-xs font-pixel-sub text-[#B9A6E8] pb-1 border-b border-white/10">
              CLICK ANY DOCKET TO LOAD DIRECTLY ONTO CRT TV:
            </div>
            {casesHistory.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  courtAudio.playClick();
                  setActiveVerdict(item);
                  setActiveModal(null);
                }}
                className="p-3 bg-[#241632] hover:bg-[#321e42] border-2 border-[#3CC8D8] shadow-[3px_3px_0px_#B9A6E8] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-pixel-title text-xs text-[#E8409C]">
                      {item.case_number}
                    </span>
                    <span
                      className={`text-[9px] font-pixel-sub px-1.5 py-0.2 border ${
                        item.verdict === 'GUILTY'
                          ? 'border-[#E5243B] text-[#E5243B] bg-red-950/40'
                          : 'border-[#13A862] text-[#13A862] bg-green-950/40'
                      }`}
                    >
                      {item.verdict}
                    </span>
                    {item.is_appealed && (
                      <span className="text-[9px] font-pixel-sub text-[#FFD93B]">★ APPEALED</span>
                    )}
                  </div>
                  <p className="font-pixel-body text-sm text-white/90 mt-1 line-clamp-1">
                    {item.sentence}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="font-pixel-title text-base text-[#FFD93B]">
                    {item.fit_score}/10
                  </span>
                  <span className="block text-[9px] font-pixel-sub text-[#3CC8D8]">VIEW &gt;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </PixelModal>

      {/* 04: JURY VOTE */}
      <PixelModal
        isOpen={activeModal === 'jury'}
        onClose={() => setActiveModal(null)}
        title="LIVE JURY VOTING"
        badge="OPTION 04 // PUBLIC TRIBUNAL"
      >
        <div className="space-y-3 font-pixel-body">
          <p className="text-base text-white/90">
            Does the defendant deserve the conviction? Cast your vote on today&apos;s featured fit:
          </p>

          <div className="p-3.5 bg-[#261338] border-2 border-[#3CC8D8] shadow-pixel-lavender">
            <div className="flex items-center justify-between text-xs font-pixel-sub mb-2">
              <span className="text-[#E5243B]">GUILTY: {guiltyPercent}% ({juryVotes.guilty})</span>
              <span className="text-[#13A862]">NOT GUILTY: {notGuiltyPercent}% ({juryVotes.notGuilty})</span>
            </div>

            {/* Pixel Voting Bar */}
            <div className="w-full h-6 bg-black border-2 border-white flex overflow-hidden">
              <div
                style={{ width: `${guiltyPercent}%` }}
                className="bg-[#E5243B] h-full transition-all duration-500 flex items-center justify-center text-[10px] font-pixel-title text-white"
              >
                {guiltyPercent > 15 ? `${guiltyPercent}%` : ''}
              </div>
              <div
                style={{ width: `${notGuiltyPercent}%` }}
                className="bg-[#13A862] h-full transition-all duration-500 flex items-center justify-center text-[10px] font-pixel-title text-white"
              >
                {notGuiltyPercent > 15 ? `${notGuiltyPercent}%` : ''}
              </div>
            </div>

            {/* Voting Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 mt-3.5">
              <button
                onClick={() => handleVote('GUILTY')}
                disabled={juryVotes.userVoted !== null}
                className="py-2 px-3 bg-[#E5243B] hover:bg-red-600 disabled:opacity-50 text-white font-pixel-title text-xs border-2 border-white shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
              >
                VOTE GUILTY
              </button>
              <button
                onClick={() => handleVote('NOT_GUILTY')}
                disabled={juryVotes.userVoted !== null}
                className="py-2 px-3 bg-[#13A862] hover:bg-emerald-600 disabled:opacity-50 text-white font-pixel-title text-xs border-2 border-white shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
              >
                VOTE NOT GUILTY
              </button>
            </div>

            {juryVotes.userVoted && (
              <p className="mt-2.5 text-center text-xs font-pixel-sub text-[#FFD93B]">
                ✓ VOTE RECORDED! PUBLIC SENTENCE SYNCED.
              </p>
            )}

            {/* Share Jury Link button */}
            <div className="mt-3 pt-2.5 border-t border-white/20">
              <button
                onClick={() => {
                  courtAudio.playClick();
                  navigator.clipboard.writeText(`${window.location.origin}/#jury-vote`);
                  setJuryVotes((prev) => ({ ...prev, copiedShareLink: true }));
                  setTimeout(() => {
                    setJuryVotes((prev) => ({ ...prev, copiedShareLink: false }));
                  }, 2000);
                }}
                className="w-full py-1.5 bg-[#1A0F24] hover:bg-[#321644] text-white border border-[#3CC8D8] font-pixel-sub text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Icon name="share" size={12} className="text-[#3CC8D8]" />
                <span>{juryVotes.copiedShareLink ? 'LINK COPIED TO CLIPBOARD!' : 'COPY JURY VOTE LINK FOR FRIENDS'}</span>
              </button>
            </div>
          </div>
        </div>
      </PixelModal>

      {/* 05: HIGH SCORES */}
      <PixelModal
        isOpen={activeModal === 'scores'}
        onClose={() => setActiveModal(null)}
        title="ARCADE LEADERBOARD"
        badge="OPTION 05 // STYLE LEGENDS"
      >
        <div className="space-y-3 font-pixel-body">
          {/* Tabs: Best Dressed, Most Guilty, Most Appealed */}
          <div className="flex gap-1 border-b border-[#3CC8D8]/50 pb-2 text-xs font-pixel-sub">
            <button
              onClick={() => {
                courtAudio.playClick();
                setLeaderboardTab('best');
              }}
              className={`flex-1 py-1 px-1.5 border cursor-pointer ${
                leaderboardTab === 'best'
                  ? 'border-[#FFD93B] bg-[#FFD93B] text-black font-bold'
                  : 'border-white/20 text-white/70'
              }`}
            >
              BEST DRESSED
            </button>
            <button
              onClick={() => {
                courtAudio.playClick();
                setLeaderboardTab('guilty');
              }}
              className={`flex-1 py-1 px-1.5 border cursor-pointer ${
                leaderboardTab === 'guilty'
                  ? 'border-[#E5243B] bg-[#E5243B] text-white font-bold'
                  : 'border-white/20 text-white/70'
              }`}
            >
              MOST GUILTY
            </button>
            <button
              onClick={() => {
                courtAudio.playClick();
                setLeaderboardTab('appealed');
              }}
              className={`flex-1 py-1 px-1.5 border cursor-pointer ${
                leaderboardTab === 'appealed'
                  ? 'border-[#3CC8D8] bg-[#3CC8D8] text-black font-bold'
                  : 'border-white/20 text-white/70'
              }`}
            >
              MOST APPEALED
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[#3CC8D8] font-pixel-title text-[10px] px-2">
              <span>RANK / DEFENDANT</span>
              <span>VERDICT</span>
              <span>SCORE</span>
            </div>
            {getSortedLeaderboard().map((entry, idx) => (
              <div
                key={entry.case_number + idx}
                onClick={() => {
                  courtAudio.playClick();
                  setActiveVerdict(entry);
                  setActiveModal(null);
                }}
                className="flex justify-between items-center py-1.5 px-2 bg-[#261338] hover:bg-[#341b4c] border border-[#3CC8D8]/40 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="font-pixel-title text-xs text-[#FFD93B]">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="font-pixel-body text-base text-white truncate max-w-[140px]">
                    {entry.defendant_name}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-pixel-sub ${
                    entry.verdict === 'GUILTY' ? 'text-[#E5243B]' : 'text-[#13A862]'
                  }`}
                >
                  {entry.verdict}
                </span>
                <span className="font-pixel-title text-sm text-[#FFD93B]">{entry.fit_score}/10</span>
              </div>
            ))}
          </div>
        </div>
      </PixelModal>

      {/* 06: DAILY TRIAL & DUELS */}
      <PixelModal
        isOpen={activeModal === 'daily'}
        onClose={() => setActiveModal(null)}
        title="DAILY TRIAL & DUELS"
        badge="OPTION 06 // 24-HR THEME & RUNWAY BATTLE"
      >
        <div className="space-y-3 font-pixel-body">
          {/* Today's Theme Banner */}
          <div className="p-3 bg-[#261338] border-2 border-[#FFD93B] shadow-pixel-lavender">
            <div className="flex items-center justify-between mb-1">
              <span className="font-pixel-title text-xs text-[#FFD93B]">★ TODAY&apos;S DIRECTIVE ★</span>
              <span className="text-xs font-pixel-sub text-[#3CC8D8]">STREAK: 4 DAYS 🔥</span>
            </div>
            <h3 className="font-pixel-title text-sm text-white mb-1">CYBER UTILITY WEDNESDAY</h3>
            <p className="text-base text-white/90">
              Submit your sharpest cargos, modular layers, or link chains for double XP and badge unlock!
            </p>
          </div>

          {/* Friend Duel VS screen */}
          <div className="p-3 bg-[#1A0F24] border-2 border-[#E8409C] shadow-pixel-lavender">
            <div className="font-pixel-title text-xs text-[#E8409C] mb-2 flex items-center gap-2">
              <span>⚔️ FRIEND DUEL: RUNWAY VS SCREEN</span>
            </div>
            <p className="text-sm text-white/80 mb-2">
              Pit your outfit against a friend&apos;s fit in a 1v1 courtroom showdown!
            </p>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={duelFriendName}
                onChange={(e) => setDuelFriendName(e.target.value)}
                placeholder="Enter friend's name / handle..."
                className="flex-grow px-2 py-1 bg-[#090B10] border border-[#3CC8D8] text-white text-sm font-pixel-body"
              />
              <button
                onClick={handleRunDuel}
                className="py-1 px-3 bg-[#E8409C] hover:bg-[#ff4fa8] text-white font-pixel-title text-xs border border-white cursor-pointer"
              >
                [ DUEL ]
              </button>
            </div>
            {duelResult && (
              <div className="p-2 bg-[#261338] border border-[#FFD93B] text-xs font-pixel-sub text-[#FFD93B]">
                {duelResult}
              </div>
            )}
          </div>
        </div>
      </PixelModal>

      {/* 04: SETTINGS */}
      <PixelModal
        isOpen={activeModal === 'settings'}
        onClose={() => setActiveModal(null)}
        title="SYSTEM & DATA SETTINGS"
        badge="OPTION 04 // PREFERENCES"
      >
        <div className="space-y-3 font-pixel-body text-base">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-2.5 bg-[#261338] border border-[#3CC8D8]">
            <div className="flex items-center gap-2">
              <Icon name="volume" size={16} className="text-[#3CC8D8]" />
              <span className="text-white">8-BIT AUDIO SYNTHESIZER:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  courtAudio.playClick();
                  courtAudio.playNotGuiltyCheer();
                }}
                className="px-2 py-0.5 bg-[#1A0F24] border border-[#FFD93B] text-[#FFD93B] font-pixel-sub text-[10px] cursor-pointer"
              >
                TEST SOUND
              </button>
              <button
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  if (next) courtAudio.playNotGuiltyCheer();
                }}
                className="px-2.5 py-1 bg-[#1A0F24] border border-white font-pixel-sub text-xs cursor-pointer shadow-[2px_2px_0px_#B9A6E8]"
              >
                <span className={soundEnabled ? 'text-[#13A862]' : 'text-[#E5243B]'}>
                  {soundEnabled ? 'ENABLED' : 'MUTED'}
                </span>
              </button>
            </div>
          </div>

          {/* Scanlines Toggle */}
          <div className="flex items-center justify-between p-2.5 bg-[#261338] border border-[#3CC8D8]">
            <div className="flex items-center gap-2">
              <Icon name="tv" size={16} className="text-[#3CC8D8]" />
              <span className="text-white">CRT ANALOG SCANLINES:</span>
            </div>
            <button
              onClick={() => setScanlinesEnabled(!scanlinesEnabled)}
              className="px-2.5 py-1 bg-[#1A0F24] border border-white font-pixel-sub text-xs cursor-pointer shadow-[2px_2px_0px_#B9A6E8]"
            >
              <span className={scanlinesEnabled ? 'text-[#13A862]' : 'text-[#E5243B]'}>
                {scanlinesEnabled ? 'ANALOG CRT' : 'HI-RES CLEAN'}
              </span>
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between p-2.5 bg-[#261338] border border-[#3CC8D8]">
            <span className="text-white">LANGUAGE DIALECT:</span>
            <div className="flex gap-1 font-pixel-sub text-xs">
              {(['EN', 'TA', 'HI'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    courtAudio.playClick();
                    setActiveLanguage(lang);
                  }}
                  className={`px-2 py-0.5 border cursor-pointer ${
                    activeLanguage === lang
                      ? 'border-[#FFD93B] bg-[#FFD93B] text-black font-bold'
                      : 'border-white/30 text-white/70'
                  }`}
                >
                  {lang === 'EN' ? 'English' : lang === 'TA' ? 'Tamil' : 'Hindi'}
                </button>
              ))}
            </div>
          </div>

          {/* Purge Local Data */}
          <div className="pt-2 border-t border-white/20">
            <button
              onClick={() => {
                if (confirm('Clear all local docket cases and AI consent history?')) {
                  setCasesHistory([]);
                  localStorage.removeItem('outfit_court_cases');
                  localStorage.removeItem('ai_photo_consent');
                  setActiveVerdict(null);
                  setActiveModal(null);
                  courtAudio.playGavel();
                }
              }}
              className="w-full py-2 bg-[#E5243B] hover:bg-red-700 text-white font-pixel-sub text-xs border border-white shadow-[3px_3px_0px_#000] cursor-pointer"
            >
              [ PURGE ALL COURT DATA &amp; RESET DOCKET ]
            </button>
          </div>
        </div>
      </PixelModal>

      {/* 05: ABOUT STYLU MODAL */}
      <PixelModal
        isOpen={activeModal === 'about'}
        onClose={() => setActiveModal(null)}
        title="ABOUT STYLU"
        badge="OPTION 05 // SYSTEM INTEL"
      >
        <div className="space-y-3 font-pixel-body">
          <div className="p-3 bg-gradient-to-r from-[#2A1538] via-[#1A0F24] to-[#2A1538] border-2 border-[#3CC8D8] text-center shadow-[0_0_12px_rgba(60,200,216,0.3)]">
            <div className="font-pixel-title text-sm sm:text-base text-[#FFD93B] tracking-widest italic">
              “Style you with stylu”
            </div>
            <span className="text-[10px] font-pixel-sub text-[#B9A6E8] tracking-wide mt-1 block">
              YOUR PERSONAL AI DRIP TRIBUNAL
            </span>
          </div>

          <div className="bg-[#120B1A] border border-white/20 p-3 space-y-2.5 text-xs">
            <p className="text-white/95 leading-relaxed font-pixel-body text-sm">
              <strong className="text-[#3CC8D8] font-pixel-title">STYLU</strong> is a retro arcade fashion courtroom that turns everyday dressing into a playful, interactive experience. Submit your outfit selfie to face an iconic bench of AI judges with sharp eyes and legendary personalities.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-pixel-sub">
              <div className="p-2 bg-[#1A0F24] border border-[#3CC8D8]/40">
                <div className="text-[#3CC8D8] font-bold text-[11px] mb-0.5">⚖️ 5-TIER DRIP SCALE</div>
                <p className="text-[#B9A6E8] text-[10px] leading-tight">
                  Clear, instant ratings: Fabulous, Nice, Good, Ok, or Guilty.
                </p>
              </div>
              <div className="p-2 bg-[#1A0F24] border border-[#FFD93B]/40">
                <div className="text-[#FFD93B] font-bold text-[11px] mb-0.5">🎰 7-DAY DRESSCODE WHEEL</div>
                <p className="text-[#B9A6E8] text-[10px] leading-tight">
                  Spin the Lucky Wheel Oracle to generate fresh aesthetic missions.
                </p>
              </div>
              <div className="p-2 bg-[#1A0F24] border border-[#E8409C]/40">
                <div className="text-[#E8409C] font-bold text-[11px] mb-0.5">📺 RETRO CRT EXPERIENCE</div>
                <p className="text-[#B9A6E8] text-[10px] leading-tight">
                  Scanlines, 8-bit sound effects, TV tuner clicks, and instant appeals.
                </p>
              </div>
              <div className="p-2 bg-[#1A0F24] border border-[#13A862]/40">
                <div className="text-[#13A862] font-bold text-[11px] mb-0.5">💡 WARDROBE ADVICE</div>
                <p className="text-[#B9A6E8] text-[10px] leading-tight">
                  Tailored fashion critiques and tips to level up your fits every day.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between">
            <span className="text-[10px] font-pixel-sub text-white/60">VERSION 9.4 // STYLU ENGINE</span>
            <button
              onClick={() => setActiveModal('contact')}
              className="px-3 py-1.5 bg-[#1A0F24] hover:bg-[#2A1538] border border-[#3CC8D8] text-[#3CC8D8] font-pixel-title text-[10px] tracking-wider cursor-pointer shadow-[2px_2px_0px_#3CC8D8]"
            >
              📞 CONTACT CREATOR
            </button>
          </div>
        </div>
      </PixelModal>

      {/* 06: CONTACT US MODAL */}
      <PixelModal
        isOpen={activeModal === 'contact'}
        onClose={() => setActiveModal(null)}
        title="CONTACT US"
        badge="OPTION 06 // COMMUNICATIONS"
      >
        <div className="space-y-3 font-pixel-body">
          <div className="p-2.5 bg-[#120B1A] border border-white/20 text-center">
            <span className="font-pixel-title text-xs text-[#FFD93B] tracking-wider">“Style you with stylu”</span>
            <p className="text-[10px] font-pixel-sub text-[#B9A6E8] mt-0.5">
              Reach out directly for support, collaborations, or styling queries!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Phone Card */}
            <div className="bg-[#1A0F24] border-2 border-[#3CC8D8] p-3 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base">📱</span>
                  <span className="font-pixel-title text-[10px] text-[#3CC8D8]">PHONE &amp; WHATSAPP</span>
                </div>
                <div className="font-pixel-title text-xs text-white tracking-wider mt-1 select-all font-bold">
                  8248049524
                </div>
                <p className="text-[10px] font-pixel-sub text-[#B9A6E8] mt-0.5">Direct line &amp; WhatsApp chat</p>
              </div>
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                <a
                  href="tel:8248049524"
                  className="px-2 py-1 bg-[#2A1538] hover:bg-[#3D1F52] border border-[#3CC8D8] text-[#3CC8D8] font-pixel-title text-[9px] tracking-wider text-center"
                >
                  📞 CALL: 8248049524
                </a>
                <a
                  href="https://wa.me/918248049524"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400 text-emerald-300 font-pixel-title text-[9px] tracking-wider text-center"
                >
                  💬 WHATSAPP CHAT
                </a>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-[#1A0F24] border-2 border-[#E8409C] p-3 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base">✉️</span>
                  <span className="font-pixel-title text-[10px] text-[#E8409C]">EMAIL INBOX</span>
                </div>
                <div className="font-pixel-title text-[10px] sm:text-[11px] text-white tracking-wider mt-1 select-all break-all font-bold">
                  12kishore47@gmail.com
                </div>
                <p className="text-[10px] font-pixel-sub text-[#B9A6E8] mt-0.5">Inbox &amp; feature requests</p>
              </div>
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                <a
                  href="mailto:12kishore47@gmail.com"
                  className="px-2 py-1 bg-[#2A1538] hover:bg-[#3D1F52] border border-[#E8409C] text-[#E8409C] font-pixel-title text-[9px] tracking-wider text-center"
                >
                  ✉️ SEND EMAIL
                </a>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/20 flex justify-between items-center text-[10px] font-pixel-sub text-[#B9A6E8]">
            <span>LINE STATUS: ACTIVE &amp; SECURE</span>
            <span className="text-[#3CC8D8]">KISHORE // STYLU ARCHITECT</span>
          </div>
        </div>
      </PixelModal>

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCameraModal(false)}
        />
      )}
    </div>
  );
};

export default App;
