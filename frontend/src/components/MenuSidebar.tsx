import React from 'react';
import { Icon, type IconName } from './Icon';

export interface MenuItemData {
  id: string;
  num: string;
  title: string;
  sublabel: string;
  icon: IconName;
}

export const MENU_ITEMS: MenuItemData[] = [
  {
    id: 'trial',
    num: '01',
    title: 'START TRIAL',
    sublabel: 'drop your outfit',
    icon: 'upload',
  },
  {
    id: 'judge',
    num: '02',
    title: 'PICK A JUDGE',
    sublabel: 'choose your style critic',
    icon: 'gavel',
  },
  {
    id: 'cases',
    num: '03',
    title: 'MY CASES',
    sublabel: 'your past verdicts',
    icon: 'scales',
  },
  {
    id: 'settings',
    num: '04',
    title: 'SETTINGS',
    sublabel: 'sound, language, data',
    icon: 'settings',
  },
  {
    id: 'about',
    num: '05',
    title: 'ABOUT STYLU',
    sublabel: 'app mission & AI tribunal',
    icon: 'star',
  },
  {
    id: 'contact',
    num: '06',
    title: 'CONTACT US',
    sublabel: '8248049524 // 12kishore47',
    icon: 'zap',
  },
];

interface MenuSidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
}

export const MenuSidebar: React.FC<MenuSidebarProps> = ({ activeId, onSelect }) => {
  return (
    <nav className="w-full lg:w-72 xl:w-80 flex-shrink-0" aria-label="Main Court Menu">
      <ul className="flex flex-col gap-2.5">
        {MENU_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => onSelect(item.id)}
                className={`w-full text-left p-2.5 sm:p-3 pixel-menu-btn cursor-pointer ${
                  isActive ? 'active' : ''
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Pink Number badge */}
                    <span className="font-pixel-title text-xs sm:text-sm text-[#E8409C] bg-[#2A1538] px-1.5 py-0.5 border border-[#E8409C]/40">
                      {item.num}
                    </span>

                    {/* Button Title */}
                    <span className="font-pixel-title text-xs sm:text-[13px] text-white tracking-wider group-hover:text-[#3CC8D8]">
                      {item.title}
                    </span>
                  </div>

                  {/* Pixel Icon */}
                  <Icon
                    name={item.icon}
                    size={14}
                    className={isActive ? 'text-[#FFD93B]' : 'text-[#3CC8D8]'}
                  />
                </div>

                {/* Tiny sub-label underneath */}
                <div className="mt-1 pl-8 text-xs font-pixel-sub text-[#B9A6E8] tracking-wide">
                  {item.sublabel}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
