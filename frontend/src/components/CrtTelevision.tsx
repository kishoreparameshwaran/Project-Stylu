import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';

interface CrtTelevisionProps {
  isPowered: boolean;
  onTogglePower: () => void;
  channelIndex: number;
  judgeName: string;
  judgeAvatar?: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onChannelUp: () => void;
  onChannelDown: () => void;
  scanlinesEnabled?: boolean;
  onFileSelected?: (file: File) => void;
  onCameraClick?: () => void;
  onDemoFitClick?: () => void;
  onQuickModeClick?: () => void;
  children?: React.ReactNode;
}

export const CrtTelevision: React.FC<CrtTelevisionProps> = ({
  isPowered,
  onTogglePower,
  channelIndex,
  judgeName,
  judgeAvatar = '🥻',
  isMuted,
  onToggleMute,
  onChannelUp,
  onChannelDown,
  scanlinesEnabled = true,
  onFileSelected,
  onCameraClick,
  onDemoFitClick,
  onQuickModeClick,
  children,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [osdVisible, setOsdVisible] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Show On-Screen Display for 3 seconds on channel switch
  useEffect(() => {
    setOsdVisible(true);
    const timer = setTimeout(() => setOsdVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [channelIndex]);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isPowered) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('ERROR: PLEASE DROP A JPG, PNG, OR WEBP PHOTO');
      return;
    }
    const maxSize = 8 * 1024 * 1024; // 8MB
    if (file.size > maxSize) {
      setErrorMessage('ERROR: FILE TOO LARGE (MAX 8 MB)');
      return;
    }
    onFileSelected?.(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (!isPowered) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Clipboard paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isPowered) return;
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          validateAndProcessFile(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isPowered]);

  const handleScreenClick = () => {
    if (!isPowered) return;
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <section
      className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto my-2"
      aria-label="CRT Television Studio Display"
    >
      {/* Hidden file input for click-to-upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-hidden="true"
      />

      {/* Outer CRT Television Casing */}
      <div
        className={`w-full bg-[#78757E] crt-casing-bevel rounded-3xl p-3 sm:p-5 transition-all duration-300 relative border-4 border-[#5E5A64] ${
          isDragOver ? 'ring-4 ring-[#E8409C] shadow-[0_0_35px_#E8409C]' : ''
        }`}
      >
        {/* Top TV ventilation slots & model badge */}
        <div className="flex items-center justify-between px-3 pb-2 text-[10px] font-pixel-sub text-white/50 tracking-widest border-b border-black/20 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#3CC8D8] rounded-full inline-block" />
            <span className="font-pixel-title text-[9px] text-white/80">OUTFITRON 1988</span>
            <span className="hidden sm:inline">// MULTI-SCAN CRT</span>
          </div>
          {/* Top vents */}
          <div className="flex gap-1">
            <span className="w-3 h-1 bg-[#4E4B55] rounded-full inline-block" />
            <span className="w-3 h-1 bg-[#4E4B55] rounded-full inline-block" />
            <span className="w-3 h-1 bg-[#4E4B55] rounded-full inline-block" />
            <span className="w-3 h-1 bg-[#4E4B55] rounded-full inline-block" />
          </div>
        </div>

        {/* Recessed Bezel Frame surrounding the screen */}
        <div className="crt-bezel-frame rounded-2xl p-2.5 sm:p-3.5 border-2 border-black/40">
          {/* Curved Glass Screen Area */}
          <div
            onClick={children ? undefined : handleScreenClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full h-[460px] sm:h-[500px] max-h-[560px] crt-screen-glass rounded-xl relative overflow-hidden flex flex-col items-center justify-center select-none border-2 border-black transition-colors ${
              !isPowered ? 'bg-black' : ''
            } ${!children ? 'cursor-pointer' : ''}`}
            role={!children ? 'button' : undefined}
            tabIndex={!children ? 0 : undefined}
            onKeyDown={(e) => {
              if (!children && (e.key === 'Enter' || e.key === ' ')) {
                handleScreenClick();
              }
            }}
            aria-label="CRT screen drop zone. Click or press space to upload photo."
          >
            {/* Scanlines overlay (toggleable) */}
            {isPowered && scanlinesEnabled && (
              <div className="scanlines-fx absolute inset-0 z-10 pointer-events-none" />
            )}

            {/* Glass Glare reflection curve */}
            <div className="crt-reflection absolute inset-0 z-20 pointer-events-none" />

            {/* CRT Screen Content */}
            {!isPowered ? (
              // Power OFF State
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="w-2.5 h-2.5 bg-white/70 rounded-full animate-ping mb-2" />
                <span className="font-pixel-sub text-xs text-white/30 tracking-widest">
                  STANDBY // POWER OFF
                </span>
                <span className="font-pixel-sub text-[10px] text-white/20 mt-1">
                  PRESS POWER BUTTON BELOW TO ACTIVATE
                </span>
              </div>
            ) : children ? (
              // Active verdict or image state
              <div className="w-full h-full relative z-0 flex flex-col">{children}</div>
            ) : (
              // Idle Screen State
              <div className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-4 relative z-0">
                {/* On-Screen Display (OSD) in Phosphor Green */}
                {osdVisible && (
                  <div className="absolute top-2.5 left-2.5 bg-black/85 border border-[#13A862] px-2 py-0.5 text-xs font-pixel-sub text-[#13A862] flex items-center gap-1.5 shadow-[2px_2px_0px_#000] z-30">
                    <span>CH {String(channelIndex + 1).padStart(2, '0')}</span>
                    <span>//</span>
                    <span>{judgeName}</span>
                  </div>
                )}

                {/* Animated Static Noise Backdrop */}
                <div className="absolute inset-0 opacity-15 static-flicker pointer-events-none film-grain" />

                {/* Drop Target UI */}
                <div className="flex flex-col items-center text-center max-w-sm px-3 relative z-10">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 flex items-center justify-center mb-2 transition-transform ${
                      isDragOver
                        ? 'border-[#E8409C] bg-[#E8409C]/20 scale-110'
                        : 'border-[#3CC8D8] bg-[#1A0F24]/80'
                    }`}
                  >
                    <Icon
                      name={isDragOver ? 'zap' : 'upload'}
                      size={26}
                      className={isDragOver ? 'text-[#FFD93B]' : 'text-[#3CC8D8]'}
                    />
                  </div>

                  <p className="font-pixel-title text-xs sm:text-sm text-white tracking-widest blink-pixel mb-1">
                    {isDragOver ? '★ DROP IT NOW! ★' : 'INSERT OUTFIT PHOTO'}
                  </p>

                  <p className="font-pixel-body text-sm sm:text-base text-[#B9A6E8] leading-tight">
                    DRAG & DROP PHOTO OR TAP TO BROWSE
                  </p>

                  {/* Quick Action Pills inside Idle TV */}
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                    {onDemoFitClick && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDemoFitClick();
                        }}
                        className="px-2.5 py-1 bg-[#FFD93B] hover:bg-yellow-400 text-black text-[10px] font-pixel-sub font-bold border border-white shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1 active:translate-x-[1px] active:translate-y-[1px]"
                      >
                        <span>⚡ TEST DEMO FIT</span>
                      </button>
                    )}

                    {onQuickModeClick && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickModeClick();
                        }}
                        className="px-2.5 py-1 bg-[#1A0F24] hover:bg-[#261338] text-[#3CC8D8] text-[10px] font-pixel-sub border border-[#3CC8D8] shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1 active:translate-x-[1px] active:translate-y-[1px]"
                      >
                        <Icon name="shirt" size={12} className="text-[#3CC8D8]" />
                        <span>QUICK CHIPS</span>
                      </button>
                    )}

                    {onCameraClick && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCameraClick();
                        }}
                        className="px-2.5 py-1 bg-[#1A0F24] hover:bg-[#261338] text-white text-[10px] font-pixel-sub border border-[#E8409C] shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1 active:translate-x-[1px] active:translate-y-[1px]"
                      >
                        <Icon name="camera" size={12} className="text-[#FFD93B]" />
                        <span>CAMERA</span>
                      </button>
                    )}
                  </div>

                  {/* Format & Size constraint pill */}
                  <div className="mt-2.5 inline-flex items-center gap-2 text-[9px] font-pixel-sub text-white/50 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                    <span>JPG / PNG / WEBP</span>
                    <span>•</span>
                    <span>PASTE CLIPBOARD (CTRL+V)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message banner overlay */}
            {errorMessage && (
              <div className="absolute bottom-2 left-2 right-2 bg-[#E5243B] text-white text-xs font-pixel-sub p-1.5 text-center border-2 border-white shadow-[3px_3px_0px_#000] z-30 flex items-center justify-between">
                <span>{errorMessage}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setErrorMessage(null);
                  }}
                  className="ml-2 font-bold px-1 hover:bg-black/30 cursor-pointer"
                  aria-label="Dismiss error"
                >
                  [X]
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Hardware Controls Bar: The Four Physical Buttons */}
        <div className="mt-2.5 sm:mt-3 pt-2 border-t-2 border-[#585560] flex items-center justify-between gap-2 px-1">
          {/* Left speaker grille simulation */}
          <div className="hidden sm:flex flex-col gap-1 w-10">
            <span className="h-0.5 bg-[#4A4750] rounded-full" />
            <span className="h-0.5 bg-[#4A4750] rounded-full" />
            <span className="h-0.5 bg-[#4A4750] rounded-full" />
            <span className="h-0.5 bg-[#4A4750] rounded-full" />
          </div>

          {/* The Four Physical CRT Buttons */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mx-auto">
            {/* Button 1: POWER */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={onTogglePower}
                className="crt-hardware-btn w-9 h-7 sm:w-11 sm:h-8 rounded flex items-center justify-center cursor-pointer"
                title="Power On / Off"
                aria-label="Power button"
              >
                <Icon
                  name="power"
                  size={14}
                  className={isPowered ? 'text-[#13A862]' : 'text-white/60'}
                />
              </button>
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPowered
                      ? 'bg-[#13A862] shadow-[0_0_5px_#13A862]'
                      : 'bg-[#E5243B] shadow-[0_0_3px_#E5243B]'
                  }`}
                />
                <span className="text-[9px] font-pixel-sub text-white/70">PWR</span>
              </div>
            </div>

            {/* Button 2: CHANNEL DOWN */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={onChannelDown}
                disabled={!isPowered}
                className="crt-hardware-btn w-9 h-7 sm:w-11 sm:h-8 rounded flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous Judge Channel"
                aria-label="Channel Down"
              >
                <Icon name="chevron-down" size={14} className="text-[#3CC8D8]" />
              </button>
              <span className="text-[9px] font-pixel-sub text-white/70 mt-1">CH ▼</span>
            </div>

            {/* Button 3: CHANNEL UP */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={onChannelUp}
                disabled={!isPowered}
                className="crt-hardware-btn w-9 h-7 sm:w-11 sm:h-8 rounded flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next Judge Channel"
                aria-label="Channel Up"
              >
                <Icon name="chevron-up" size={14} className="text-[#3CC8D8]" />
              </button>
              <span className="text-[9px] font-pixel-sub text-white/70 mt-1">CH ▲</span>
            </div>

            {/* Button 4: VOLUME / MUTE */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={onToggleMute}
                disabled={!isPowered}
                className="crt-hardware-btn w-9 h-7 sm:w-11 sm:h-8 rounded flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Toggle Mute"
                aria-label="Mute button"
              >
                <Icon
                  name={isMuted ? 'volume-mute' : 'volume'}
                  size={14}
                  className={isMuted ? 'text-[#E5243B]' : 'text-[#FFD93B]'}
                />
              </button>
              <span className="text-[9px] font-pixel-sub text-white/70 mt-1">
                {isMuted ? 'MUTED' : 'VOL'}
              </span>
            </div>
          </div>

          {/* Right speaker grille simulation with Judge mini-avatar */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="text-lg select-none" title={judgeName}>
              {judgeAvatar}
            </span>
            <div className="flex flex-col gap-1 w-6">
              <span className="h-0.5 bg-[#4A4750] rounded-full" />
              <span className="h-0.5 bg-[#4A4750] rounded-full" />
              <span className="h-0.5 bg-[#4A4750] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
