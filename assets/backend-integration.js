// StylU Backend API Integration
// Connects Lucky Wheel and settings to backend endpoints

(function() {
  'use strict';

  const API_BASE = window.location.origin + '/api';
  let currentWeekPlan = null;

  // ============================================
  // API WRAPPER
  // ============================================
  async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...options.headers };
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    } else {
      delete headers['Content-Type'];
    }

    const config = {
      credentials: 'include', // Send cookies for session
      headers,
      ...options
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      showError(formatError(error));
      throw error;
    }
  }

  function formatError(error) {
    if (error.message.includes('Failed to fetch')) {
      return 'CONNECTION ERROR // SERVER OFFLINE';
    }
    if (error.message.includes('rate limit')) {
      return 'RATE LIMIT EXCEEDED // SLOW DOWN';
    }
    return `ERROR: ${error.message.toUpperCase()}`;
  }

  function showError(message) {
    const ticker = document.querySelector('[data-purpose="bottom-ticker"] .max-w-7xl');
    if (ticker) {
      const originalHTML = ticker.innerHTML;
      ticker.innerHTML = `
        <div class="flex items-center space-x-2">
          <span class="inline-block w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          <span class="text-red-400 font-pixel text-[9px] font-bold">${message}</span>
        </div>
      `;
      setTimeout(() => { ticker.innerHTML = originalHTML; }, 5000);
    }
  }

  // ============================================
  // GET CURRENT DAY OF WEEK
  // ============================================
  function getCurrentDayIndex() {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday
    return day === 0 ? 6 : day - 1; // Convert to MON=0, SUN=6
  }

  function getDayName(index) {
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    return days[index];
  }

  // ============================================
  // LOAD WEEK PLAN FROM SERVER
  // ============================================
  async function loadWeekPlan() {
    try {
      const data = await apiRequest('/wheel/week-plan');
      currentWeekPlan = data.plan;

      // Update all 7 day cards
      const dayCards = document.querySelectorAll('.day-card');
      data.plan.forEach((dayPlan, index) => {
        const card = dayCards[index];
        const dc = dayPlan.dresscode;

        if (card && dc) {
          card.querySelector('.day-name').textContent = dc.title;
          card.querySelector('.day-items').textContent = dc.items;
          card.querySelector('.day-score').textContent = dc.score;
          card.querySelector('.day-bar').style.width = dc.score;
          card.querySelector('.day-status').textContent = dc.status;
        }
      });

      // Update current day display
      const todayIndex = getCurrentDayIndex();
      const todayDresscode = data.plan[todayIndex].dresscode;
      const todayBadge = document.getElementById('badge-current-day');
      if (todayBadge) {
        todayBadge.textContent = `${getDayName(todayIndex)} (TODAY)`;
      }

      // Update oracle readout with today's dresscode
      document.getElementById('oracle-code-title').textContent =
        `${getDayName(todayIndex)} // ${todayDresscode.title}`;
      document.getElementById('oracle-day-slot').textContent =
        `ASSIGNED TO: ${todayDresscode.fullName}`;
      document.getElementById('oracle-code-desc').textContent = todayDresscode.desc;
      document.getElementById('oracle-score-tag').textContent = `DRIP: ${todayDresscode.score}`;
      document.getElementById('oracle-rule').textContent = todayDresscode.rule;
      document.getElementById('oracle-crime').textContent = todayDresscode.crime;

      console.log('✓ Week plan loaded from server');
    } catch (error) {
      console.error('Failed to load week plan:', error);
    }
  }

  // ============================================
  // WHEEL SPIN WITH SERVER
  // ============================================
  const wheelTurntable = document.getElementById('wheel-turntable');
  const spinTodayBtn = document.getElementById('btn-spin-today');
  const spinCenterBtn = document.getElementById('wheel-center-spin-btn');
  const autoWeekBtn = document.getElementById('btn-auto-week');
  const dayCards = document.querySelectorAll('.day-card');

  let currentRotation = 0;
  let isSpinning = false;
  let targetDayIndex = getCurrentDayIndex();

  // Web Audio for retro beeps
  let audioCtx = null;
  const audioStatus = document.getElementById('audio-status');

  function playRetroBeep(freq = 440, type = 'square', duration = 0.05) {
    if (audioStatus && audioStatus.textContent.trim() === 'MUTED') return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (err) {
      // AudioContext restricted before first gesture
    }
  }

  async function spinToSegment(segmentIndex, daySlotIndex) {
    if (isSpinning) return;
    isSpinning = true;

    // Call backend API
    try {
      const result = await apiRequest('/wheel/spin', {
        method: 'POST',
        body: JSON.stringify({ day_index: daySlotIndex })
      });

      // Use server's segment_index for animation
      const serverSegmentIndex = result.segment_index;
      const dresscode = result.dresscode;

      // Animate wheel rotation
      const sliceSize = 360 / 7;
      const targetCenterAngle = (serverSegmentIndex * sliceSize) + (sliceSize / 2);
      const fullRotations = 360 * 6;
      const currentRemainder = currentRotation % 360;
      let desiredAngle = (360 - targetCenterAngle) % 360;
      let additional = desiredAngle - currentRemainder;
      if (additional <= 0) additional += 360;

      currentRotation += fullRotations + additional;
      wheelTurntable.style.transform = `rotate(${currentRotation}deg)`;

      // Play rapid slot ticks during spin
      let ticks = 0;
      const tickInterval = setInterval(() => {
        ticks++;
        playRetroBeep(450 + (ticks % 7) * 40, 'square', 0.03);
        if (ticks > 24) clearInterval(tickInterval);
      }, 150);

      // Apply outcome after animation
      setTimeout(() => {
        isSpinning = false;
        playRetroBeep(880, 'sine', 0.18);
        applyOutcome(dresscode, daySlotIndex);
      }, 4200);

    } catch (error) {
      isSpinning = false;
      console.error('Spin failed:', error);
    }
  }

  function applyOutcome(dresscode, dayIndex) {
    const dayName = getDayName(dayIndex);

    // Update oracle readout
    document.getElementById('oracle-code-title').textContent =
      `${dayName} // ${dresscode.title}`;
    document.getElementById('oracle-day-slot').textContent =
      `ASSIGNED TO: ${dresscode.fullName}`;
    document.getElementById('oracle-code-desc').textContent = dresscode.desc;
    document.getElementById('oracle-score-tag').textContent = `DRIP: ${dresscode.score}`;
    document.getElementById('oracle-rule').textContent = dresscode.rule;
    document.getElementById('oracle-crime').textContent = dresscode.crime;

    const verdictBox = document.getElementById('oracle-verdict-box');
    verdictBox.classList.remove('slot-tick');
    void verdictBox.offsetWidth;
    verdictBox.classList.add('slot-tick');

    // Update day card
    const card = dayCards[dayIndex];
    if (card) {
      card.querySelector('.day-name').textContent = dresscode.title;
      card.querySelector('.day-items').textContent = dresscode.items;
      card.querySelector('.day-score').textContent = dresscode.score;
      card.querySelector('.day-bar').style.width = dresscode.score;
      card.querySelector('.day-status').textContent = dresscode.status;

      card.classList.remove('slot-tick');
      void card.offsetWidth;
      card.classList.add('slot-tick');
    }

    // Trigger celebratory pop-up blast
    triggerWheelBlast(dresscode, dayIndex);
  }

  // ============================================
  // CELEBRATORY WHEEL POP-UP BLAST & PARTICLES
  // ============================================
  function spawnParticleBlast(originX, originY) {
    const colors = ['#38bdf8', '#f59e0b', '#ec4899', '#10b981', '#fcf2e3', '#60a5fa', '#fde047', '#a855f7'];
    const symbols = ['★', '◆', '✦', '▲', '●', '■', '⚡'];

    const container = document.createElement('div');
    container.className = 'fixed inset-0 pointer-events-none z-[60] overflow-hidden';
    document.body.appendChild(container);

    const particleCount = 70;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 260 + 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const size = Math.floor(Math.random() * 14) + 12;

      p.textContent = symbol;
      p.style.position = 'absolute';
      p.style.left = `${originX}px`;
      p.style.top = `${originY}px`;
      p.style.color = color;
      p.style.fontSize = `${size}px`;
      p.style.fontWeight = 'bold';
      p.style.textShadow = `0 0 10px ${color}`;
      p.style.fontFamily = "'Press Start 2P', monospace";
      p.style.userSelect = 'none';
      p.style.transition = 'transform 1.3s cubic-bezier(0.12, 0.95, 0.2, 1), opacity 1.3s ease-out';
      p.style.transform = 'translate(-50%, -50%) scale(0.4)';
      p.style.opacity = '1';

      container.appendChild(p);

      const destX = Math.cos(angle) * speed;
      const destY = Math.sin(angle) * speed + 60;
      const rotate = Math.floor(Math.random() * 720) - 360;

      requestAnimationFrame(() => {
        p.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) rotate(${rotate}deg) scale(${Math.random() * 0.9 + 0.8})`;
        p.style.opacity = '0';
      });
    }

    setTimeout(() => container.remove(), 1500);
  }

  function playCelebratoryFanfare() {
    playRetroBeep(523, 'triangle', 0.12);
    setTimeout(() => playRetroBeep(659, 'triangle', 0.12), 110);
    setTimeout(() => playRetroBeep(784, 'triangle', 0.14), 220);
    setTimeout(() => playRetroBeep(1046, 'sine', 0.35), 330);
  }

  function triggerWheelBlast(dresscode, dayIndex) {
    const dayName = getDayName(dayIndex);
    playCelebratoryFanfare();

    // Wheel center coordinates for particle blast origin
    const wheelElement = document.getElementById('wheel-turntable') || document.getElementById('wheel-center-spin-btn');
    const rect = wheelElement ? wheelElement.getBoundingClientRect() : null;
    const originX = rect ? (rect.left + rect.width / 2) : (window.innerWidth / 2);
    const originY = rect ? (rect.top + rect.height / 2) : (window.innerHeight / 2);

    spawnParticleBlast(originX, originY);

    // Remove existing blast popup if any
    const existing = document.getElementById('wheel-blast-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'wheel-blast-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="relative w-full max-w-lg bg-[#241e17] border-4 border-amber-300 p-5 md:p-6 shadow-[10px_10px_0px_#38bdf8] text-slate-100 font-terminal text-center space-y-3">
        <!-- Blast Banner Header -->
        <div class="flex items-center justify-center space-x-2 text-amber-300 font-pixel text-xs tracking-wider animate-bounce">
          <span>★</span>
          <span>JACKPOT // DRESS CODE UNLOCKED!</span>
          <span>★</span>
        </div>

        <!-- Assigned Day Tag -->
        <div>
          <span class="inline-block px-3 py-1 bg-[#17130e] border border-sky-400 text-sky-300 font-pixel text-[10px] tracking-wider">
            ASSIGNED TO: ${dayName} (${dresscode.fullName})
          </span>
        </div>

        <!-- Big Bold Aesthetic Title -->
        <h2 class="font-pixel text-base sm:text-xl text-white uppercase tracking-widest drop-shadow-[0_0_15px_#38bdf8] mt-1">
          ${dresscode.title}
        </h2>

        <!-- Drip score badge -->
        <div>
          <span class="inline-block px-3.5 py-1 bg-emerald-950 border-2 border-emerald-400 text-emerald-300 font-pixel text-xs tracking-wider shadow-[0_0_12px_#10b981]">
            DRIP SCORE: ${dresscode.score}
          </span>
        </div>

        <!-- Description -->
        <p class="font-terminal text-sm sm:text-base text-[#f5ece1] bg-[#17130e]/95 p-3 border border-[#8c7865] leading-snug">
          ${dresscode.desc}
        </p>

        <!-- Rules breakdown -->
        <div class="grid grid-cols-2 gap-2 text-left font-terminal text-xs">
          <div class="bg-[#17130e] p-2 border border-sky-500/50">
            <span class="text-sky-300 font-pixel text-[8px] block mb-0.5">STYLE TIP:</span>
            <span class="text-slate-200 leading-tight">${dresscode.rule}</span>
          </div>
          <div class="bg-[#17130e] p-2 border border-amber-500/50">
            <span class="text-amber-300 font-pixel text-[8px] block mb-0.5">FASHION CRIME:</span>
            <span class="text-slate-200 leading-tight">${dresscode.crime}</span>
          </div>
        </div>

        <!-- Action Button -->
        <div class="pt-2 flex items-center space-x-3">
          <button id="btn-blast-close" class="w-full py-2.5 px-3 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 border-2 border-white text-white font-pixel text-xs tracking-wider shadow-pixel-btn active:translate-y-0.5 transition-all cursor-pointer">
            ⚡ [ LOCK IN THIS FIT ]
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#btn-blast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        playRetroBeep(440, 'square', 0.05);
        modal.remove();
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  window.triggerWheelBlast = triggerWheelBlast;

  // ============================================
  // BUTTON HANDLERS
  // ============================================

  // Spin for today
  spinTodayBtn.addEventListener('click', () => {
    const todayIndex = getCurrentDayIndex();
    targetDayIndex = todayIndex;
    spinToSegment(0, todayIndex); // segment doesn't matter, server decides
  });

  // Spin hub button
  spinCenterBtn.addEventListener('click', () => {
    spinToSegment(0, targetDayIndex);
  });

  // Auto-generate full week
  autoWeekBtn.addEventListener('click', async () => {
    if (isSpinning) return;
    playRetroBeep(520, 'square', 0.1);

    try {
      const result = await apiRequest('/wheel/auto-week', { method: 'POST' });

      // Animate all cards with stagger
      result.plan.forEach((dayPlan, idx) => {
        setTimeout(() => {
          const card = dayCards[idx];
          const dc = dayPlan.dresscode;

          if (card && dc) {
            card.querySelector('.day-name').textContent = dc.title;
            card.querySelector('.day-items').textContent = dc.items;
            card.querySelector('.day-score').textContent = dc.score;
            card.querySelector('.day-bar').style.width = dc.score;
            card.querySelector('.day-status').textContent = dc.status;

            card.classList.remove('slot-tick');
            void card.offsetWidth;
            card.classList.add('slot-tick');
            playRetroBeep(320 + idx * 75, 'sine', 0.06);
          }

          // Update oracle for current day
          const todayIndex = getCurrentDayIndex();
          if (idx === todayIndex) {
            document.getElementById('oracle-code-title').textContent =
              `${getDayName(idx)} // ${dc.title}`;
            document.getElementById('oracle-day-slot').textContent =
              `ASSIGNED TO: ${dc.fullName}`;
            document.getElementById('oracle-code-desc').textContent = dc.desc;
            document.getElementById('oracle-score-tag').textContent = `DRIP: ${dc.score}`;
            document.getElementById('oracle-rule').textContent = dc.rule;
            document.getElementById('oracle-crime').textContent = dc.crime;
          }
        }, idx * 160);
      });
    } catch (error) {
      console.error('Auto-week failed:', error);
    }
  });

  // Day card click - spin for that specific day
  dayCards.forEach((card) => {
    card.addEventListener('click', () => {
      if (isSpinning) return;
      const dayIdx = parseInt(card.getAttribute('data-day-index'), 10);
      targetDayIndex = dayIdx;
      spinToSegment(0, dayIdx);
    });
  });

  // ============================================
  // SETTINGS STATE & PERSISTENCE
  // ============================================
  const audioToggle = document.getElementById('audio-toggle');
  const audioStatusEl = document.getElementById('audio-status');
  const scanlineToggle = document.getElementById('scanline-toggle');
  const scanlineStatusEl = document.getElementById('scanline-status');

  let activeSettings = {
    sound: 'ON',
    crt: 'HI-RES',
    share_verdicts: false,
    show_on_leaderboard: true
  };

  function applySettingsToUI(settings) {
    if (!settings) return;
    activeSettings = { ...activeSettings, ...settings };

    // Update audio UI
    if (audioStatusEl) {
      audioStatusEl.textContent = activeSettings.sound;
      audioStatusEl.className = activeSettings.sound === 'ON' ? 'text-sky-300 font-bold' : 'text-red-400 font-bold';
    }

    // Update scanlines UI
    if (scanlineStatusEl) {
      scanlineStatusEl.textContent = activeSettings.crt;
      scanlineStatusEl.className = activeSettings.crt === 'HI-RES' ? 'text-sky-200 font-bold' : 'text-amber-300 font-bold';
    }

    const overlay = document.querySelector('.scanlines-overlay');
    if (overlay) {
      overlay.style.opacity = activeSettings.crt === 'HI-RES' ? '0.2' : '0.85';
      if (activeSettings.crt === 'ANALOG') {
        overlay.classList.add('crt-flicker');
      } else {
        overlay.classList.remove('crt-flicker');
      }
    }
  }

  async function loadSettings() {
    try {
      const data = await apiRequest('/settings');
      if (data && data.settings) {
        applySettingsToUI(data.settings);
        console.log('✓ System settings synchronized:', data.settings);
      }
    } catch (error) {
      console.warn('Using default local settings:', error);
      applySettingsToUI(activeSettings);
    }
  }

  async function updateSettingField(key, value) {
    activeSettings[key] = value;
    applySettingsToUI(activeSettings);

    try {
      await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({ [key]: value })
      });
      console.log(`✓ Setting updated: ${key} = ${value}`);
    } catch (err) {
      console.error('Failed to persist setting:', err);
    }
  }

  // Audio toggle button in top broadcast bar
  if (audioToggle) {
    audioToggle.addEventListener('click', async () => {
      const nextSound = activeSettings.sound === 'ON' ? 'MUTED' : 'ON';
      if (nextSound === 'ON') {
        playRetroBeep(700, 'sine', 0.08);
      }
      await updateSettingField('sound', nextSound);
    });
  }

  // Scanline toggle button in top broadcast bar
  if (scanlineToggle) {
    scanlineToggle.addEventListener('click', async () => {
      const nextCrt = activeSettings.crt === 'HI-RES' ? 'ANALOG' : 'HI-RES';
      playRetroBeep(nextCrt === 'ANALOG' ? 240 : 880, 'square', 0.06);
      await updateSettingField('crt', nextCrt);
    });
  }

  async function openSettingsModal() {
    playRetroBeep(480, 'sine', 0.08);

    const existing = document.getElementById('settings-modal');
    if (existing) existing.remove();

    const getJudgeName = () => (typeof JUDGES !== 'undefined' && JUDGES[currentJudgeIdx])
      ? JUDGES[currentJudgeIdx].name
      : 'STRICT AUNTIE';

    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="relative w-full max-w-lg bg-[#28221b] border-2 border-[#dfd0bc] p-5 md:p-6 shadow-[8px_8px_0px_#dfd0bc] text-slate-100 font-terminal space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[#dfd0bc]/40 pb-3">
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 bg-sky-400 rounded-full animate-ping"></span>
            <h3 class="font-pixel text-xs sm:text-sm text-white tracking-wider">
              SYSTEM CONFIG // <span class="text-sky-300">AUDIO &amp; CRT HARDWARE</span>
            </h3>
          </div>
          <button id="btn-close-settings" class="px-2.5 py-1 bg-[#1a1510] hover:bg-[#342b21] border border-[#dfd0bc] text-sky-300 font-pixel text-xs tracking-wider transition-colors cursor-pointer">
            [ESC ✕]
          </button>
        </div>

        <!-- Controls List -->
        <div class="space-y-3.5 text-xs">
          <!-- Sound Setting -->
          <div class="bg-[#1a1510] border border-[#dfd0bc]/50 p-3 flex items-center justify-between">
            <div>
              <span class="font-pixel text-[11px] text-white block">AUDIO OUTPUT &amp; FX:</span>
              <span class="text-[#d7c3af] text-[11px] font-terminal">Retro 8-bit beeps, TV tuner clicks &amp; fanfares</span>
            </div>
            <button id="modal-toggle-sound" class="px-3 py-1.5 font-pixel text-[10px] tracking-wider border-2 transition-all cursor-pointer ${activeSettings.sound === 'ON' ? 'bg-sky-900 border-sky-400 text-sky-200' : 'bg-red-950 border-red-500 text-red-300'}">
              ${activeSettings.sound === 'ON' ? '🔊 [ SOUND: ON ]' : '🔇 [ MUTED ]'}
            </button>
          </div>

          <!-- Scanline Setting -->
          <div class="bg-[#1a1510] border border-[#dfd0bc]/50 p-3 flex items-center justify-between">
            <div>
              <span class="font-pixel text-[11px] text-white block">CRT SCANLINE EMULATION:</span>
              <span class="text-[#d7c3af] text-[11px] font-terminal">Toggle phosphor scanlines &amp; analog flicker</span>
            </div>
            <button id="modal-toggle-crt" class="px-3 py-1.5 font-pixel text-[10px] tracking-wider border-2 transition-all cursor-pointer ${activeSettings.crt === 'HI-RES' ? 'bg-sky-900 border-sky-400 text-sky-200' : 'bg-amber-950 border-amber-400 text-amber-200'}">
              ${activeSettings.crt === 'HI-RES' ? '📺 [ HI-RES ]' : '📼 [ ANALOG CRT ]'}
            </button>
          </div>

          <!-- Active AI Judge Preset with Cycle Controls -->
          <div class="bg-[#1a1510] border border-[#dfd0bc]/50 p-3 flex items-center justify-between">
            <div>
              <span class="font-pixel text-[11px] text-white block">ACTIVE JUDGE BENCH:</span>
              <span class="text-[#d7c3af] text-[11px] font-terminal">Tune active magistrate criticizing fits</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <button id="modal-prev-judge" class="px-2 py-1 bg-[#28221b] hover:bg-[#342b21] border border-sky-400/70 text-sky-300 font-pixel text-[10px] cursor-pointer" title="Previous Judge">◀</button>
              <span class="font-pixel text-[10px] text-sky-200 bg-black/70 px-2 py-1 border border-sky-400/60 min-w-[130px] text-center truncate" id="modal-current-judge">
                ${getJudgeName()}
              </span>
              <button id="modal-next-judge" class="px-2 py-1 bg-[#28221b] hover:bg-[#342b21] border border-sky-400/70 text-sky-300 font-pixel text-[10px] cursor-pointer" title="Next Judge">▶</button>
            </div>
          </div>

          <!-- Privacy & Sharing -->
          <div class="bg-[#1a1510] border border-[#dfd0bc]/50 p-3 flex items-center justify-between">
            <div>
              <span class="font-pixel text-[11px] text-white block">PUBLIC LEADERBOARD:</span>
              <span class="text-[#d7c3af] text-[11px] font-terminal">Allow top drip scores on arcade board</span>
            </div>
            <button id="modal-toggle-privacy" class="px-3 py-1.5 font-pixel text-[10px] tracking-wider border-2 transition-all cursor-pointer ${activeSettings.show_on_leaderboard ? 'bg-emerald-950 border-emerald-400 text-emerald-300' : 'bg-[#28221b] border-[#dfd0bc] text-slate-400'}">
              ${activeSettings.show_on_leaderboard ? '✓ [ VISIBLE ]' : '✗ [ PRIVATE ]'}
            </button>
          </div>

          <!-- Docket Purge Option -->
          <div class="bg-[#1a1510] border border-red-950/80 p-3 flex items-center justify-between">
            <div>
              <span class="font-pixel text-[11px] text-red-300 block">LOCAL DOCKET CACHE:</span>
              <span class="text-[#d7c3af] text-[11px] font-terminal">Purge case history &amp; reset courtroom records</span>
            </div>
            <button id="modal-purge-docket" class="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500 text-red-200 font-pixel text-[9px] tracking-wider transition-all cursor-pointer">
              🗑️ [ CLEAR CASES ]
            </button>
          </div>
        </div>

        <!-- Status Confirmation Banner -->
        <div id="settings-status-msg" class="py-1 text-center font-pixel text-[10px] text-emerald-400 opacity-0 transition-opacity">
          ✓ CONFIG SAVED TO LOCAL SYSTEM MEMORY
        </div>

        <!-- Footer Action -->
        <div class="pt-2 border-t border-[#dfd0bc]/30 flex items-center justify-between">
          <span class="text-[9px] font-pixel text-[#dfd0bc]/60">FIRMWARE V4.2 // READY</span>
          <button id="btn-save-settings" class="py-2 px-5 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 border-2 border-white text-white font-pixel text-xs tracking-wider shadow-pixel-btn active:translate-y-0.5 transition-all cursor-pointer">
            [ APPLY &amp; CLOSE ]
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    function flashSaved(text) {
      const msg = modal.querySelector('#settings-status-msg');
      if (msg) {
        if (text) msg.textContent = text;
        msg.classList.remove('opacity-0');
        setTimeout(() => msg.classList.add('opacity-0'), 1500);
      }
    }

    // Modal Sound Toggle
    const soundBtn = modal.querySelector('#modal-toggle-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', async () => {
        const nextSound = activeSettings.sound === 'ON' ? 'MUTED' : 'ON';
        if (nextSound === 'ON') playRetroBeep(750, 'sine', 0.08);

        soundBtn.textContent = nextSound === 'ON' ? '🔊 [ SOUND: ON ]' : '🔇 [ MUTED ]';
        soundBtn.className = `px-3 py-1.5 font-pixel text-[10px] tracking-wider border-2 transition-all cursor-pointer ${nextSound === 'ON' ? 'bg-sky-900 border-sky-400 text-sky-200' : 'bg-red-950 border-red-500 text-red-300'}`;

        await updateSettingField('sound', nextSound);
        flashSaved('✓ AUDIO SETTING SAVED');
      });
    }

    // Modal CRT Toggle
    const crtBtn = modal.querySelector('#modal-toggle-crt');
    if (crtBtn) {
      crtBtn.addEventListener('click', async () => {
        const nextCrt = activeSettings.crt === 'HI-RES' ? 'ANALOG' : 'HI-RES';
        playRetroBeep(nextCrt === 'ANALOG' ? 240 : 880, 'square', 0.06);

        crtBtn.textContent = nextCrt === 'HI-RES' ? '📺 [ HI-RES ]' : '📼 [ ANALOG CRT ]';
        crtBtn.className = `px-3 py-1.5 font-pixel text-[10px] tracking-wider border-2 transition-all cursor-pointer ${nextCrt === 'HI-RES' ? 'bg-sky-900 border-sky-400 text-sky-200' : 'bg-amber-950 border-amber-400 text-amber-200'}`;

        await updateSettingField('crt', nextCrt);
        flashSaved('✓ CRT HARDWARE SAVED');
      });
    }

    // Modal Judge Tuning
    const prevJudgeBtn = modal.querySelector('#modal-prev-judge');
    const nextJudgeBtn = modal.querySelector('#modal-next-judge');
    const judgeDisplay = modal.querySelector('#modal-current-judge');

    if (prevJudgeBtn) {
      prevJudgeBtn.addEventListener('click', () => {
        if (typeof updateJudgeChannel === 'function') {
          updateJudgeChannel(currentJudgeIdx - 1);
          if (judgeDisplay) judgeDisplay.textContent = getJudgeName();
          flashSaved('✓ TUNED TO ' + getJudgeName());
        }
      });
    }

    if (nextJudgeBtn) {
      nextJudgeBtn.addEventListener('click', () => {
        if (typeof updateJudgeChannel === 'function') {
          updateJudgeChannel(currentJudgeIdx + 1);
          if (judgeDisplay) judgeDisplay.textContent = getJudgeName();
          flashSaved('✓ TUNED TO ' + getJudgeName());
        }
      });
    }

    // Modal Privacy Toggle
    const privBtn = modal.querySelector('#modal-toggle-privacy');
    if (privBtn) {
      privBtn.addEventListener('click', async () => {
        const nextVal = !activeSettings.show_on_leaderboard;
        playRetroBeep(520, 'square', 0.04);

        privBtn.textContent = nextVal ? '✓ [ VISIBLE ]' : '✗ [ PRIVATE ]';
        privBtn.className = `px-3 py-1.5 font-pixel text-[10px] tracking-wider border-2 transition-all cursor-pointer ${nextVal ? 'bg-emerald-950 border-emerald-400 text-emerald-300' : 'bg-[#28221b] border-[#dfd0bc] text-slate-400'}`;

        await updateSettingField('show_on_leaderboard', nextVal);
        flashSaved('✓ PRIVACY SETTING SAVED');
      });
    }

    // Purge Docket handler
    const purgeBtn = modal.querySelector('#modal-purge-docket');
    if (purgeBtn) {
      purgeBtn.addEventListener('click', () => {
        if (confirm('Clear local courtroom cache and past evidence records?')) {
          playRetroBeep(300, 'sawtooth', 0.15);
          localStorage.removeItem('outfit_court_cases');
          localStorage.removeItem('ai_photo_consent');
          flashSaved('✓ DOCKET CACHE PURGED');
        }
      });
    }

    // Close buttons & ESC handler
    const closeModal = () => {
      playRetroBeep(320, 'square', 0.04);
      modal.remove();
      window.removeEventListener('keydown', handleEsc);
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);

    const closeBtn = modal.querySelector('#btn-close-settings');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const saveBtn = modal.querySelector('#btn-save-settings');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        playRetroBeep(880, 'sine', 0.1);
        closeModal();
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Expose globally so all buttons and UI triggers can invoke settings modal
  window.openSettingsModal = openSettingsModal;

  // ============================================
  // ABOUT STYLU MODAL
  // ============================================
  function openAboutModal() {
    playRetroBeep(520, 'sine', 0.08);

    const existing = document.getElementById('about-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'about-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="relative w-full max-w-xl bg-[#28221b] border-2 border-[#dfd0bc] p-5 md:p-6 shadow-[8px_8px_0px_#dfd0bc] text-slate-100 font-terminal space-y-4 max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[#dfd0bc]/40 pb-3">
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 bg-sky-400 rounded-full animate-ping"></span>
            <h3 class="font-pixel text-xs sm:text-sm text-white tracking-wider">
              SYSTEM INTEL // <span class="text-sky-300">ABOUT STYLU</span>
            </h3>
          </div>
          <button id="btn-close-about" class="px-2.5 py-1 bg-[#1a1510] hover:bg-[#342b21] border border-[#dfd0bc] text-sky-300 font-pixel text-xs tracking-wider transition-colors cursor-pointer">
            [ESC ✕]
          </button>
        </div>

        <!-- Tagline Quote Banner -->
        <div class="p-3 bg-gradient-to-r from-sky-950/80 via-[#28221b] to-sky-950/80 border border-sky-400/60 text-center rounded">
          <div class="font-pixel text-xs sm:text-sm text-sky-300 tracking-widest drop-shadow-[0_0_10px_#38bdf8]">
            “Style you with stylu”
          </div>
          <span class="text-[10px] text-[#dfd0bc]/70 font-pixel tracking-wide mt-1 block">YOUR PERSONAL AI DRIP TRIBUNAL</span>
        </div>

        <!-- Short and Sweet Description -->
        <div class="bg-[#1a1510] border border-[#dfd0bc]/50 p-4 space-y-3 text-xs">
          <p class="text-white leading-relaxed font-terminal text-[13px]">
            <strong class="text-sky-300 font-pixel text-[11px]">STYLU</strong> is a retro arcade fashion courtroom that turns everyday dressing into a playful, interactive experience. Submit your outfit selfie to face an iconic bench of AI judges with sharp eyes and legendary personalities.
          </p>

          <!-- Key highlights -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div class="p-2.5 bg-[#241e17] border border-[#dfd0bc]/30">
              <div class="font-pixel text-[10px] text-sky-300 flex items-center gap-1.5 mb-1">
                <span>⚖️</span> 5-TIER DRIP SCALE
              </div>
              <p class="text-[#d7c3af] text-[11px] leading-tight">
                Clear, instant verdicts: <span class="text-amber-300 font-bold">Fabulous</span>, <span class="text-emerald-300 font-bold">Nice</span>, <span class="text-sky-300 font-bold">Good</span>, <span class="text-yellow-300 font-bold">Ok</span>, or <span class="text-red-400 font-bold">Guilty</span>.
              </p>
            </div>

            <div class="p-2.5 bg-[#241e17] border border-[#dfd0bc]/30">
              <div class="font-pixel text-[10px] text-sky-300 flex items-center gap-1.5 mb-1">
                <span>🎰</span> 7-DAY DRESSCODE WHEEL
              </div>
              <p class="text-[#d7c3af] text-[11px] leading-tight">
                Spin the Lucky Wheel Oracle to generate fresh aesthetic missions for every day of the week.
              </p>
            </div>

            <div class="p-2.5 bg-[#241e17] border border-[#dfd0bc]/30">
              <div class="font-pixel text-[10px] text-sky-300 flex items-center gap-1.5 mb-1">
                <span>📺</span> RETRO CRT EXPERIENCE
              </div>
              <p class="text-[#d7c3af] text-[11px] leading-tight">
                Authentic scanlines, 8-bit sound effects, character TV controls, and instant appellate reviews.
              </p>
            </div>

            <div class="p-2.5 bg-[#241e17] border border-[#dfd0bc]/30">
              <div class="font-pixel text-[10px] text-sky-300 flex items-center gap-1.5 mb-1">
                <span>💡</span> WARDROBE ADVICE
              </div>
              <p class="text-[#d7c3af] text-[11px] leading-tight">
                Tailored fashion critiques and actionable tips to level up your fits every single day.
              </p>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="pt-2 border-t border-[#dfd0bc]/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span class="text-[10px] font-pixel text-[#dfd0bc]/80">VERSION 9.4 // STYLU ENGINE</span>
          <div class="flex items-center space-x-2">
            <button id="btn-about-to-contact" class="px-3 py-1.5 bg-[#1a1510] hover:bg-sky-950 border border-sky-400 text-sky-200 font-pixel text-[10px] tracking-wider transition-colors cursor-pointer">
              📞 CONTACT CREATOR
            </button>
            <button id="btn-about-start-fit" class="px-3 py-1.5 bg-sky-900 hover:bg-sky-800 border-2 border-sky-300 text-white font-pixel text-[10px] tracking-wider transition-colors cursor-pointer">
              ▲ DROP AN OUTFIT
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#btn-close-about');
    const closeModal = () => {
      playRetroBeep(320, 'square', 0.05);
      modal.remove();
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    const toContactBtn = modal.querySelector('#btn-about-to-contact');
    if (toContactBtn) {
      toContactBtn.addEventListener('click', () => {
        modal.remove();
        openContactModal();
      });
    }

    const startFitBtn = modal.querySelector('#btn-about-start-fit');
    if (startFitBtn) {
      startFitBtn.addEventListener('click', () => {
        modal.remove();
        if (menuItem1) menuItem1.click();
      });
    }
  }

  // ============================================
  // CONTACT STYLU MODAL
  // ============================================
  function openContactModal() {
    playRetroBeep(520, 'sine', 0.08);

    const existing = document.getElementById('contact-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'contact-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="relative w-full max-w-xl bg-[#28221b] border-2 border-[#dfd0bc] p-5 md:p-6 shadow-[8px_8px_0px_#dfd0bc] text-slate-100 font-terminal space-y-4 max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[#dfd0bc]/40 pb-3">
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            <h3 class="font-pixel text-xs sm:text-sm text-white tracking-wider">
              COMMUNICATIONS BEACON // <span class="text-sky-300">CONTACT US</span>
            </h3>
          </div>
          <button id="btn-close-contact" class="px-2.5 py-1 bg-[#1a1510] hover:bg-[#342b21] border border-[#dfd0bc] text-sky-300 font-pixel text-xs tracking-wider transition-colors cursor-pointer">
            [ESC ✕]
          </button>
        </div>

        <!-- Tagline Quote Banner -->
        <div class="p-2.5 bg-[#1a1510] border border-[#dfd0bc]/40 text-center">
          <span class="font-pixel text-[11px] text-sky-300 tracking-wider">“Style you with stylu”</span>
          <p class="text-[10px] text-[#dfd0bc]/80 font-terminal mt-0.5">Reach out directly for support, collaborations, or fashion queries!</p>
        </div>

        <!-- Contact Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Phone / WhatsApp Card -->
          <div class="bg-[#1a1510] border border-[#dfd0bc]/50 p-3.5 space-y-2 flex flex-col justify-between">
            <div>
              <div class="flex items-center space-x-2 mb-1">
                <span class="text-lg">📱</span>
                <span class="font-pixel text-[10px] text-sky-300 font-bold">PHONE &amp; WHATSAPP</span>
              </div>
              <div class="font-pixel text-xs text-white tracking-wider mt-1.5 select-all font-bold">
                8248049524
              </div>
              <p class="text-[10px] text-[#d7c3af] font-terminal mt-0.5">Direct line &amp; WhatsApp</p>
            </div>
            <div class="flex flex-col gap-1.5 pt-2 border-t border-[#dfd0bc]/20">
              <a href="tel:8248049524" class="px-2.5 py-1.5 bg-[#241e17] hover:bg-sky-950 border border-sky-400 text-sky-200 font-pixel text-[9px] tracking-wider text-center transition-colors">
                📞 CALL: 8248049524
              </a>
              <a href="https://wa.me/918248049524" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400 text-emerald-200 font-pixel text-[9px] tracking-wider text-center transition-colors">
                💬 WHATSAPP CHAT
              </a>
              <button id="btn-copy-phone" class="px-2.5 py-1 bg-[#1a1510] hover:bg-[#342b21] border border-[#dfd0bc]/40 text-[#dfd0bc] font-pixel text-[8px] tracking-wider text-center transition-colors cursor-pointer">
                📋 COPY NUMBER
              </button>
            </div>
          </div>

          <!-- Email Card -->
          <div class="bg-[#1a1510] border border-[#dfd0bc]/50 p-3.5 space-y-2 flex flex-col justify-between">
            <div>
              <div class="flex items-center space-x-2 mb-1">
                <span class="text-lg">✉️</span>
                <span class="font-pixel text-[10px] text-sky-300 font-bold">EMAIL INBOX</span>
              </div>
              <div class="font-pixel text-[10px] sm:text-[11px] text-white tracking-wider mt-1.5 select-all break-all font-bold">
                12kishore47@gmail.com
              </div>
              <p class="text-[10px] text-[#d7c3af] font-terminal mt-0.5">Inbox &amp; feature requests</p>
            </div>
            <div class="flex flex-col gap-1.5 pt-2 border-t border-[#dfd0bc]/20">
              <a href="mailto:12kishore47@gmail.com" class="px-2.5 py-1.5 bg-[#241e17] hover:bg-sky-950 border border-sky-400 text-sky-200 font-pixel text-[9px] tracking-wider text-center transition-colors">
                ✉️ SEND EMAIL
              </a>
              <button id="btn-copy-email" class="px-2.5 py-1 bg-[#1a1510] hover:bg-[#342b21] border border-[#dfd0bc]/40 text-[#dfd0bc] font-pixel text-[8px] tracking-wider text-center transition-colors cursor-pointer">
                📋 COPY EMAIL
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Message / Dispatch Form -->
        <div class="bg-[#1a1510] border border-[#dfd0bc]/50 p-3 space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-pixel text-[9px] text-sky-300">DIRECT DISPATCH BEACON:</span>
            <span class="text-[9px] font-pixel text-[#dfd0bc]/60">TRANSMIT VIA BROWSER</span>
          </div>
          <div class="space-y-1.5">
            <input type="text" id="contact-input-name" placeholder="YOUR CODENAME / DEFENDANT NAME" class="w-full bg-black/60 border border-[#dfd0bc]/40 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-terminal focus:border-sky-400 focus:outline-none" />
            <textarea id="contact-input-msg" rows="2" placeholder="YOUR MESSAGE / FEEDBACK / INQUIRY..." class="w-full bg-black/60 border border-[#dfd0bc]/40 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-terminal focus:border-sky-400 focus:outline-none resize-none"></textarea>
          </div>
          <button id="btn-submit-contact-dispatch" class="w-full py-1.5 bg-sky-900 hover:bg-sky-800 border border-sky-300 text-white font-pixel text-[9px] tracking-wider transition-colors cursor-pointer">
            📡 TRANSMIT DISPATCH TO CREATOR
          </button>
          <div id="contact-dispatch-status" class="hidden text-center text-emerald-300 font-pixel text-[9px] pt-1">
            ✓ DISPATCH TRANSMITTED TO 12KISHORE47@GMAIL.COM!
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-2 border-t border-[#dfd0bc]/30 flex justify-between items-center text-[10px] font-pixel text-[#dfd0bc]/80">
          <span>LINE STATUS: ACTIVE &amp; SECURE</span>
          <span class="text-sky-300">KISHORE // STYLU ARCHITECT</span>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#btn-close-contact');
    const closeModal = () => {
      playRetroBeep(320, 'square', 0.05);
      modal.remove();
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    const copyPhoneBtn = modal.querySelector('#btn-copy-phone');
    if (copyPhoneBtn) {
      copyPhoneBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('8248049524');
        copyPhoneBtn.textContent = '✓ COPIED!';
        playRetroBeep(880, 'sine', 0.08);
        setTimeout(() => { copyPhoneBtn.textContent = '📋 COPY NUMBER'; }, 2000);
      });
    }

    const copyEmailBtn = modal.querySelector('#btn-copy-email');
    if (copyEmailBtn) {
      copyEmailBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('12kishore47@gmail.com');
        copyEmailBtn.textContent = '✓ COPIED!';
        playRetroBeep(880, 'sine', 0.08);
        setTimeout(() => { copyEmailBtn.textContent = '📋 COPY EMAIL'; }, 2000);
      });
    }

    const submitBtn = modal.querySelector('#btn-submit-contact-dispatch');
    const statusMsg = modal.querySelector('#contact-dispatch-status');
    if (submitBtn && statusMsg) {
      submitBtn.addEventListener('click', () => {
        playRetroBeep(784, 'triangle', 0.1);
        setTimeout(() => playRetroBeep(1046, 'sine', 0.2), 100);
        submitBtn.disabled = true;
        submitBtn.textContent = '✓ TRANSMITTED!';
        statusMsg.classList.remove('hidden');
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = '📡 TRANSMIT ANOTHER DISPATCH';
        }, 3000);
      });
    }
  }

  // Expose globally so all buttons and UI triggers can invoke modals
  window.openAboutModal = openAboutModal;
  window.openContactModal = openContactModal;

  // ============================================
  // PHASE 3: CRT OUTFIT TRIAL, CHANNELS & UPLOAD
  // ============================================

  const JUDGES = [
    { slug: 'mall-cop', channel: 1, name: '90s MALL COP', role: 'SECURITY CHIEF' },
    { slug: 'harajuku-elite', channel: 2, name: 'HARAJUKU ELITE', role: 'AVANT-GARDE CRITIC' },
    { slug: 'vintage-thrift-king', channel: 3, name: 'VINTAGE THRIFT KING', role: 'ARCHIVIST' },
    { slug: 'strict-auntie', channel: 4, name: 'STRICT AUNTIE', role: 'TRIBUNAL PRESIDENT' },
    { slug: 'runway-czar', channel: 5, name: 'RUNWAY CZAR', role: 'COUTURE INQUISITOR' }
  ];

  let currentJudgeIdx = 3; // Index 3 is CH 04: STRICT AUNTIE (default)
  let isTvPoweredOn = true;
  let isDeliberating = false;

  const crtScreen = document.getElementById('crt-screen');
  const fileUploadInput = document.getElementById('fit-photo-upload');
  const interactiveContent = document.querySelector('[data-purpose="interactive-screen-content"]');
  const btnChUp = document.getElementById('btn-ch-up');
  const btnChDown = document.getElementById('btn-ch-down');
  const btnPower = document.getElementById('btn-power');
  const btnMute = document.getElementById('btn-mute');
  const menuItem1 = document.querySelector('[data-purpose="menu-item-1"]');
  const menuItem2 = document.querySelector('[data-purpose="menu-item-2"]');
  const menuItem3 = document.querySelector('[data-purpose="menu-item-3"]');
  const menuItemSettings = document.getElementById('menu-item-settings') ||
                           document.querySelector('[data-purpose="menu-item-settings"]') ||
                           document.querySelector('[data-purpose="menu-item-4"]') ||
                           document.querySelector('[data-purpose="menu-item-7"]');
  const menuItemAbout = document.getElementById('menu-item-about') ||
                        document.querySelector('[data-purpose="menu-item-about"]') ||
                        document.querySelector('[data-purpose="menu-item-5"]');
  const menuItemContact = document.getElementById('menu-item-contact') ||
                          document.querySelector('[data-purpose="menu-item-contact"]') ||
                          document.querySelector('[data-purpose="menu-item-6"]');
  const navAboutBtn = document.getElementById('nav-about-btn');
  const navContactBtn = document.getElementById('nav-contact-btn');
  const topSettingsBtn = document.getElementById('top-settings-btn') ||
                         document.querySelector('[data-purpose="settings-toggle-button"]');
  const leftCaseFileNo = document.querySelector('[data-purpose="left-court-card"] span.font-pixel.text-\\[9px\\]');

  // Cache initial upload template
  let initialUploadHtml = interactiveContent ? interactiveContent.innerHTML : '';

  function getCrtChannelBadge() {
    if (!crtScreen) return null;
    return crtScreen.querySelector('div.relative.z-10.flex span');
  }

  function getTopBroadcastBadge() {
    return document.querySelector('[data-purpose="top-broadcast-bar"] span.hidden.sm\\:inline-block');
  }

  // ============================================
  // CHARACTER OPERATOR INTERACTION
  // ============================================
  const characterOperator = document.getElementById('character-operator');
  const remoteInfraredBeam = document.getElementById('remote-infrared-beam');
  const operatorSpeechText = document.getElementById('operator-speech-text');

  const OPERATOR_PHRASES = [
    'CH 01 // "MALL PATROL ENGAGED! 🚨"',
    'CH 02 // "TOKYO CYBERPUNK! ⚡"',
    'CH 03 // "VINTAGE THRIFT TIME! 📻"',
    'CH 04 // "AUNTIE IS WATCHING! 👀"',
    'CH 05 // "MILAN COUTURE RUNWAY! 👠"'
  ];

  function updateOperatorSpeech(judgeIdx) {
    if (operatorSpeechText && OPERATOR_PHRASES[judgeIdx]) {
      operatorSpeechText.textContent = OPERATOR_PHRASES[judgeIdx];
      operatorSpeechText.classList.remove('slot-tick');
      void operatorSpeechText.offsetWidth;
      operatorSpeechText.classList.add('slot-tick');
    }
  }

  if (characterOperator) {
    characterOperator.addEventListener('click', () => {
      // Remote control button click sound
      playRetroBeep(880, 'sine', 0.04);
      setTimeout(() => playRetroBeep(440, 'square', 0.05), 30);

      // Flash infrared LED beam
      if (remoteInfraredBeam) {
        remoteInfraredBeam.classList.remove('opacity-0');
        remoteInfraredBeam.classList.add('opacity-100');
        setTimeout(() => {
          remoteInfraredBeam.classList.remove('opacity-100');
          remoteInfraredBeam.classList.add('opacity-0');
        }, 220);
      }

      // Switch TV channel
      updateJudgeChannel(currentJudgeIdx + 1);
    });
  }

  function updateJudgeChannel(newIdx) {
    currentJudgeIdx = (newIdx + JUDGES.length) % JUDGES.length;
    const judge = JUDGES[currentJudgeIdx];

    // Audio effect: TV tuner click + static blip
    playRetroBeep(650, 'square', 0.04);
    setTimeout(() => playRetroBeep(320, 'sawtooth', 0.05), 40);

    // Update CRT HUD
    const crtChannelBadge = getCrtChannelBadge();
    if (crtChannelBadge) {
      crtChannelBadge.textContent = `CH 0${judge.channel} : ${judge.name}`;
      crtChannelBadge.classList.remove('slot-tick');
      void crtChannelBadge.offsetWidth;
      crtChannelBadge.classList.add('slot-tick');
    }

    // Update Top broadcast bar
    const topBroadcastBadge = getTopBroadcastBadge();
    if (topBroadcastBadge) {
      topBroadcastBadge.textContent = `B&E AIR // CH.0${judge.channel}`;
    }

    // Update Character speech bubble
    updateOperatorSpeech(currentJudgeIdx);

    // Flicker CRT screen
    if (crtScreen) {
      crtScreen.style.filter = 'brightness(1.4) contrast(1.2)';
      setTimeout(() => { crtScreen.style.filter = ''; }, 120);
    }

    console.log(`📺 Switched to CH 0${judge.channel}: ${judge.name}`);
  }

  // TV Hardware Button Handlers
  if (btnChUp) {
    btnChUp.addEventListener('click', () => {
      updateJudgeChannel(currentJudgeIdx + 1);
    });
  }

  if (btnChDown) {
    btnChDown.addEventListener('click', () => {
      updateJudgeChannel(currentJudgeIdx - 1);
    });
  }

  if (btnPower) {
    btnPower.addEventListener('click', () => {
      isTvPoweredOn = !isTvPoweredOn;
      playRetroBeep(isTvPoweredOn ? 800 : 200, 'sine', 0.12);

      let offOverlay = document.getElementById('crt-power-off-overlay');
      if (!isTvPoweredOn) {
        if (!offOverlay && crtScreen) {
          offOverlay = document.createElement('div');
          offOverlay.id = 'crt-power-off-overlay';
          offOverlay.className = 'absolute inset-0 z-30 bg-black flex flex-col items-center justify-center transition-opacity duration-300';
          offOverlay.innerHTML = `
            <div class="w-2 h-2 bg-sky-200 rounded-full shadow-[0_0_12px_#38bdf8] animate-ping mb-2"></div>
            <span class="font-pixel text-[10px] text-slate-500 tracking-widest">STANDBY // PRESS PWR</span>
          `;
          crtScreen.appendChild(offOverlay);
        }
      } else {
        if (offOverlay) {
          offOverlay.remove();
        }
      }
    });
  }

  if (btnMute && audioToggle) {
    btnMute.addEventListener('click', () => {
      audioToggle.click();
    });
  }

  // Menu Items Integration
  if (menuItem1) {
    menuItem1.addEventListener('click', () => {
      if (crtScreen) {
        crtScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const activeFileInput = document.getElementById('fit-photo-upload');
      if (activeFileInput) {
        activeFileInput.click();
      }
    });
  }

  if (menuItem2) {
    menuItem2.addEventListener('click', () => {
      updateJudgeChannel(currentJudgeIdx + 1);
      if (crtScreen) {
        crtScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // Menu Item 03: My Cases & Bail Records
  if (menuItem3) {
    menuItem3.addEventListener('click', openMyCasesModal);
  }

  // Menu Item 04: System Settings
  if (menuItemSettings) {
    menuItemSettings.addEventListener('click', openSettingsModal);
  }

  if (topSettingsBtn) {
    topSettingsBtn.addEventListener('click', openSettingsModal);
  }

  // Menu Item 05: About Stylu
  if (menuItemAbout) {
    menuItemAbout.addEventListener('click', openAboutModal);
  }
  if (navAboutBtn) {
    navAboutBtn.addEventListener('click', openAboutModal);
  }

  // Menu Item 06: Contact Us
  if (menuItemContact) {
    menuItemContact.addEventListener('click', openContactModal);
  }
  if (navContactBtn) {
    navContactBtn.addEventListener('click', openContactModal);
  }

  async function openMyCasesModal() {
    playRetroBeep(520, 'sine', 0.08);

    // Remove existing modal if any
    const existing = document.getElementById('my-cases-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'my-cases-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="relative w-full max-w-2xl bg-[#28221b] border-2 border-[#dfd0bc] p-4 md:p-6 shadow-[8px_8px_0px_#dfd0bc] text-slate-100 font-terminal max-h-[85vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[#dfd0bc]/40 pb-3 mb-4">
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 bg-sky-400 rounded-full animate-ping"></span>
            <h3 class="font-pixel text-xs sm:text-sm text-white tracking-wider">
              COURT DOCKET // <span class="text-sky-300">MY CASES &amp; BAIL RECORDS</span>
            </h3>
          </div>
          <button id="btn-close-cases" class="px-2.5 py-1 bg-[#1a1510] hover:bg-[#342b21] border border-[#dfd0bc] text-sky-300 font-pixel text-xs tracking-wider transition-colors cursor-pointer">
            [ESC ✕]
          </button>
        </div>

        <!-- Cases Container -->
        <div id="cases-list-container" class="flex-1 overflow-y-auto space-y-3 pr-1 text-sm">
          <div class="py-8 text-center text-sky-200 font-pixel text-xs animate-pulse">
            RETRIEVING DOCKET ARCHIVES FROM REGISTRY...
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-4 pt-2 border-t border-[#dfd0bc]/30 flex justify-between items-center text-[10px] font-pixel text-[#dfd0bc]">
          <span>STATUS: EVIDENCE SECURE</span>
          <button id="btn-refresh-cases" class="text-sky-300 hover:text-white underline cursor-pointer">REFRESH DOCKET</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close handlers
    const closeBtn = modal.querySelector('#btn-close-cases');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        playRetroBeep(320, 'square', 0.05);
        modal.remove();
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    const refreshBtn = modal.querySelector('#btn-refresh-cases');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => loadCasesList(modal));
    }

    await loadCasesList(modal);
  }

  async function loadCasesList(modal) {
    const container = modal.querySelector('#cases-list-container');
    if (!container) return;

    try {
      const data = await apiRequest('/trials?mine=1');
      const trials = data.trials || [];

      if (trials.length === 0) {
        container.innerHTML = `
          <div class="py-12 text-center space-y-3">
            <div class="w-12 h-12 mx-auto rounded border-2 border-dashed border-sky-400/60 flex items-center justify-center text-sky-300 font-pixel text-xl">
              ?
            </div>
            <p class="font-pixel text-xs text-sky-200">NO TRIAL DOCKETS ON FILE</p>
            <p class="text-xs text-[#d7c3af] max-w-sm mx-auto font-terminal">
              Your fashion record is clean. Submit an outfit selfie to face trial and enter the courtroom registry.
            </p>
            <button id="btn-modal-start-trial" class="px-3 py-1.5 bg-sky-900 hover:bg-sky-800 border-2 border-sky-300 text-white font-pixel text-[10px] tracking-wider transition-all shadow-pixel-btn cursor-pointer">
              ▲ [ DROP AN OUTFIT NOW ]
            </button>
          </div>
        `;

        const startBtn = container.querySelector('#btn-modal-start-trial');
        if (startBtn) {
          startBtn.addEventListener('click', () => {
            modal.remove();
            if (menuItem1) menuItem1.click();
          });
        }
        return;
      }

      container.innerHTML = trials.map(t => {
        const rating = resolveRatingTier(t.verdict?.rating || t.verdict?.verdict, t.score_10);
        const cfg = RATING_CONFIG[rating] || RATING_CONFIG.GOOD;
        const dateStr = t.created_at ? new Date(t.created_at * 1000).toLocaleDateString() : 'RECENT';

        return `
          <div class="case-card bg-[#1a1510] border border-[#dfd0bc]/60 p-3 rounded-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors hover:border-sky-400" data-trial-id="${t.id}">
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <div class="w-14 h-14 rounded overflow-hidden border ${cfg.borderColor} flex-shrink-0 bg-black">
                <img src="${t.photo_url}" class="w-full h-full object-cover" onerror="this.src='/assets/pixel_art_defendant_avatar.png'" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center space-x-2">
                  <span class="font-pixel text-[10px] text-sky-300 font-bold">${t.case_no}</span>
                  <span class="px-1.5 py-0.5 font-pixel text-[8px] rounded border ${cfg.borderColor} ${cfg.textColor} ${cfg.bgPill} font-bold">
                    ${cfg.icon} ${cfg.label}
                  </span>
                  <span class="text-[9px] text-[#dfd0bc]/60 font-pixel">${dateStr}</span>
                </div>
                <h4 class="font-pixel text-[11px] text-white truncate mt-0.5">${t.title || t.verdict?.title || `${cfg.label} // Style Evaluation`}</h4>
                <p class="text-[11px] text-[#d7c3af] truncate font-terminal">
                  JUDGE: <span class="text-sky-200">${t.judge_name}</span> // DRIP: <span class="text-white font-bold">${t.score_10 || 0}/10</span>
                </p>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center space-x-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#dfd0bc]/20">
              <button class="btn-load-case px-2.5 py-1 bg-sky-950 hover:bg-sky-900 border border-sky-400 text-sky-200 font-pixel text-[9px] tracking-wider transition-colors cursor-pointer" data-trial-id="${t.id}">
                📺 VIEW ON CRT
              </button>
              <button class="btn-delete-case px-2 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500/80 text-red-300 font-pixel text-[9px] tracking-wider transition-colors cursor-pointer" data-trial-id="${t.id}" title="Expunge from record">
                🗑️ EXPUNGE
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Wire View on CRT buttons
      container.querySelectorAll('.btn-load-case').forEach(btn => {
        btn.addEventListener('click', () => {
          const trialId = parseInt(btn.getAttribute('data-trial-id'), 10);
          const trial = trials.find(x => x.id === trialId);
          if (trial && trial.verdict) {
            playRetroBeep(650, 'sine', 0.1);
            modal.remove();
            if (crtScreen) {
              crtScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            renderVerdict({
              trial_id: trial.id,
              case_no: trial.case_no,
              photo_url: trial.photo_url,
              verdict: trial.verdict
            });
          }
        });
      });

      // Wire Delete / Expunge buttons
      container.querySelectorAll('.btn-delete-case').forEach(btn => {
        btn.addEventListener('click', async () => {
          const trialId = parseInt(btn.getAttribute('data-trial-id'), 10);
          playRetroBeep(300, 'sawtooth', 0.08);

          btn.disabled = true;
          btn.textContent = 'EXPUNGING...';

          try {
            await apiRequest(`/trials/${trialId}`, { method: 'DELETE' });
            playRetroBeep(880, 'sine', 0.12);

            const card = container.querySelector(`.case-card[data-trial-id="${trialId}"]`);
            if (card) {
              card.style.opacity = '0.3';
              card.style.transform = 'scale(0.96)';
              setTimeout(() => card.remove(), 250);
            }
          } catch (err) {
            btn.disabled = false;
            btn.textContent = 'FAILED';
            showError(formatError(err));
          }
        });
      });

    } catch (err) {
      container.innerHTML = `
        <div class="py-8 text-center text-red-400 font-pixel text-xs">
          FAILED TO RETRIEVE COURT RECORDS // ${formatError(err)}
        </div>
      `;
    }
  }

  // File Upload & Drag-and-Drop Setup
  function initUploadHandlers() {
    if (!crtScreen) return;

    const fileInput = document.getElementById('fit-photo-upload');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          processUploadedFit(e.target.files[0]);
        }
      });
    }

    // Drag and drop visual cues on CRT screen
    ['dragenter', 'dragover'].forEach(eventName => {
      crtScreen.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (interactiveContent) {
          interactiveContent.classList.add('ring-2', 'ring-sky-400', 'ring-offset-2', 'ring-offset-black');
        }
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      crtScreen.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (interactiveContent) {
          interactiveContent.classList.remove('ring-2', 'ring-sky-400', 'ring-offset-2', 'ring-offset-black');
        }
      });
    });

    crtScreen.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer?.files;
      if (files && files[0]) {
        processUploadedFit(files[0]);
      }
    });
  }

  async function processUploadedFit(file) {
    if (!file.type.startsWith('image/')) {
      showError('INVALID FILE // ONLY JPG/PNG/WEBP ACCEPTED');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showError('FILE EXCEEDS 10MB LIMIT');
      return;
    }

    if (isDeliberating) return;
    isDeliberating = true;

    const judge = JUDGES[currentJudgeIdx];
    const previewUrl = URL.createObjectURL(file);

    // Render Scanning screen inside interactiveContent
    if (interactiveContent) {
      interactiveContent.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center p-2 md:p-3 text-center space-y-2">
          <div class="relative w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden border-2 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]">
            <img src="${previewUrl}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-sky-500/15 scanlines-overlay"></div>
            <div class="absolute inset-x-0 h-1 bg-sky-300 shadow-[0_0_8px_#38bdf8] animate-bounce"></div>
          </div>

          <div class="space-y-1 w-full max-w-[280px]">
            <div class="flex items-center justify-between text-[10px] font-pixel text-sky-300">
              <span id="scan-step-text">SCANNING SILHOUETTE...</span>
              <span id="scan-progress-num" class="text-white">18%</span>
            </div>
            <div class="w-full bg-slate-900 border border-sky-400/60 h-2 rounded-full overflow-hidden">
              <div id="scan-progress-bar" class="bg-gradient-to-r from-sky-500 to-cyan-300 h-full w-[18%] transition-all duration-300"></div>
            </div>
            <p class="font-terminal text-[11px] text-sky-200/90 truncate">JUDGE: ${judge.name} DELIBERATING</p>
          </div>
        </div>
      `;
    }

    // Progressive scanning steps with retro sound
    let progress = 18;
    const stepText = document.getElementById('scan-step-text');
    const progNum = document.getElementById('scan-progress-num');
    const progBar = document.getElementById('scan-progress-bar');

    const scanInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 14) + 8;
      if (progress > 95) progress = 95;

      if (progNum) progNum.textContent = `${progress}%`;
      if (progBar) progBar.style.width = `${progress}%`;

      if (progress > 30 && progress < 60) {
        if (stepText) stepText.textContent = 'EXTRACTING PALETTE RGB...';
        playRetroBeep(420, 'square', 0.03);
      } else if (progress >= 60 && progress < 85) {
        if (stepText) stepText.textContent = 'EVALUATING PROPORTIONS...';
        playRetroBeep(560, 'square', 0.03);
      } else if (progress >= 85) {
        if (stepText) stepText.textContent = `BENCH RULING: ${judge.name}...`;
        playRetroBeep(700, 'sine', 0.04);
      }
    }, 380);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('judge_slug', judge.slug);
      formData.append('tier', 'STANDARD');
      formData.append('consent', 'true');

      const response = await apiRequest('/trials', {
        method: 'POST',
        body: formData
      });

      clearInterval(scanInterval);
      if (progNum) progNum.textContent = '100%';
      if (progBar) progBar.style.width = '100%';

      setTimeout(() => {
        isDeliberating = false;
        renderVerdict(response);
      }, 500);

    } catch (err) {
      clearInterval(scanInterval);
      isDeliberating = false;
      showError(formatError(err));
      setTimeout(resetUploadScreen, 1500);
    }
  }

  const RATING_CONFIG = {
    FABULOUS: {
      id: 'FABULOUS',
      label: 'FABULOUS',
      badge: '✨ FABULOUS ✨',
      icon: '✨',
      textColor: 'text-amber-300',
      borderColor: 'border-amber-400',
      bgPill: 'bg-amber-950/90',
      glow: 'shadow-[0_0_14px_#f59e0b]',
      headline: 'SUPREME DRIP // RUNWAY ROYALTY',
      barGradient: 'from-amber-400 to-yellow-200'
    },
    NICE: {
      id: 'NICE',
      label: 'NICE',
      badge: '🔥 NICE 🔥',
      icon: '🔥',
      textColor: 'text-emerald-300',
      borderColor: 'border-emerald-400',
      bgPill: 'bg-emerald-950/90',
      glow: 'shadow-[0_0_14px_#10b981]',
      headline: 'HIGH DRIP // VERY SHARP & STYLISH',
      barGradient: 'from-emerald-400 to-teal-200'
    },
    GOOD: {
      id: 'GOOD',
      label: 'GOOD',
      badge: '👍 GOOD 👍',
      icon: '👍',
      textColor: 'text-sky-300',
      borderColor: 'border-sky-400',
      bgPill: 'bg-sky-950/90',
      glow: 'shadow-[0_0_14px_#38bdf8]',
      headline: 'SOLID LOOK // CLEAN EVERYDAY STYLE',
      barGradient: 'from-sky-400 to-cyan-200'
    },
    OK: {
      id: 'OK',
      label: 'OK',
      badge: '⚡ OK ⚡',
      icon: '⚡',
      textColor: 'text-yellow-300',
      borderColor: 'border-yellow-400',
      bgPill: 'bg-yellow-950/90',
      glow: 'shadow-[0_0_14px_#eab308]',
      headline: 'AVERAGE FIT // ROOM TO LEVEL UP',
      barGradient: 'from-yellow-400 to-amber-200'
    },
    GUILTY: {
      id: 'GUILTY',
      label: 'GUILTY',
      badge: '🚨 GUILTY 🚨',
      icon: '🚨',
      textColor: 'text-red-400',
      borderColor: 'border-red-500',
      bgPill: 'bg-red-950/90',
      glow: 'shadow-[0_0_14px_#ef4444]',
      headline: 'FASHION CRIME // SARTORIAL DETENTION',
      barGradient: 'from-red-600 to-rose-400'
    }
  };

  function resolveRatingTier(val, score) {
    const raw = (val || '').toString().toUpperCase().trim();
    if (raw.includes('FAB') || raw === 'FABALOUS' || raw === 'FABULOUS') return 'FABULOUS';
    if (raw === 'NICE') return 'NICE';
    if (raw === 'GOOD') return 'GOOD';
    if (raw === 'OK') return 'OK';
    if (raw === 'GUILTY') return 'GUILTY';

    const s = parseFloat(score) || 7.0;
    if (s >= 9.0) return 'FABULOUS';
    if (s >= 7.5) return 'NICE';
    if (s >= 6.0) return 'GOOD';
    if (s >= 4.0) return 'OK';
    return 'GUILTY';
  }

  function renderVerdict(data) {
    const verdict = data.verdict;
    const rating = resolveRatingTier(verdict.rating || verdict.verdict, verdict.score_10);
    const cfg = RATING_CONFIG[rating] || RATING_CONFIG.GOOD;

    // Play fanfare / sounds tailored to the 5 rating tiers
    if (rating === 'FABULOUS') {
      playRetroBeep(523, 'sine', 0.1);
      setTimeout(() => playRetroBeep(659, 'sine', 0.1), 100);
      setTimeout(() => playRetroBeep(784, 'sine', 0.15), 200);
      setTimeout(() => playRetroBeep(1046, 'sine', 0.3), 320);
      try { spawnParticleBlast(window.innerWidth / 2, window.innerHeight * 0.4); } catch (e) {}
    } else if (rating === 'NICE') {
      playRetroBeep(587, 'sine', 0.1);
      setTimeout(() => playRetroBeep(740, 'sine', 0.12), 120);
      setTimeout(() => playRetroBeep(880, 'sine', 0.22), 240);
      try { spawnParticleBlast(window.innerWidth / 2, window.innerHeight * 0.4); } catch (e) {}
    } else if (rating === 'GOOD') {
      playRetroBeep(523, 'sine', 0.12);
      setTimeout(() => playRetroBeep(659, 'sine', 0.18), 120);
    } else if (rating === 'OK') {
      playRetroBeep(440, 'triangle', 0.15);
      setTimeout(() => playRetroBeep(440, 'sine', 0.15), 140);
    } else {
      // GUILTY
      playRetroBeep(260, 'sawtooth', 0.18);
      setTimeout(() => playRetroBeep(196, 'sawtooth', 0.3), 180);
    }

    // Update Left Card Case File
    if (leftCaseFileNo && data.case_no) {
      leftCaseFileNo.textContent = data.case_no;
    }

    if (!interactiveContent) return;

    // Clean up sentence and charges from dry codes
    let cleanSentence = verdict.sentence || cfg.headline;
    cleanSentence = cleanSentence.replace(/^RULING:\s*/i, '').trim();

    const rawCharges = Array.isArray(verdict.charges) ? verdict.charges : [];
    const cleanCharges = rawCharges.map(c => {
      return c.replace(/^(Commendation\s*\d*[-:]?\d*|Permit\s*Approved|Patrol\s*Clearance|Violation\s*\d*[-:]?\d*|Suspicious\s*Silhouette|Unlicensed\s*Vibe|Aesthetic\s*Sin|Mainstream\s*Infection|Kawaii\s*Deficit|Poly-Blend\s*Violation|Faux\s*Distress|History\s*Erasure|Museum\s*Quality|Textile\s*Resonance|Sustainable\s*Supremacy|Proportional\s*Catastrophe|Colorway\s*Cowardice|Pedestrian\s*Posture|Architectural\s*Precision|Haute\s*Sensibility|Pure\s*Editorial\s*Energy|Wrinkle\s*Disaster|Ripped\s*Knees\s*Scandal|Color\s*Clashing\s*Trauma|Crisp\s*Discipline|Decent\s*Elegance|Clean\s*Demeanor)[\s:]*/i, '').trim();
    });

    interactiveContent.innerHTML = `
      <div class="h-full max-h-[290px] overflow-y-auto px-1.5 py-1 text-left font-terminal space-y-2 select-text text-slate-100">
        <!-- Top Banner: Case No & Big Tier Badge -->
        <div class="flex items-center justify-between border-b border-sky-400/40 pb-1.5">
          <div class="truncate mr-2">
            <span class="font-pixel text-[9px] text-sky-300 block">CASE: ${data.case_no} // ${verdict.judge || 'AI JUDGE'}</span>
            <h4 class="font-pixel text-[11px] md:text-xs text-white uppercase truncate">${verdict.title || cfg.headline}</h4>
          </div>
          <div class="flex-shrink-0 text-right">
            <span class="inline-block px-2.5 py-0.5 font-pixel text-[11px] font-bold tracking-wider rounded border-2 ${cfg.borderColor} ${cfg.textColor} ${cfg.bgPill} ${cfg.glow}">
              ${cfg.badge}
            </span>
          </div>
        </div>

        <!-- 5-Tier Scale Selector Bar (FABULOUS, NICE, GOOD, OK, GUILTY) -->
        <div class="bg-black/85 border border-[#dfd0bc]/50 p-2 rounded">
          <div class="flex items-center justify-between text-[10px] font-pixel mb-1.5">
            <span class="text-[#dfd0bc]">STYLE RATING:</span>
            <span class="${cfg.textColor} font-bold text-xs tracking-wider">${cfg.icon} ${cfg.label} (${verdict.score_10} / 10)</span>
          </div>
          <div class="grid grid-cols-5 gap-1 text-center font-pixel text-[8px] sm:text-[9px]">
            ${['GUILTY', 'OK', 'GOOD', 'NICE', 'FABULOUS'].map(k => {
              const t = RATING_CONFIG[k];
              const isSelected = t.id === rating;
              return `
                <div class="py-1 px-0.5 border transition-all ${isSelected ? `${t.bgPill} ${t.borderColor} ${t.textColor} font-bold ${t.glow} ring-1 ring-white/70 scale-105 z-10 animate-pulse` : 'bg-black/50 border-slate-700/60 text-slate-500 opacity-60'}">
                  <div class="text-[10px]">${t.icon}</div>
                  <div class="truncate mt-0.5">${t.label}</div>
                </div>
              `;
            }).join('')}
          </div>
          <div class="mt-1.5 text-[10px] text-center ${cfg.textColor} font-terminal tracking-wide">
            ★ ${cfg.headline} ★
          </div>
        </div>

        <!-- Drip Score Meter -->
        <div class="bg-black/70 border border-sky-900/80 p-1.5 rounded flex items-center justify-between text-[11px]">
          <span class="font-pixel text-sky-200 text-[10px]">DRIP: <span class="text-white font-bold">${verdict.score_10} / 10</span></span>
          <div class="flex-1 mx-2.5 bg-slate-800 h-2 rounded-full overflow-hidden border border-sky-500/30">
            <div class="bg-gradient-to-r ${cfg.barGradient} h-full transition-all duration-500" style="width: ${verdict.drip_pct}%"></div>
          </div>
          <span class="font-pixel text-[10px] ${cfg.textColor}">${verdict.drip_pct}%</span>
        </div>

        <!-- Style Verdict Summary -->
        <div class="p-1.5 bg-[#17130e]/95 border-l-2 ${cfg.borderColor} text-xs text-[#f5ece1] leading-tight rounded-r">
          <span class="${cfg.textColor} font-pixel text-[9px] block mb-0.5">OUTFIT VERDICT // ${cfg.label}:</span>
          ${cleanSentence}
        </div>

        <!-- Outfit Highlights -->
        ${cleanCharges.length ? `
        <div class="space-y-1 text-[11px]">
          <span class="font-pixel text-[9px] text-[#dfd0bc] block">OUTFIT HIGHLIGHTS:</span>
          ${cleanCharges.map(c => `
            <div class="flex items-start space-x-1.5 text-slate-200">
              <span class="${cfg.textColor} text-[10px]">▶</span>
              <span class="leading-tight">${c}</span>
            </div>
          `).join('')}
        </div>` : ''}

        <!-- Category Mini-Scores -->
        ${verdict.categories ? `
        <div class="grid grid-cols-4 gap-1 text-[9px] text-center font-terminal pt-1 border-t border-sky-900/60">
          <div class="bg-black/60 p-1 border border-sky-800/60 rounded">
            <span class="text-sky-300 block">TOPS</span>
            <span class="text-white font-bold">${verdict.categories.tops?.score_10 || 7.0}</span>
          </div>
          <div class="bg-black/60 p-1 border border-sky-800/60 rounded">
            <span class="text-sky-300 block">BOTTOMS</span>
            <span class="text-white font-bold">${verdict.categories.bottoms?.score_10 || 7.0}</span>
          </div>
          <div class="bg-black/60 p-1 border border-sky-800/60 rounded">
            <span class="text-sky-300 block">SHOES</span>
            <span class="text-white font-bold">${verdict.categories.footwear?.score_10 || 7.0}</span>
          </div>
          <div class="bg-black/60 p-1 border border-sky-800/60 rounded">
            <span class="text-sky-300 block">ACC</span>
            <span class="text-white font-bold">${verdict.categories.accessories?.score_10 || 7.0}</span>
          </div>
        </div>` : ''}

        <!-- Fix Tips -->
        ${verdict.fix_tips && verdict.fix_tips.length ? `
        <div class="text-[10px] text-[#d7c3af] bg-black/60 p-1.5 rounded border border-[#8c7865]/40 leading-snug">
          <span class="text-sky-300 font-pixel text-[8px] block mb-0.5">WARDROBE ADVICE:</span>
          ${verdict.fix_tips[0]}
        </div>` : ''}

        <!-- Interactive Actions -->
        <div class="pt-1.5 flex items-center justify-between gap-2">
          <button id="btn-try-another-fit" class="flex-1 py-1.5 px-2 bg-sky-950 hover:bg-sky-900 border border-sky-400 text-sky-200 font-pixel text-[9px] tracking-wider text-center transition-colors shadow-sm cursor-pointer">
            ↺ TRY ANOTHER FIT
          </button>
          <button id="btn-appeal-verdict" data-trial-id="${data.trial_id}" class="flex-1 py-1.5 px-2 bg-[#28221b] hover:bg-[#3d342a] border border-[#dfd0bc] text-[#fcf2e3] font-pixel text-[9px] tracking-wider text-center transition-colors shadow-sm cursor-pointer">
            ⚖️ FILE APPEAL
          </button>
        </div>
      </div>
    `;

    // Bind action buttons
    const tryAnotherBtn = document.getElementById('btn-try-another-fit');
    if (tryAnotherBtn) {
      tryAnotherBtn.addEventListener('click', resetUploadScreen);
    }

    const appealBtn = document.getElementById('btn-appeal-verdict');
    if (appealBtn) {
      appealBtn.addEventListener('click', async () => {
        playRetroBeep(480, 'square', 0.08);
        appealBtn.disabled = true;
        appealBtn.textContent = 'APPEALING...';

        try {
          const res = await apiRequest(`/trials/${data.trial_id}/appeal`, { method: 'POST' });
          playRetroBeep(res.is_overturned ? 740 : 220, 'sine', 0.2);

          const sentenceBox = interactiveContent.querySelector('.bg-\\[\\#17130e\\]\\/95');
          if (sentenceBox) {
            sentenceBox.innerHTML = `
              <span class="text-sky-300 font-pixel text-[9px] block mb-0.5">APPELLATE BENCH RULING:</span>
              ${res.appeal_note}
            `;
          }

          appealBtn.textContent = res.is_overturned ? '✓ APPEAL WON' : '✗ APPEAL REJECTED';
          appealBtn.className = res.is_overturned
            ? 'flex-1 py-1.5 px-2 bg-sky-900 border border-sky-400 text-white font-pixel text-[9px]'
            : 'flex-1 py-1.5 px-2 bg-red-950 border border-red-500 text-red-300 font-pixel text-[9px]';
        } catch (err) {
          appealBtn.disabled = false;
          appealBtn.textContent = 'RETRY APPEAL';
        }
      });
    }
  }

  function resetUploadScreen() {
    playRetroBeep(400, 'square', 0.04);
    if (interactiveContent && initialUploadHtml) {
      interactiveContent.innerHTML = initialUploadHtml;
      // Re-bind file upload input
      const newFileInput = document.getElementById('fit-photo-upload');
      if (newFileInput) {
        newFileInput.addEventListener('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            processUploadedFit(e.target.files[0]);
          }
        });
      }
    }
  }

  // ============================================
  // INITIALIZE ON PAGE LOAD
  // ============================================
  document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎮 StylU Backend Integration Loaded');
    await loadSettings();
    await loadWeekPlan();
    initUploadHandlers();
  });

  // Also run if DOM already loaded
  if (document.readyState === 'loading') {
    // Already set up above
  } else {
    (async () => {
      console.log('🎮 StylU Backend Integration Loaded');
      await loadSettings();
      await loadWeekPlan();
      initUploadHandlers();
    })();
  }

})();
