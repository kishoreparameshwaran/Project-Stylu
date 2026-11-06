import React from 'react';
import { Icon } from './Icon';

interface PixelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  badge?: string;
  children: React.ReactNode;
}

export const PixelModal: React.FC<PixelModalProps> = ({
  isOpen,
  onClose,
  title,
  badge = 'COURT DOCKET',
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl bg-[#1A0F24] border-2 border-[#3CC8D8] shadow-pixel-lavender-lg p-4 sm:p-6 relative max-h-[90vh] flex flex-col panel-scanlines"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner bolts */}
        <span className="absolute top-1 left-1 w-2 h-2 bg-[#B9A6E8]" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-[#B9A6E8]" />
        <span className="absolute bottom-1 left-1 w-2 h-2 bg-[#B9A6E8]" />
        <span className="absolute bottom-1 right-1 w-2 h-2 bg-[#B9A6E8]" />

        {/* Modal Window Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3CC8D8]/40 pb-3 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#E8409C] border border-white" />
            <div>
              <span className="text-[10px] font-pixel-sub text-[#B9A6E8] tracking-widest block uppercase">
                {badge}
              </span>
              <h2 className="font-pixel-title text-sm sm:text-base text-white tracking-wider">
                {title}
              </h2>
            </div>
          </div>

          {/* Retro Close Button */}
          <button
            onClick={onClose}
            className="px-2 py-1 bg-[#261338] border border-[#E8409C] text-[#E8409C] hover:bg-[#E8409C] hover:text-white font-pixel-sub text-xs shadow-[2px_2px_0px_#B9A6E8] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1"
            aria-label="Close dialog"
          >
            <Icon name="x" size={12} />
            <span>CLOSE</span>
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="overflow-y-auto flex-grow pr-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
