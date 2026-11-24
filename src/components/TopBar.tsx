import React, { useState } from 'react';
import { Menu, Plus, X } from 'lucide-react';
import { ScreenId } from '../types';

interface TopBarProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onOpenQuickCreate: () => void;
  timerRunning: boolean;
  timerDisplay: string;
}

const NAV_ITEMS: { id: ScreenId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'focus', label: 'Focus Studio' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'notebook', label: 'Notebook' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeScreen,
  onSelectScreen,
  onOpenQuickCreate,
  timerRunning,
  timerDisplay,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: ScreenId) => {
    onSelectScreen(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F4F1EA] border-b border-[#D8D3C8]">
      <div className="max-w-[1360px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('today')}
          className="font-editorial text-[22px] font-medium tracking-[-0.015em] text-[#20211F] whitespace-nowrap shrink-0 hover:text-[#994618] transition-colors duration-150"
        >
          MOMENTUM
        </button>

        {/* Zone 2: Desktop Navigation Links */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-5 text-[14px] whitespace-nowrap shrink-0 transition-colors duration-150 ${
                  isActive
                    ? 'text-[#20211F] font-medium'
                    : 'text-[#55433B] hover:text-[#20211F] font-normal'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'focus' && timerRunning && (
                  <span className="ml-2 font-mono text-[12px] tabular-nums text-[#994618]">
                    {timerDisplay}
                  </span>
                )}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#994618]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenQuickCreate}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] bg-[#994618] hover:bg-[#7A3000] text-[#F4F1EA] text-[13px] font-medium tracking-[0.02em] rounded-[4px] whitespace-nowrap shrink-0 transition-colors duration-150"
          >
            <Plus className="w-4 h-4" strokeWidth={1.75} />
            <span>New Entry</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 border border-[#D8D3C8] rounded-[4px] text-[#20211F] hover:bg-[#E8E4DA] transition-colors duration-150"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[#D8D3C8] bg-[#F4F1EA] px-4 py-2"
        >
          <div className="flex flex-col divide-y divide-[#D8D3C8]">
            {NAV_ITEMS.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center justify-between py-3 min-h-[44px] text-left text-[15px] whitespace-nowrap ${
                    isActive ? 'text-[#994618] font-medium' : 'text-[#20211F]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.id === 'focus' && timerRunning && (
                    <span className="font-mono text-[13px] tabular-nums text-[#994618]">
                      {timerDisplay}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
};
