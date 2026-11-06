import React from 'react';

export type IconName =
  | 'upload'
  | 'camera'
  | 'shirt'
  | 'shoes'
  | 'gavel'
  | 'scales'
  | 'trophy'
  | 'star'
  | 'heart'
  | 'share'
  | 'settings'
  | 'volume'
  | 'volume-mute'
  | 'power'
  | 'user'
  | 'tv'
  | 'chevron-up'
  | 'chevron-down'
  | 'zap'
  | 'check'
  | 'x';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({ name, size = 16, className = '', style }) => {
  const pixelStyle: React.CSSProperties = {
    imageRendering: 'pixelated',
    display: 'inline-block',
    verticalAlign: 'middle',
    flexShrink: 0,
    ...style,
  };

  const renderPath = () => {
    switch (name) {
      case 'upload':
        return (
          <>
            {/* Arrow up */}
            <rect x="7" y="1" width="2" height="2" fill="currentColor" />
            <rect x="5" y="3" width="6" height="2" fill="currentColor" />
            <rect x="3" y="5" width="10" height="2" fill="currentColor" />
            <rect x="7" y="7" width="2" height="5" fill="currentColor" />
            {/* Tray */}
            <rect x="1" y="10" width="2" height="5" fill="currentColor" />
            <rect x="13" y="10" width="2" height="5" fill="currentColor" />
            <rect x="1" y="13" width="14" height="2" fill="currentColor" />
          </>
        );

      case 'camera':
        return (
          <>
            <rect x="6" y="2" width="4" height="2" fill="currentColor" />
            <rect x="2" y="4" width="12" height="10" fill="currentColor" />
            <rect x="4" y="6" width="8" height="6" fill="#1A0F24" />
            <rect x="6" y="8" width="4" height="2" fill="currentColor" />
            <rect x="11" y="5" width="2" height="1" fill="#FFD93B" />
          </>
        );

      case 'shirt':
        return (
          <>
            <rect x="4" y="2" width="8" height="2" fill="currentColor" />
            <rect x="1" y="4" width="4" height="4" fill="currentColor" />
            <rect x="11" y="4" width="4" height="4" fill="currentColor" />
            <rect x="3" y="4" width="10" height="10" fill="currentColor" />
            <rect x="7" y="2" width="2" height="3" fill="#1A0F24" />
          </>
        );

      case 'shoes':
        return (
          <>
            <rect x="2" y="7" width="4" height="5" fill="currentColor" />
            <rect x="4" y="9" width="10" height="3" fill="currentColor" />
            <rect x="1" y="12" width="14" height="2" fill="currentColor" />
            <rect x="3" y="8" width="3" height="2" fill="#3CC8D8" />
          </>
        );

      case 'gavel':
        return (
          <>
            <rect x="4" y="2" width="8" height="4" fill="currentColor" />
            <rect x="7" y="6" width="2" height="8" fill="currentColor" />
            <rect x="2" y="13" width="12" height="2" fill="#E8409C" />
          </>
        );

      case 'scales':
        return (
          <>
            <rect x="7" y="1" width="2" height="14" fill="currentColor" />
            <rect x="2" y="3" width="12" height="2" fill="currentColor" />
            {/* Left pan */}
            <rect x="2" y="5" width="1" height="4" fill="currentColor" />
            <rect x="4" y="5" width="1" height="4" fill="currentColor" />
            <rect x="1" y="9" width="5" height="2" fill="#3CC8D8" />
            {/* Right pan */}
            <rect x="11" y="5" width="1" height="4" fill="currentColor" />
            <rect x="13" y="5" width="1" height="4" fill="currentColor" />
            <rect x="10" y="9" width="5" height="2" fill="#E8409C" />
            {/* Base */}
            <rect x="4" y="13" width="8" height="2" fill="currentColor" />
          </>
        );

      case 'trophy':
        return (
          <>
            <rect x="4" y="2" width="8" height="6" fill="#FFD93B" />
            <rect x="2" y="3" width="2" height="4" fill="#FFD93B" />
            <rect x="12" y="3" width="2" height="4" fill="#FFD93B" />
            <rect x="7" y="8" width="2" height="3" fill="currentColor" />
            <rect x="5" y="11" width="6" height="3" fill="#E8409C" />
          </>
        );

      case 'star':
        return (
          <>
            <rect x="7" y="1" width="2" height="2" fill="#FFD93B" />
            <rect x="6" y="3" width="4" height="3" fill="#FFD93B" />
            <rect x="1" y="6" width="14" height="3" fill="#FFD93B" />
            <rect x="4" y="9" width="8" height="3" fill="#FFD93B" />
            <rect x="2" y="12" width="3" height="3" fill="#FFD93B" />
            <rect x="11" y="12" width="3" height="3" fill="#FFD93B" />
          </>
        );

      case 'heart':
        return (
          <>
            <rect x="3" y="3" width="4" height="3" fill="#E8409C" />
            <rect x="9" y="3" width="4" height="3" fill="#E8409C" />
            <rect x="2" y="5" width="12" height="4" fill="#E8409C" />
            <rect x="4" y="9" width="8" height="3" fill="#E8409C" />
            <rect x="7" y="12" width="2" height="2" fill="#E8409C" />
          </>
        );

      case 'share':
        return (
          <>
            <rect x="11" y="2" width="3" height="3" fill="#3CC8D8" />
            <rect x="2" y="7" width="3" height="3" fill="#3CC8D8" />
            <rect x="11" y="11" width="3" height="3" fill="#3CC8D8" />
            <rect x="5" y="6" width="6" height="2" fill="currentColor" />
            <rect x="5" y="9" width="6" height="2" fill="currentColor" />
          </>
        );

      case 'settings':
        return (
          <>
            <rect x="6" y="1" width="4" height="2" fill="currentColor" />
            <rect x="6" y="13" width="4" height="2" fill="currentColor" />
            <rect x="1" y="6" width="2" height="4" fill="currentColor" />
            <rect x="13" y="6" width="2" height="4" fill="currentColor" />
            <rect x="4" y="4" width="8" height="8" fill="currentColor" />
            <rect x="6" y="6" width="4" height="4" fill="#1A0F24" />
          </>
        );

      case 'volume':
        return (
          <>
            <rect x="2" y="6" width="3" height="4" fill="currentColor" />
            <rect x="5" y="4" width="3" height="8" fill="currentColor" />
            <rect x="10" y="5" width="2" height="2" fill="#3CC8D8" />
            <rect x="12" y="3" width="2" height="2" fill="#3CC8D8" />
            <rect x="10" y="9" width="2" height="2" fill="#3CC8D8" />
            <rect x="12" y="11" width="2" height="2" fill="#3CC8D8" />
          </>
        );

      case 'volume-mute':
        return (
          <>
            <rect x="2" y="6" width="3" height="4" fill="currentColor" />
            <rect x="5" y="4" width="3" height="8" fill="currentColor" />
            <rect x="10" y="6" width="2" height="2" fill="#E5243B" />
            <rect x="13" y="9" width="2" height="2" fill="#E5243B" />
            <rect x="10" y="9" width="2" height="2" fill="#E5243B" />
            <rect x="13" y="6" width="2" height="2" fill="#E5243B" />
          </>
        );

      case 'power':
        return (
          <>
            <rect x="7" y="1" width="2" height="6" fill="#E8409C" />
            <rect x="4" y="3" width="2" height="3" fill="currentColor" />
            <rect x="10" y="3" width="2" height="3" fill="currentColor" />
            <rect x="2" y="6" width="2" height="6" fill="currentColor" />
            <rect x="12" y="6" width="2" height="6" fill="currentColor" />
            <rect x="4" y="12" width="8" height="2" fill="currentColor" />
          </>
        );

      case 'user':
        return (
          <>
            <rect x="6" y="2" width="4" height="4" fill="currentColor" />
            <rect x="4" y="7" width="8" height="2" fill="currentColor" />
            <rect x="2" y="9" width="12" height="5" fill="currentColor" />
          </>
        );

      case 'tv':
        return (
          <>
            <rect x="4" y="1" width="2" height="2" fill="currentColor" />
            <rect x="10" y="1" width="2" height="2" fill="currentColor" />
            <rect x="1" y="3" width="14" height="11" fill="currentColor" />
            <rect x="3" y="5" width="8" height="7" fill="#1A0F24" />
            <rect x="12" y="5" width="2" height="2" fill="#3CC8D8" />
            <rect x="12" y="8" width="2" height="2" fill="#E8409C" />
          </>
        );

      case 'chevron-up':
        return (
          <>
            <rect x="7" y="4" width="2" height="2" fill="currentColor" />
            <rect x="5" y="6" width="6" height="2" fill="currentColor" />
            <rect x="3" y="8" width="10" height="2" fill="currentColor" />
          </>
        );

      case 'chevron-down':
        return (
          <>
            <rect x="3" y="6" width="10" height="2" fill="currentColor" />
            <rect x="5" y="8" width="6" height="2" fill="currentColor" />
            <rect x="7" y="10" width="2" height="2" fill="currentColor" />
          </>
        );

      case 'zap':
        return (
          <>
            <rect x="8" y="1" width="3" height="4" fill="#FFD93B" />
            <rect x="5" y="5" width="7" height="3" fill="#FFD93B" />
            <rect x="3" y="8" width="5" height="2" fill="#FFD93B" />
            <rect x="4" y="10" width="3" height="2" fill="#FFD93B" />
            <rect x="5" y="12" width="2" height="3" fill="#FFD93B" />
          </>
        );

      case 'check':
        return (
          <>
            <rect x="11" y="4" width="2" height="2" fill="#13A862" />
            <rect x="9" y="6" width="2" height="2" fill="#13A862" />
            <rect x="7" y="8" width="2" height="2" fill="#13A862" />
            <rect x="5" y="6" width="2" height="2" fill="#13A862" />
            <rect x="3" y="4" width="2" height="2" fill="#13A862" />
          </>
        );

      case 'x':
        return (
          <>
            <rect x="3" y="3" width="2" height="2" fill="#E5243B" />
            <rect x="11" y="3" width="2" height="2" fill="#E5243B" />
            <rect x="5" y="5" width="2" height="2" fill="#E5243B" />
            <rect x="9" y="5" width="2" height="2" fill="#E5243B" />
            <rect x="7" y="7" width="2" height="2" fill="#E5243B" />
            <rect x="5" y="9" width="2" height="2" fill="#E5243B" />
            <rect x="9" y="9" width="2" height="2" fill="#E5243B" />
            <rect x="3" y="11" width="2" height="2" fill="#E5243B" />
            <rect x="11" y="11" width="2" height="2" fill="#E5243B" />
          </>
        );

      default:
        return <rect x="2" y="2" width="12" height="12" fill="currentColor" />;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={pixelStyle}
      aria-hidden="true"
    >
      {renderPath()}
    </svg>
  );
};
