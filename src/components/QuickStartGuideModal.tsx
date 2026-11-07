/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface QuickStartGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  onNavigateSection: (sec: string) => void;
}

export const QuickStartGuideModal: React.FC<QuickStartGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenSearch,
  onNavigateSection,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative bg-[#0d172b] border border-[#22355e] rounded-xl max-w-3xl w-full p-6 shadow-2xl text-[#dce5f5]">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1b2c4e]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4f8df9] animate-pulse" />
              <h2 className="text-lg font-bold text-[#f0f4fc]">
                Application Purpose & Shortest Quick-Start Guide
              </h2>
            </div>
            <p className="text-xs text-[#8ea4c7] mt-1">
              What this app is, why it exists, and how to use it in 60 seconds to maximize net-of-tax profit.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8ea4c7] hover:text-[#f0f4fc] p-1.5 rounded-lg hover:bg-[#182847] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Core Purpose Statement Box */}
        <div className="my-4 p-4 rounded-xl bg-gradient-to-r from-[#111f3d] to-[#0c182e] border border-[#253b66] space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#4f8df9] uppercase">
            <span>🎯 Core Mission & Purpose:</span>
            <span className="text-[#2dd4a7]">AI Quant Desk + Net-Profit Defense Terminal</span>
          </div>
          <p className="text-xs text-[#f0f4fc] leading-relaxed">
            This is <strong>both an institutional AI algorithmic trading terminal and a quantitative classroom</strong>. Most retail traders lose money not because of bad charts, but because of <strong>hidden broker fees, government turnover taxes (STT/SEC), and emotional overtrading</strong>.
          </p>
          <p className="text-xs text-[#8ea4c7] leading-relaxed">
            This app acts as your <strong>Pre-Trade Gatekeeper</strong>: it models your true post-tax break-even price, verifies statistical asymmetry ($\ge 2:1$ net R:R), bounds risk strictly under $\le 1.0\%$ of capital, and audits your setups with <strong>Gemini 3.8 Flash</strong> before you risk a single dollar.
          </p>
        </div>

        {/* 4-Step Shortest Workflow Guide */}
        <div className="space-y-3 my-4">
          <h3 className="text-xs font-bold text-[#f0f4fc] uppercase font-mono tracking-wider">
            ⚡ The 4-Step Fast Profit Protocol:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Step 1 */}
            <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#4f8df9]">Step 1: Pick an Asset</span>
                <span className="text-[10px] text-[#7a8fae] font-mono">01 / 04</span>
              </div>
              <p className="text-[#8ea4c7] text-[11px] leading-relaxed">
                Click <strong>"🔍 Search Any Stock / Asset"</strong> in the top navigation or click on any card in the <strong>"High-Expectancy Active Opportunities"</strong> section (Equities, Options, Futures, Forex).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#ffd60a]">Step 2: Check Fee Shield</span>
                <span className="text-[10px] text-[#7a8fae] font-mono">02 / 04</span>
              </div>
              <p className="text-[#8ea4c7] text-[11px] leading-relaxed">
                Look at the <strong>Fee Shield Calculator</strong> and the yellow Break-Even line on the chart. Never take a trade unless your profit target has enough runway to comfortably clear taxes and commissions by at least 2:1.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#2dd4a7]">Step 3: AI Radar Audit</span>
                <span className="text-[10px] text-[#7a8fae] font-mono">03 / 04</span>
              </div>
              <p className="text-[#8ea4c7] text-[11px] leading-relaxed">
                Inspect the <strong>AI Algorithmic Radar &amp; Sentiment Gauge</strong>. Click <strong>"🤖 Audit with AI (Gemini)"</strong>. If the pre-trade gatekeeper says <span className="text-[#ff6b6b] font-bold">BLOCKED</span>, skip the trade. If <span className="text-[#2dd4a7] font-bold">APPROVED</span>, your edge is validated.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#c084fc]">Step 4: Execute &amp; Journal</span>
                <span className="text-[10px] text-[#7a8fae] font-mono">04 / 04</span>
              </div>
              <p className="text-[#8ea4c7] text-[11px] leading-relaxed">
                Use the <strong>"💾 Log to Cloud SQL"</strong> button to save verified setups into your encrypted PostgreSQL database journal, or open <strong>"Broker APIs &amp; Sandboxes"</strong> to connect paper/live trading keys.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1b2c4e]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#4f8df9] hover:bg-[#6099fa] text-[#080d19] transition-all cursor-pointer"
            >
              🔍 Open Asset Search
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigateSection('opportunities');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#193229] hover:bg-[#204a3e] text-[#2dd4a7] border border-[#204a3e] transition-all cursor-pointer"
            >
              ⚡ View High-Expectancy Setups
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#182847] hover:bg-[#22355e] text-[#f0f4fc] cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
