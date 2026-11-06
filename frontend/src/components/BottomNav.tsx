import React from 'react';
import { Scale, FolderClock, Settings } from 'lucide-react';

export type NavTab = 'court' | 'cases' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  casesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  casesCount = 0,
}) => {
  const tabs = [
    { id: 'court' as const, label: 'Court', icon: Scale },
    { id: 'cases' as const, label: 'My Cases', icon: FolderClock, badge: casesCount > 0 ? casesCount : undefined },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FCFBF7] border-t-4 border-[#0B3A66] px-2 py-1.5 shadow-[0_-4px_10px_rgba(11,58,102,0.08)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 py-1 px-1 rounded-xl text-center relative transition-all duration-120 flex flex-col items-center justify-center ${
                isActive
                  ? 'text-[#0B3A66] font-black'
                  : 'text-gray-500 hover:text-[#0B3A66] font-semibold'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-[#9AD8FF] court-border-sm court-shadow-sm -translate-y-1' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#0B3A66] stroke-[2.5]' : ''}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 font-court-display uppercase">
                {tab.label}
              </span>
              {tab.badge !== undefined && (
                <span className="absolute top-0 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
