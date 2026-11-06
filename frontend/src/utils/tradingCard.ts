import type { VerdictResponse } from '../types/court';
import { JUDGE_PERSONAS } from '../data/personas';

/**
 * Generates an 8-bit retro trading card image of the court verdict and triggers a browser download.
 */
export const downloadVerdictTradingCard = (
  verdict: VerdictResponse,
  photoUrl?: string | null
): Promise<void> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve();

    // Background: Dark Plum & Marbled Tie-dye
    ctx.fillStyle = '#1A0F24';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer border with cyan & lavender hard shadow
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#3CC8D8';
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    // Inner panel
    ctx.fillStyle = '#261338';
    ctx.fillRect(28, 28, canvas.width - 56, canvas.height - 56);

    // Top Title Bar
    ctx.fillStyle = '#E8409C';
    ctx.fillRect(28, 28, canvas.width - 56, 50);

    ctx.font = 'bold 20px "Press Start 2P", monospace, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('OUTFIT COURT // VERDICT', canvas.width / 2, 60);

    // Mini TV Photo Frame or Gavel Graphic
    ctx.fillStyle = '#090B10';
    ctx.strokeStyle = '#B9A6E8';
    ctx.lineWidth = 4;
    ctx.fillRect(60, 100, canvas.width - 120, 260);
    ctx.strokeRect(60, 100, canvas.width - 120, 260);

    const renderContent = (img?: HTMLImageElement) => {
      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(60, 100, canvas.width - 120, 260);
        ctx.clip();
        ctx.drawImage(img, 60, 100, canvas.width - 120, 260);
        ctx.restore();
      } else {
        // Fallback pixel art icon inside TV
        ctx.font = '72px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(verdict.verdict === 'GUILTY' ? '🚨' : '👑', canvas.width / 2, 250);
      }

      // Scanline overlay on image
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let y = 100; y < 360; y += 4) {
        ctx.fillRect(60, y, canvas.width - 120, 2);
      }

      // Case info banner
      ctx.font = 'bold 16px "Press Start 2P", monospace, sans-serif';
      ctx.fillStyle = '#3CC8D8';
      ctx.textAlign = 'left';
      ctx.fillText(verdict.case_number, 60, 395);

      ctx.font = '18px "VT323", monospace, sans-serif';
      ctx.fillStyle = '#FFD93B';
      ctx.fillText(`DEFENDANT: ${verdict.defendant_name}`, 60, 420);

      const judge = JUDGE_PERSONAS.find((j) => j.id === verdict.judge_id) || JUDGE_PERSONAS[0];
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`PRESIDING JUDGE: ${judge.name} (${judge.title})`, 60, 445);

      // STAMP
      ctx.save();
      ctx.translate(canvas.width - 160, 420);
      ctx.rotate(verdict.verdict === 'GUILTY' ? -0.15 : 0.15);
      ctx.fillStyle = verdict.verdict === 'GUILTY' ? '#E5243B' : '#13A862';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.fillRect(-80, -25, 160, 50);
      ctx.strokeRect(-80, -25, 160, 50);
      ctx.font = 'bold 18px "Press Start 2P", monospace, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(verdict.verdict, 0, 8);
      ctx.restore();

      // Fit score box
      ctx.fillStyle = '#1A0F24';
      ctx.strokeStyle = '#FFD93B';
      ctx.lineWidth = 2;
      ctx.fillRect(60, 465, canvas.width - 120, 60);
      ctx.strokeRect(60, 465, canvas.width - 120, 60);

      ctx.font = 'bold 14px "Press Start 2P", monospace, sans-serif';
      ctx.fillStyle = '#FFD93B';
      ctx.textAlign = 'left';
      ctx.fillText(`FIT SCORE: ${verdict.fit_score}/10`, 80, 502);

      // Sentence text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px "VT323", monospace, sans-serif';
      const sentenceText = `"${verdict.sentence}"`;
      ctx.fillText(sentenceText.slice(0, 55), 60, 555);
      if (sentenceText.length > 55) {
        ctx.fillText(sentenceText.slice(55, 110), 60, 575);
      }

      // Charges
      ctx.fillStyle = '#3CC8D8';
      ctx.font = 'bold 12px "Press Start 2P", monospace, sans-serif';
      ctx.fillText('CHARGES & EVIDENCE:', 60, 615);

      ctx.fillStyle = '#EADECA';
      ctx.font = '16px "VT323", monospace, sans-serif';
      verdict.charges.slice(0, 3).forEach((charge, i) => {
        ctx.fillText(`• ${charge.slice(0, 58)}`, 60, 640 + i * 22);
      });

      // Footer
      ctx.fillStyle = '#B9A6E8';
      ctx.font = '12px "Press Start 2P", monospace, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OUTFIT COURT TRADING CARD © 1988', canvas.width / 2, 755);

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `OutfitCourt_${verdict.case_number}.png`;
      link.href = dataUrl;
      link.click();
      resolve();
    };

    if (photoUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => renderContent(img);
      img.onerror = () => renderContent();
      img.src = photoUrl;
    } else {
      renderContent();
    }
  });
};
