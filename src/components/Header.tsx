/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MarketProfile } from '../types/quant';
import { AuthButton } from './AuthButton';
import { User } from 'firebase/auth';
import { LiveDataFeedIndicator } from './LiveDataFeedIndicator';

interface HeaderProps {
  currentMarket: MarketProfile;
  onSelectMarket: (marketId: any) => void;
  onOpenBrokerModal: () => void;
  onOpenGlossaryModal: () => void;
  onOpenSearchModal: () => void;
  onOpenQuickGuideModal: () => void;
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
  onAuthChange?: (user: User | null, token: string | null) => void;
  onOpenJournal?: () => void;
  isLiveFeedEnabled: boolean;
  onToggleLiveFeed: (enabled: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMarket,
  onSelectMarket,
  onOpenBrokerModal,
  onOpenGlossaryModal,
  onOpenSearchModal,
  onOpenQuickGuideModal,
  activeSection,
  onNavigateSection,
  onAuthChange,
  onOpenJournal,
  isLiveFeedEnabled,
  onToggleLiveFeed,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#080d19]/95 backdrop-blur border-b border-[#1c2c4d] px-6 py-3.5 flex items-center justify-between gap-8">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection('matrix');
          }}
          className="text-lg font-bold tracking-tight text-[#f0f4fc] whitespace-nowrap"
        >
          Quant Desk <span className="text-[#4f8df9] font-normal">Classroom</span>
        </a>
      </div>

      {/* Zone 2: Clean single-line navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#8ea4c7]">
        <button
          onClick={() => onNavigateSection('matrix')}
          className={`whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'matrix' ? 'text-[#f0f4fc] font-semibold underline underline-offset-8 decoration-[#4f8df9]' : 'hover:text-[#f0f4fc]'
          }`}
        >
          Quant Engine Matrix
        </button>
        <button
          onClick={() => onNavigateSection('liquidity')}
          className={`whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'liquidity' ? 'text-[#f0f4fc] font-semibold underline underline-offset-8 decoration-[#2dd4a7]' : 'hover:text-[#f0f4fc]'
          }`}
        >
          Liquidity Stage (V.A.M.P.)
        </button>
        <button
          onClick={() => onNavigateSection('cars')}
          className={`whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'cars' ? 'text-[#f0f4fc] font-semibold underline underline-offset-8 decoration-[#ffd60a]' : 'hover:text-[#f0f4fc]'
          }`}
        >
          C.A.R.S. Dictionary
        </button>
        <button
          onClick={() => onNavigateSection('playbooks')}
          className={`whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'playbooks' ? 'text-[#f0f4fc] font-semibold underline underline-offset-8 decoration-[#2dd4a7]' : 'hover:text-[#f0f4fc]'
          }`}
        >
          Master Playbooks
        </button>
        <button
          onClick={() => onNavigateSection('opportunities')}
          className={`whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'opportunities' ? 'text-[#2dd4a7] font-semibold underline underline-offset-8 decoration-[#2dd4a7]' : 'hover:text-[#2dd4a7]'
          }`}
        >
          ⚡ High-Expectancy Setups
        </button>
        <button
          onClick={() => onNavigateSection('macro')}
          className={`whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'macro' ? 'text-[#ffd60a] font-semibold underline underline-offset-8 decoration-[#ffd60a]' : 'hover:text-[#ffd60a]'
          }`}
        >
          🏛️ Macro Context
        </button>
        <button
          onClick={() => onNavigateSection('correlation')}
          className={`whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'correlation' ? 'text-[#f0f4fc] font-semibold underline underline-offset-8 decoration-[#4f8df9]' : 'hover:text-[#f0f4fc]'
          }`}
        >
          Correlation Matrix
        </button>
        <button
          onClick={() => onNavigateSection('feeshield')}
          className={`whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'feeshield' ? 'text-[#f0f4fc] font-semibold underline underline-offset-8 decoration-[#ffd60a]' : 'hover:text-[#f0f4fc]'
          }`}
        >
          Fee Shield Calculator
        </button>
      </nav>

      {/* Zone 3: Actions & Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Search Stock / Asset Trigger Button */}
        <button
          onClick={onOpenSearchModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#f0f4fc] bg-[#142340] hover:bg-[#1c325c] border border-[#233860] hover:border-[#4f8df9] rounded-lg transition-all whitespace-nowrap cursor-pointer shadow-sm"
          title="Search any specific stock, index futures, options strike, or forex pair"
        >
          <span className="text-sm">🔍</span>
          <span>Search Ticker / Asset</span>
        </button>

        {/* Shortest Quick Start Guide */}
        <button
          onClick={onOpenQuickGuideModal}
          className="px-2.5 py-1.5 text-xs font-semibold text-[#ffd60a] bg-[#221c10] hover:bg-[#332a18] border border-[#4d401e] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          title="How to use this terminal & 60-second profit guide"
        >
          ❓ How to Use (60s Guide)
        </button>

        {/* Market Selector */}
        <div className="hidden xl:flex items-center bg-[#0d172b] border border-[#22345a] rounded-lg p-0.5 text-xs">
          <button
            onClick={() => onSelectMarket('in')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              currentMarket.id === 'in' ? 'bg-[#1b2d52] text-[#f0f4fc] font-semibold shadow-sm' : 'text-[#8ea4c7] hover:text-[#f0f4fc]'
            }`}
            title="India: NSE/BSE Equities (₹)"
          >
            ₹ India (NSE)
          </button>
          <button
            onClick={() => onSelectMarket('us')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              currentMarket.id === 'us' ? 'bg-[#1b2d52] text-[#f0f4fc] font-semibold shadow-sm' : 'text-[#8ea4c7] hover:text-[#f0f4fc]'
            }`}
            title="US: NYSE/NASDAQ Equities ($)"
          >
            $ US Equities
          </button>
          <button
            onClick={() => onSelectMarket('global')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              currentMarket.id === 'global' ? 'bg-[#1b2d52] text-[#f0f4fc] font-semibold shadow-sm' : 'text-[#8ea4c7] hover:text-[#f0f4fc]'
            }`}
            title="Global Markets: ING Dom Maklerskie / GPW (zł)"
          >
            zł Global / ING DM
          </button>
        </div>

        {/* Plain English Guide Modal Trigger */}
        <button
          onClick={onOpenGlossaryModal}
          className="px-3 py-1.5 text-xs font-medium text-[#c0d0ee] bg-[#142038] hover:bg-[#1b2c4e] border border-[#23355b] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          Concepts & Guide
        </button>

        {/* Auth & PostgreSQL Trade Journal */}
        <AuthButton onAuthChange={onAuthChange} onOpenJournal={onOpenJournal} />

        {/* Live Data Feed Status Indicator (Top Right) */}
        <LiveDataFeedIndicator
          isLiveFeedEnabled={isLiveFeedEnabled}
          onToggleLiveFeed={onToggleLiveFeed}
          marketRegion={currentMarket.country}
        />

        {/* Primary Action: Broker APIs */}
        <button
          onClick={onOpenBrokerModal}
          className="px-3.5 py-1.5 text-xs font-semibold text-[#091122] bg-[#2dd4a7] hover:bg-[#34e2b3] rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
        >
          Broker APIs & Sandboxes
        </button>
      </div>
    </header>
  );
};
