import React, { useEffect, useMemo, useState } from 'react';
import type { AuthMode, StyluSession } from '../utils/session';
import { generateHandle, normalizeHandle } from '../utils/session';

interface LoginPageProps {
  onEnter: (session: StyluSession) => void;
}

const MENU: Array<{ id: AuthMode; num: string; title: string; sub: string }> = [
  { id: 'signin', num: '01', title: 'SIGN IN', sub: 'ENTER THE STUDIO' },
  { id: 'guest', num: '02', title: 'GUEST ACCESS', sub: 'ANONYMOUS DOCKET' },
  { id: 'register', num: '03', title: 'CREATE DOCKET', sub: 'NEW DEFENDANT FILE' },
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export const LoginPage: React.FC<LoginPageProps> = ({ onEnter }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [hiRes, setHiRes] = useState(false);
  const [tvOn, setTvOn] = useState(true);
  const [clock, setClock] = useState(() => new Date());
  const [activeModal, setActiveModal] = useState<'about' | 'contact' | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const timecode = useMemo(() => {
    return `${pad(clock.getHours())}:${pad(clock.getMinutes())}:${pad(clock.getSeconds())} [SP]`;
  }, [clock]);

  const channelLabel =
    mode === 'signin' ? 'CH 00 : ACCESS GATE' : mode === 'register' ? 'CH 01 : NEW DOCKET' : 'CH 02 : GUEST LANE';

  const submit = (nextMode: AuthMode = mode) => {
    setError(null);

    if (nextMode === 'guest') {
      setBusy(true);
      window.setTimeout(() => {
        onEnter({
          handle: generateHandle(),
          mode: 'guest',
          enteredAt: new Date().toISOString(),
        });
      }, 420);
      return;
    }

    const clean = normalizeHandle(handle);
    if (clean.length < 3) {
      setError('HANDLE REQUIRED TO ENTER STUDIO');
      return;
    }
    if (password.length < 4) {
      setError('ACCESS CODE MUST BE 4+ CHARACTERS');
      return;
    }
    if (nextMode === 'register' && password !== confirm) {
      setError('ACCESS CODES DO NOT MATCH');
      return;
    }

    setBusy(true);
    window.setTimeout(() => {
      onEnter({
        handle: clean,
        mode: nextMode,
        enteredAt: new Date().toISOString(),
      });
    }, 480);
  };

  const cycleMode = () => {
    const order: AuthMode[] = ['signin', 'guest', 'register'];
    const next = order[(order.indexOf(mode) + 1) % order.length];
    setMode(next);
    setError(null);
  };

  return (
    <div className="studio-split-bg min-h-screen text-[#fcf2e3] font-studio flex flex-col relative">
      <div className="fixed inset-0 film-grain z-0 pointer-events-none" />
      {!hiRes && <div className="fixed inset-0 scanlines-fx opacity-40 z-30 pointer-events-none" />}

      <header className="studio-header w-full relative z-20 pt-3 pb-2 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 font-broadcast text-[10px] tracking-wider">
            <span className="flex items-center gap-1.5 text-sky-300 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block shadow-[0_0_8px_#38bdf8]" />
              <span className="text-white font-bold">REC ●</span>
            </span>
            <span className="text-[#f4dfca]">{timecode}</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 border border-[#dfd0bc]/50 bg-[#28221b]/80 text-[#f4dfca]">
              B&amp;E AIR // CH.00
            </span>
          </div>

          <nav className="flex items-center gap-1 md:gap-2 font-broadcast text-[10px] text-[#fcf2e3]" aria-label="Broadcast navigation">
            <span className="flex items-center gap-1 px-2 py-1 bg-[#28221b] border border-sky-400 text-sky-200">
              HOME
            </span>
            <button
              type="button"
              onClick={() => setActiveModal('about')}
              className="hidden sm:inline px-2 py-1 bg-[#28221b] hover:bg-[#3d342a] border border-[#dfd0bc]/60 text-[#dfd0bc] hover:text-sky-200 cursor-pointer"
            >
              ABOUT
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('contact')}
              className="hidden sm:inline px-2 py-1 bg-[#28221b] hover:bg-[#3d342a] border border-[#dfd0bc]/60 text-[#dfd0bc] hover:text-sky-200 cursor-pointer"
            >
              CONTACT
            </button>
            <span className="hidden md:flex items-center gap-1 px-2 py-1 bg-[#1a232c] border border-sky-300/60 text-sky-300 text-[9px]">
              <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-ping" />
              DASHBOARD: LIVE
            </span>
          </nav>

          <div className="flex items-center gap-3 font-broadcast text-[11px]">
            <div className="hidden lg:flex items-center gap-1" title="Broadcast audio level">
              <span className="text-[10px] text-[#dfd0bc] mr-1.5">AUDIO L/R</span>
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-1 bg-sky-400 h-1" />
                <span className="w-1 bg-sky-300 h-2" />
                <span className="w-1 bg-sky-200 h-3" />
                <span className="w-1 bg-[#f4dfca] h-2" />
                <span className="w-1 bg-white h-2.5" />
                <span className="w-1 bg-sky-300 h-1 animate-pulse" />
              </div>
            </div>
            <button
              type="button"
              className="px-2 py-1 bg-[#28221b] border border-[#dfd0bc]/70"
              onClick={() => setSoundOn((v) => !v)}
            >
              SOUND: <span className="text-sky-300">{soundOn ? 'ON' : 'OFF'}</span>
            </button>
            <button
              type="button"
              className="px-2 py-1 bg-[#28221b] border border-[#dfd0bc]/70"
              onClick={() => setHiRes((v) => !v)}
            >
              CRT: <span className="text-sky-200">{hiRes ? 'HI-RES' : 'SCAN'}</span>
            </button>
            <span className="px-2 py-1 bg-[#28221b] border border-[#dfd0bc]/70">
              ⚙️ <span className="text-sky-300">SETTINGS</span>
            </span>
            <span className="inline-flex items-center justify-center w-6 h-6 bg-[#1a232c] border border-sky-300 text-sky-200 text-[10px] font-bold">
              Ps
            </span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 py-4 md:py-6 relative z-10 flex-grow flex flex-col justify-center">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="font-broadcast text-lg sm:text-2xl md:text-3xl tracking-widest text-[#fcf2e3] drop-shadow-[0_0_15px_rgba(56,189,248,0.85)]">
            WELCOME TO <span className="text-sky-300">STYLU</span>
          </h1>
          <p className="font-broadcast text-xs sm:text-sm text-sky-200 mt-2 tracking-widest drop-shadow-[0_0_12px_rgba(56,189,248,0.8)] italic">
            "Style you with stylu"
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-end max-w-7xl mx-auto w-full">
          <section className="lg:col-span-3 order-2 lg:order-1 flex flex-col items-center justify-end pb-1 relative">
            <div className="mb-2 bg-[#28221b]/95 border-2 border-[#dfd0bc] px-3 py-1.5 text-center relative">
              <span className="font-broadcast text-[9px] text-sky-300 tracking-wider block">
                CLICK ME TO TUNE TV! 📺
              </span>
              <span className="font-studio text-[10px] text-[#f4dfca] block opacity-80">(REMOTE CONTROL ACTIVE)</span>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#28221b] border-r-2 border-b-2 border-[#dfd0bc] rotate-45" />
            </div>
            <button
              type="button"
              onClick={cycleMode}
              className="relative cursor-pointer group bg-transparent border-0 p-0"
              title="Click character to switch login channel"
            >
              <img
                src="/assets/character_remote.png"
                alt="Studio operator with remote control"
                className="w-full max-w-[210px] md:max-w-[230px] h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] transition-transform duration-150 group-hover:scale-105 active:scale-95"
              />
            </button>
          </section>

          <section className="lg:col-span-6 order-1 lg:order-2 flex justify-center">
            <div className="w-full max-w-[560px] cream-crt-housing p-4 md:p-6 rounded-[32px] relative">
              <div className="flex justify-center space-x-1.5 mb-2.5 opacity-70">
                <span className="w-8 h-1 bg-[#a89682] rounded-full" />
                <span className="w-8 h-1 bg-[#a89682] rounded-full" />
                <span className="w-8 h-1 bg-[#a89682] rounded-full" />
                <span className="w-8 h-1 bg-[#a89682] rounded-full" />
                <span className="w-8 h-1 bg-[#a89682] rounded-full" />
              </div>

              <div className="cream-crt-bezel p-3 md:p-4 rounded-[26px] relative">
                <div className="relative cream-crt-screen rounded-[22px] overflow-hidden aspect-[4/3] border-2 border-slate-900 flex flex-col justify-between p-3 md:p-4 crt-flicker">
                  <div className="crt-glass-glare absolute inset-0 z-20 pointer-events-none" />
                  {!hiRes && <div className="scanlines-fx absolute inset-0 z-10 pointer-events-none opacity-50" />}

                  {!tvOn ? (
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping mb-2" />
                      <p className="font-broadcast text-[10px] tracking-widest text-sky-200/70">STANDBY // POWER OFF</p>
                    </div>
                  ) : (
                    <>
                      <div className="relative z-10 flex justify-between items-start text-[10px] md:text-xs font-broadcast text-sky-300">
                        <span className="bg-black/80 px-2 py-1 rounded border border-sky-400/60">{channelLabel}</span>
                        <span className="text-sky-200 animate-pulse bg-black/80 px-2 py-1 rounded border border-sky-300/60">
                          AUTH GATE LIVE
                        </span>
                      </div>

                      <form
                        className="relative z-10 my-auto text-center px-1 md:px-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          submit();
                        }}
                      >
                        <div className="border-2 border-dashed border-sky-400 p-2.5 md:p-3 bg-black/60 rounded-lg shadow-[0_0_15px_rgba(56,189,248,0.25)]">
                          <div className="flex items-center justify-center gap-3 mb-3">
                            <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 flex items-center justify-center bg-sky-950/80 rounded-lg border-2 border-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.5)]">
                              <span className="text-2xl" aria-hidden>
                                {mode === 'guest' ? '🎭' : mode === 'register' ? '📁' : '🔐'}
                              </span>
                            </div>
                            <div className="text-left space-y-1">
                              <div className="crt-blink text-sky-300 font-broadcast text-[11px] md:text-xs tracking-wider flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-ping inline-block" />
                                <span>DROP ZONE LOCKED</span>
                              </div>
                              <p className="font-studio text-sm md:text-base text-white tracking-wide font-bold">
                                {mode === 'guest'
                                  ? 'ENTER AS ANONYMOUS DEFENDANT'
                                  : mode === 'register'
                                    ? 'CREATE YOUR COURT DOCKET'
                                    : 'TRANSMIT STUDIO CREDENTIALS'}
                              </p>
                              <p className="font-studio text-xs text-sky-200/90">AI TASTE POLICE CLEARANCE REQUIRED</p>
                            </div>
                          </div>

                          {mode !== 'guest' && (
                            <div className="space-y-2 text-left mb-3">
                              <label className="block">
                                <span className="font-broadcast text-[9px] text-sky-300 tracking-wider">HANDLE</span>
                                <input
                                  className="login-input mt-1"
                                  autoComplete="username"
                                  placeholder="@NeonDrifter"
                                  value={handle}
                                  onChange={(e) => setHandle(e.target.value)}
                                />
                              </label>
                              <label className="block">
                                <span className="font-broadcast text-[9px] text-sky-300 tracking-wider">ACCESS CODE</span>
                                <input
                                  className="login-input mt-1"
                                  type="password"
                                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                                  placeholder="••••••••"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                />
                              </label>
                              {mode === 'register' && (
                                <label className="block">
                                  <span className="font-broadcast text-[9px] text-sky-300 tracking-wider">CONFIRM CODE</span>
                                  <input
                                    className="login-input mt-1"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                  />
                                </label>
                              )}
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={busy}
                            className="inline-flex items-center justify-center gap-2 w-full py-1.5 px-3 bg-sky-900/90 hover:bg-sky-800 border-2 border-sky-300 text-white font-broadcast text-[10px] md:text-xs tracking-wider shadow-[4px_4px_0_0_#dfd0bc] disabled:opacity-60"
                          >
                            <span className="text-sky-300 font-bold">▲</span>
                            <span>
                              {busy
                                ? '[ TUNING SIGNAL… ]'
                                : mode === 'guest'
                                  ? '[ ENTER AS GUEST ]'
                                  : mode === 'register'
                                    ? '[ FILE NEW DOCKET ]'
                                    : '[ INSERT ACCESS CODE ]'}
                            </span>
                          </button>
                        </div>
                      </form>

                      <div className="relative z-10 flex justify-between items-center text-[9px] md:text-[10px] font-broadcast text-sky-200/80 border-t border-sky-900/60 pt-1.5">
                        <span className="text-sky-300">SIGNAL: {busy ? '42.0%' : '99.8%'}</span>
                        <span className="truncate max-w-[220px] text-white">
                          {error ? error : 'CLEARANCE WAITING ON YOU...'}
                        </span>
                        <span className="text-sky-300">NTSC-U</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-3.5 pt-1.5 flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-broadcast text-[9px] tracking-wider text-[#524435] font-bold">B&amp;E CRT-3000</span>
                  <span className={`w-2 h-2 rounded-full inline-block ${tvOn ? 'bg-sky-400 shadow-[0_0_6px_#38bdf8]' : 'bg-red-500'}`} />
                </div>
                <div className="flex space-x-2 md:space-x-3 bg-[#cfbfa9] p-1.5 rounded-md border border-[#b8a791] shadow-inner">
                  <button
                    type="button"
                    className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-b from-[#fffbf4] to-[#ded1be] border border-[#a89682] rounded text-[9px] font-broadcast text-sky-700"
                    onClick={() => setTvOn((v) => !v)}
                    title="Power"
                  >
                    PWR
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-b from-[#fffbf4] to-[#ded1be] border border-[#a89682] rounded text-[9px] font-broadcast text-[#343026]"
                    onClick={cycleMode}
                    title="Channel up"
                  >
                    CH▲
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-b from-[#fffbf4] to-[#ded1be] border border-[#a89682] rounded text-[9px] font-broadcast text-[#343026]"
                    onClick={() => {
                      const order: AuthMode[] = ['signin', 'guest', 'register'];
                      const next = order[(order.indexOf(mode) + order.length - 1) % order.length];
                      setMode(next);
                    }}
                    title="Channel down"
                  >
                    CH▼
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-b from-[#fffbf4] to-[#ded1be] border border-[#a89682] rounded text-[8px] font-broadcast text-[#343026]"
                    onClick={() => setSoundOn((v) => !v)}
                    title="Mute"
                  >
                    MUTE
                  </button>
                </div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#8c7865] border-2 border-[#524435]" title="Phone out" />
              </div>
            </div>
          </section>

          <nav className="lg:col-span-3 order-3" aria-label="Login protocol menu">
            <ul className="space-y-2.5 sm:space-y-3">
              {MENU.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setMode(item.id);
                      setError(null);
                      if (item.id === 'guest') setHandle('');
                    }}
                    className={`w-full text-left arcade-login-btn p-2.5 group flex items-center gap-3 ${
                      mode === item.id ? 'active' : ''
                    }`}
                  >
                    <span className="font-broadcast text-xs text-sky-300 group-hover:text-white font-bold">{item.num}</span>
                    <div>
                      <h3 className="font-broadcast text-[11px] text-[#fcf2e3] tracking-wide group-hover:text-sky-200">
                        {item.title}
                      </h3>
                      <p className="font-studio text-sm text-[#d7c3af] group-hover:text-white leading-tight">{item.sub}</p>
                    </div>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => setHiRes((v) => !v)}
                  className="w-full text-left arcade-login-btn p-2.5 group flex items-center gap-3"
                >
                  <span className="font-broadcast text-xs text-sky-300 group-hover:text-white font-bold">04</span>
                  <div>
                    <h3 className="font-broadcast text-[11px] text-[#fcf2e3] tracking-wide group-hover:text-sky-200">
                      SETTINGS
                    </h3>
                    <p className="font-studio text-sm text-[#d7c3af] group-hover:text-white leading-tight">
                      SOUND, SCANLINES &amp; PRIVACY
                    </p>
                  </div>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('about')}
                  className="w-full text-left arcade-login-btn p-2.5 group flex items-center gap-3 cursor-pointer"
                >
                  <span className="font-broadcast text-xs text-sky-300 group-hover:text-white font-bold">05</span>
                  <div>
                    <h3 className="font-broadcast text-[11px] text-[#fcf2e3] tracking-wide group-hover:text-sky-200">
                      ABOUT STYLU
                    </h3>
                    <p className="font-studio text-sm text-[#d7c3af] group-hover:text-white leading-tight">
                      APP MISSION &amp; AI TRIBUNAL
                    </p>
                  </div>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('contact')}
                  className="w-full text-left arcade-login-btn p-2.5 group flex items-center gap-3 cursor-pointer"
                >
                  <span className="font-broadcast text-xs text-sky-300 group-hover:text-white font-bold">06</span>
                  <div>
                    <h3 className="font-broadcast text-[11px] text-[#fcf2e3] tracking-wide group-hover:text-sky-200">
                      CONTACT US
                    </h3>
                    <p className="font-studio text-sm text-[#d7c3af] group-hover:text-white leading-tight">
                      8248049524 // 12KISHORE47
                    </p>
                  </div>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </main>

      {/* About Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-[#28221b] border-2 border-[#dfd0bc] p-5 md:p-6 shadow-[8px_8px_0px_#dfd0bc] text-slate-100 font-studio space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#dfd0bc]/40 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-ping" />
                <h3 className="font-broadcast text-xs sm:text-sm text-white tracking-wider">
                  SYSTEM INTEL // <span className="text-sky-300">ABOUT STYLU</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-2.5 py-1 bg-[#1a1510] hover:bg-[#342b21] border border-[#dfd0bc] text-sky-300 font-broadcast text-xs tracking-wider transition-colors cursor-pointer"
              >
                [ESC ✕]
              </button>
            </div>

            <div className="p-3 bg-gradient-to-r from-sky-950/80 via-[#28221b] to-sky-950/80 border border-sky-400/60 text-center rounded">
              <div className="font-broadcast text-xs sm:text-sm text-sky-300 tracking-widest drop-shadow-[0_0_10px_#38bdf8]">
                “Style you with stylu”
              </div>
              <span className="text-[10px] text-[#dfd0bc]/70 font-broadcast tracking-wide mt-1 block">
                YOUR PERSONAL AI DRIP TRIBUNAL
              </span>
            </div>

            <div className="bg-[#1a1510] border border-[#dfd0bc]/50 p-4 space-y-3 text-xs">
              <p className="text-white leading-relaxed font-studio text-[13px]">
                <strong className="text-sky-300 font-broadcast text-[11px]">STYLU</strong> is a retro arcade fashion courtroom that turns everyday dressing into a playful, interactive experience. Submit your outfit selfie to face an iconic bench of AI judges with sharp eyes and legendary personalities.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 bg-[#241e17] border border-[#dfd0bc]/30">
                  <div className="font-broadcast text-[10px] text-sky-300 flex items-center gap-1.5 mb-1">
                    <span>⚖️</span> 5-TIER DRIP SCALE
                  </div>
                  <p className="text-[#d7c3af] text-[11px] leading-tight">
                    Clear, instant verdicts: Fabulous, Nice, Good, Ok, or Guilty.
                  </p>
                </div>
                <div className="p-2.5 bg-[#241e17] border border-[#dfd0bc]/30">
                  <div className="font-broadcast text-[10px] text-sky-300 flex items-center gap-1.5 mb-1">
                    <span>🎰</span> 7-DAY DRESSCODE WHEEL
                  </div>
                  <p className="text-[#d7c3af] text-[11px] leading-tight">
                    Spin the Lucky Wheel Oracle to generate fresh aesthetic missions for the week.
                  </p>
                </div>
                <div className="p-2.5 bg-[#241e17] border border-[#dfd0bc]/30">
                  <div className="font-broadcast text-[10px] text-sky-300 flex items-center gap-1.5 mb-1">
                    <span>📺</span> RETRO CRT EXPERIENCE
                  </div>
                  <p className="text-[#d7c3af] text-[11px] leading-tight">
                    Scanlines, 8-bit sound effects, character TV controls, and instant appeals.
                  </p>
                </div>
                <div className="p-2.5 bg-[#241e17] border border-[#dfd0bc]/30">
                  <div className="font-broadcast text-[10px] text-sky-300 flex items-center gap-1.5 mb-1">
                    <span>💡</span> WARDROBE ADVICE
                  </div>
                  <p className="text-[#d7c3af] text-[11px] leading-tight">
                    Tailored fashion critiques and actionable tips to level up your fits.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#dfd0bc]/30 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[10px] font-broadcast text-[#dfd0bc]/80">VERSION 9.4 // STYLU ENGINE</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('contact')}
                  className="px-3 py-1.5 bg-[#1a1510] hover:bg-sky-950 border border-sky-400 text-sky-200 font-broadcast text-[10px] tracking-wider transition-colors cursor-pointer"
                >
                  📞 CONTACT CREATOR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {activeModal === 'contact' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-[#28221b] border-2 border-[#dfd0bc] p-5 md:p-6 shadow-[8px_8px_0px_#dfd0bc] text-slate-100 font-studio space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#dfd0bc]/40 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                <h3 className="font-broadcast text-xs sm:text-sm text-white tracking-wider">
                  COMMUNICATIONS BEACON // <span className="text-sky-300">CONTACT US</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-2.5 py-1 bg-[#1a1510] hover:bg-[#342b21] border border-[#dfd0bc] text-sky-300 font-broadcast text-xs tracking-wider transition-colors cursor-pointer"
              >
                [ESC ✕]
              </button>
            </div>

            <div className="p-2.5 bg-[#1a1510] border border-[#dfd0bc]/40 text-center">
              <span className="font-broadcast text-[11px] text-sky-300 tracking-wider">“Style you with stylu”</span>
              <p className="text-[10px] text-[#dfd0bc]/80 font-studio mt-0.5">
                Reach out directly for support, collaborations, or styling queries!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone / WhatsApp Card */}
              <div className="bg-[#1a1510] border border-[#dfd0bc]/50 p-3.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">📱</span>
                    <span className="font-broadcast text-[10px] text-sky-300 font-bold">PHONE &amp; WHATSAPP</span>
                  </div>
                  <div className="font-broadcast text-xs text-white tracking-wider mt-1.5 select-all font-bold">
                    8248049524
                  </div>
                  <p className="text-[10px] text-[#d7c3af] font-studio mt-0.5">Direct line &amp; WhatsApp</p>
                </div>
                <div className="flex flex-col gap-1.5 pt-2 border-t border-[#dfd0bc]/20">
                  <a
                    href="tel:8248049524"
                    className="px-2.5 py-1.5 bg-[#241e17] hover:bg-sky-950 border border-sky-400 text-sky-200 font-broadcast text-[9px] tracking-wider text-center transition-colors"
                  >
                    📞 CALL: 8248049524
                  </a>
                  <a
                    href="https://wa.me/918248049524"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400 text-emerald-200 font-broadcast text-[9px] tracking-wider text-center transition-colors"
                  >
                    💬 WHATSAPP CHAT
                  </a>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-[#1a1510] border border-[#dfd0bc]/50 p-3.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">✉️</span>
                    <span className="font-broadcast text-[10px] text-sky-300 font-bold">EMAIL INBOX</span>
                  </div>
                  <div className="font-broadcast text-[10px] sm:text-[11px] text-white tracking-wider mt-1.5 select-all break-all font-bold">
                    12kishore47@gmail.com
                  </div>
                  <p className="text-[10px] text-[#d7c3af] font-studio mt-0.5">Inbox &amp; feature requests</p>
                </div>
                <div className="flex flex-col gap-1.5 pt-2 border-t border-[#dfd0bc]/20">
                  <a
                    href="mailto:12kishore47@gmail.com"
                    className="px-2.5 py-1.5 bg-[#241e17] hover:bg-sky-950 border border-sky-400 text-sky-200 font-broadcast text-[9px] tracking-wider text-center transition-colors"
                  >
                    ✉️ SEND EMAIL
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#dfd0bc]/30 flex justify-between items-center text-[10px] font-broadcast text-[#dfd0bc]/80">
              <span>LINE STATUS: ACTIVE &amp; SECURE</span>
              <span className="text-sky-300">KISHORE // STYLU ARCHITECT</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
