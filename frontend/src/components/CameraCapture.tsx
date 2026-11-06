import React, { useRef, useState, useEffect } from 'react';
import { Icon } from './Icon';
import { courtAudio } from '../utils/audio';

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob, previewUrl: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputFallbackRef = useRef<HTMLInputElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API unavailable in this browser context');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access unavailable:', err);
      setIsCameraActive(false);
      setCameraError('NO HARDWARE WEBCAM DETECTED OR PERMISSION NOT GRANTED');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const handleSnap = () => {
    courtAudio.playGavel();
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          stopCamera();
          onCapture(blob, previewUrl);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  // Generate a mock demo snapshot if hardware camera is not accessible
  const handleSnapDemoFit = () => {
    courtAudio.playGavel();
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw retro test pattern outfit silhouette
      ctx.fillStyle = '#0F2A38';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#E8409C';
      ctx.fillRect(220, 100, 200, 240);
      ctx.fillStyle = '#3CC8D8';
      ctx.fillRect(240, 240, 160, 200);
      ctx.font = 'bold 24px "Press Start 2P", monospace';
      ctx.fillStyle = '#FFD93B';
      ctx.textAlign = 'center';
      ctx.fillText('LIVE SNAPSHOT', canvas.width / 2, 80);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const previewUrl = URL.createObjectURL(blob);
        stopCamera();
        onCapture(blob, previewUrl);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleFallbackFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      stopCamera();
      onCapture(file, previewUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs font-pixel-body">
      <input
        type="file"
        ref={fileInputFallbackRef}
        onChange={handleFallbackFile}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      <div className="w-full max-w-lg bg-[#1A0F24] border-2 border-[#3CC8D8] shadow-pixel-lavender-lg p-4 sm:p-5 relative panel-scanlines">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3CC8D8]/40 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#E5243B] animate-ping" />
            <h3 className="font-pixel-title text-xs sm:text-sm text-white tracking-wider">
              OPTICAL FEED // CAMERA CAPTURE
            </h3>
          </div>
          <button
            onClick={() => {
              courtAudio.playClick();
              stopCamera();
              onClose();
            }}
            className="px-2 py-0.5 bg-[#261338] border border-[#E8409C] text-[#E8409C] hover:bg-[#E8409C] hover:text-white font-pixel-sub text-xs cursor-pointer"
          >
            [X] CLOSE
          </button>
        </div>

        {/* Video Viewport / Fallback View */}
        <div className="relative aspect-[4/3] bg-black border-2 border-white/20 rounded overflow-hidden flex items-center justify-center">
          {/* Scanlines overlay */}
          <div className="scanlines-fx absolute inset-0 z-10 pointer-events-none opacity-40" />

          {isCameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4 z-20">
              <Icon name="camera" size={32} className="text-[#FFD93B] mb-2" />
              <p className="font-pixel-title text-xs text-[#E5243B] mb-1">
                {cameraError || 'WEBCAM INACTIVE'}
              </p>
              <p className="text-xs font-pixel-sub text-[#B9A6E8] max-w-xs">
                No webcam detected or permissions restricted. You can snap a demo fit or select a photo from files:
              </p>

              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <button
                  type="button"
                  onClick={handleSnapDemoFit}
                  className="px-3 py-1.5 bg-[#FFD93B] text-black font-pixel-sub text-xs font-bold border border-white shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  ⚡ SNAP DEMO FIT
                </button>
                <button
                  type="button"
                  onClick={() => fileInputFallbackRef.current?.click()}
                  className="px-3 py-1.5 bg-[#3CC8D8] text-black font-pixel-sub text-xs font-bold border border-white shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  📁 BROWSE FROM FILES
                </button>
              </div>
            </div>
          )}

          {/* Crosshair guidelines on live video */}
          {isCameraActive && (
            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
              <div className="w-36 h-48 border border-white/30 rounded" />
              <div className="absolute top-2 left-2 text-[10px] font-pixel-sub text-[#13A862] bg-black/70 px-1.5 py-0.5 border border-[#13A862]">
                ● LIVE REC
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for capturing image */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 mt-3.5 pt-2 border-t border-white/10">
          {isCameraActive ? (
            <>
              <button
                type="button"
                onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
                className="px-2.5 py-1.5 bg-[#1A0F24] border border-[#3CC8D8] text-[#3CC8D8] text-xs font-pixel-sub cursor-pointer"
              >
                🔄 FLIP CAM
              </button>
              <button
                type="button"
                onClick={handleSnap}
                className="flex-grow py-2 bg-[#E8409C] hover:bg-[#ff4fa8] text-white font-pixel-title text-xs tracking-wider uppercase border border-white shadow-[3px_3px_0px_#B9A6E8] cursor-pointer"
              >
                📸 SNAP OUTFIT EVIDENCE
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              className="w-full py-2 bg-[#261338] hover:bg-[#341b4c] text-white font-pixel-sub text-xs border border-[#3CC8D8] cursor-pointer"
            >
              RETRY WEBCAM ACCESS
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
