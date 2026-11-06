import React from 'react';
import { Icon } from './Icon';

interface AiConsentBannerProps {
  onConsent: () => void;
  onDecline: () => void;
}

export const AiConsentBanner: React.FC<AiConsentBannerProps> = ({ onConsent, onDecline }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs font-pixel-body">
      <div className="w-full max-w-md bg-[#1A0F24] border-2 border-[#3CC8D8] shadow-pixel-lavender-lg p-4 sm:p-5 text-white space-y-3 panel-scanlines">
        <div className="flex items-center justify-between border-b-2 border-[#3CC8D8]/40 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#FFD93B]" />
            <h3 className="font-pixel-title text-xs sm:text-sm text-white uppercase">
              AI COURTROOM DATA POLICY
            </h3>
          </div>
          <button
            onClick={onDecline}
            className="text-xs font-pixel-sub text-[#E8409C] hover:text-white cursor-pointer"
          >
            [X]
          </button>
        </div>

        <div className="space-y-2 text-sm text-white/90 leading-relaxed">
          <p className="font-pixel-sub text-xs text-[#3CC8D8]">
            Before taking the fashion stand, please confirm:
          </p>
          <ul className="space-y-1 text-xs font-pixel-sub text-white/80 list-disc list-inside bg-[#261338] p-2.5 border border-[#3CC8D8]/40">
            <li>Photos are evaluated for clothing, silhouette, and colors only.</li>
            <li>EXIF metadata &amp; location are automatically stripped.</li>
            <li>We roast the clothes — NEVER your physical body, race, or identity.</li>
            <li>You can purge all docket records anytime from Settings.</li>
          </ul>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onDecline}
            className="py-1.5 px-3 bg-[#0E0716] hover:bg-[#201030] border border-white/30 text-white/70 font-pixel-sub text-xs cursor-pointer"
          >
            [ CANCEL ]
          </button>
          <button
            onClick={onConsent}
            className="flex-1 py-1.5 px-3 bg-[#13A862] hover:bg-emerald-500 text-white font-pixel-title text-xs border border-white shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px]"
          >
            <Icon name="check" size={12} />
            <span>I CONSENT // PROCEED</span>
          </button>
        </div>
      </div>
    </div>
  );
};
