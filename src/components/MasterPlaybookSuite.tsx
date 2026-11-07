/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MASTER_PLAYBOOKS } from '../data/masterPlaybooks';
import { MasterTraderPlaybook, MasterTraderId } from '../types/quant';
import { Tooltip } from './Tooltip';

interface MasterPlaybookSuiteProps {
  onSelectPlaybook?: (playbook: MasterTraderPlaybook) => void;
}

export const MasterPlaybookSuite: React.FC<MasterPlaybookSuiteProps> = ({
  onSelectPlaybook,
}) => {
  const [selectedId, setSelectedId] = useState<MasterTraderId>('wyckoff');
  const activePlaybook = MASTER_PLAYBOOKS.find((p) => p.id === selectedId) || MASTER_PLAYBOOKS[0];

  const handleSelect = (p: MasterTraderPlaybook) => {
    setSelectedId(p.id);
    if (onSelectPlaybook) {
      onSelectPlaybook(p);
    }
  };

  return (
    <div className="bg-[#0d172b] border border-[#1e2f52] rounded-xl p-5 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#182847]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-[#f0f4fc]">
              5. Universal Master Trader Playbook Suite
            </h2>
            <Tooltip
              term="Universal Master Playbook"
              explanation="The core battle-tested techniques summarized from the world's most profitable consistent traders: Wyckoff, Minervini, Livermore, Weinstein, and Tudor Jones."
            >
              <span className="text-[11px] font-mono text-[#2dd4a7] bg-[#122822] border border-[#204a3e] px-2 py-0.5 rounded cursor-pointer">
                Time-Agnostic Fractal Setups
              </span>
            </Tooltip>
          </div>
          <p className="text-xs text-[#8ea4c7] mt-1 max-w-2xl">
            These structural setups operate identically across all horizons—from a 1-minute order book to a Daily macro trend.
          </p>
        </div>
      </div>

      {/* 5 Trader Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-3.5">
        {MASTER_PLAYBOOKS.map((p) => {
          const isSelected = p.id === selectedId;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#182b4d] border-[#4f8df9] shadow-sm'
                  : 'bg-[#0a1222] border-[#1b2c4e] hover:border-[#2b4478]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#4f8df9] font-mono uppercase font-semibold">
                  {p.trader.split(' ')[0]}
                </span>
                <span className="text-[9px] text-[#5e7394] font-mono">{p.bestHorizon.split(';')[0]}</span>
              </div>
              <strong className="text-xs text-[#f0f4fc] block mt-1.5 truncate">{p.name}</strong>
              <span className="text-[10px] text-[#7a8fae] block truncate mt-0.5">{p.era.split('(')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Active Playbook Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* Visual Blueprint SVG Viewport */}
        <div className="lg:col-span-7 bg-[#0a101f] border border-[#1e2f52] rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#8ea4c7]">
              Anatomical Blueprint: <strong className="text-[#f0f4fc]">{activePlaybook.name}</strong>
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-[#2dd4a7] flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-[#2dd4a7]" /> Entry Trigger
              </span>
              <span className="text-[#ff6b6b] flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-[#ff6b6b]" /> Invalidation Stop
              </span>
            </div>
          </div>

          <div className="relative w-full h-[250px] flex items-center justify-center">
            {activePlaybook.svgType === 'spring' && (
              <svg viewBox="0 0 500 240" className="w-full h-full">
                {/* Wyckoff Trading Range Box */}
                <rect x="30" y="60" width="440" height="90" fill="rgba(79, 141, 249, 0.04)" stroke="#1f3258" strokeWidth="1" strokeDasharray="3 3" />
                <text x="40" y="52" fill="#7aa2ff" fontSize="10.5" fontFamily="IBM Plex Mono">Resistance / Supply Line</text>
                <text x="40" y="165" fill="#7aa2ff" fontSize="10.5" fontFamily="IBM Plex Mono">Support / Accumulation Floor</text>

                {/* Oscillating Range Curve */}
                <polyline points="40,90 90,70 140,140 190,80 240,145 280,100" fill="none" stroke="#8ea4c7" strokeWidth="2" />

                {/* Spring Shakeout down through Support */}
                <polyline points="280,100 310,180 340,120" fill="none" stroke="#ff6b6b" strokeWidth="2.4" />
                <circle cx="310" cy="180" r="5" fill="#ff6b6b" />
                <text x="310" y="200" fill="#ff6b6b" fontSize="10.5" fontWeight="600" textAnchor="middle" fontFamily="IBM Plex Mono">
                  PHASE C: SPRING (Shakeout)
                </text>

                {/* LPS Retest and Markup */}
                <polyline points="340,120 370,145 420,60 460,40" fill="none" stroke="#2dd4a7" strokeWidth="2.8" />
                <rect x="355" y="135" width="80" height="20" fill="rgba(45, 212, 167, 0.2)" stroke="#2dd4a7" rx="3" />
                <text x="395" y="148" fill="#2dd4a7" fontSize="9.5" fontWeight="600" textAnchor="middle" fontFamily="IBM Plex Mono">
                  QUANT ENTRY: LPS
                </text>

                {/* Stop Loss Line */}
                <line x1="280" y1="190" x2="470" y2="190" stroke="#ff6b6b" strokeWidth="1.5" strokeDasharray="4 3" />
                <text x="470" y="202" fill="#ff6b6b" fontSize="9.5" textAnchor="end" fontFamily="IBM Plex Mono">
                  Stop: 1 tick below Spring Low
                </text>
              </svg>
            )}

            {activePlaybook.svgType === 'vcp' && (
              <svg viewBox="0 0 500 240" className="w-full h-full">
                {/* VCP Contraction 1 */}
                <path d="M 40 80 Q 90 190 140 85" fill="none" stroke="#ff6b6b" strokeWidth="2" />
                <text x="90" y="140" fill="#ff6b6b" fontSize="10.5" textAnchor="middle" fontFamily="IBM Plex Mono">T1: −25%</text>

                {/* VCP Contraction 2 */}
                <path d="M 140 85 Q 190 160 240 90" fill="none" stroke="#ffd60a" strokeWidth="2" />
                <text x="190" y="130" fill="#ffd60a" fontSize="10.5" textAnchor="middle" fontFamily="IBM Plex Mono">T2: −12%</text>

                {/* VCP Contraction 3 (Tight) */}
                <path d="M 240 90 Q 280 125 320 92" fill="none" stroke="#2dd4a7" strokeWidth="2.2" />
                <text x="280" y="112" fill="#2dd4a7" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">T3: −4%</text>

                {/* Pivot Breakout Line */}
                <line x1="40" y1="80" x2="460" y2="80" stroke="#4f8df9" strokeWidth="1.8" strokeDasharray="4 4" />
                <text x="460" y="72" fill="#4f8df9" fontSize="10.5" textAnchor="end" fontFamily="IBM Plex Mono">
                  Pivot Line of Least Resistance
                </text>

                {/* Explosive Breakout Arrow */}
                <line x1="320" y1="92" x2="420" y2="40" stroke="#2dd4a7" strokeWidth="3" />
                <polygon points="420,40 405,48 412,56" fill="#2dd4a7" />
                <text x="360" y="48" fill="#2dd4a7" fontSize="11" fontWeight="600" fontFamily="IBM Plex Mono">
                  ENTRY: Vol Dry-Up Pivot Break
                </text>

                {/* Volume Footprint Drying Up at Bottom */}
                <rect x="70" y="200" width="16" height="30" fill="#ff6b6b" />
                <rect x="90" y="210" width="16" height="20" fill="#ff6b6b" />
                <rect x="170" y="215" width="14" height="15" fill="#ffd60a" />
                <rect x="190" y="220" width="14" height="10" fill="#ffd60a" />
                <rect x="270" y="224" width="12" height="6" fill="#2dd4a7" />
                <rect x="290" y="226" width="12" height="4" fill="#2dd4a7" />
                <text x="315" y="226" fill="#2dd4a7" fontSize="9" fontFamily="IBM Plex Mono">Volume Dry-up (Zero Supply)</text>
              </svg>
            )}

            {activePlaybook.svgType === 'pivot' && (
              <svg viewBox="0 0 500 240" className="w-full h-full">
                {/* Horizontal Pivot Resistance */}
                <line x1="50" y1="100" x2="450" y2="100" stroke="#ffd60a" strokeWidth="2" strokeDasharray="5 3" />
                <text x="60" y="90" fill="#ffd60a" fontSize="11" fontWeight="600" fontFamily="IBM Plex Mono">
                  LIVERMORE PIVOTAL POINT: Previous Key Reaction High
                </text>

                {/* Rally, Rejection, and Pressure buildup */}
                <polyline points="60,180 140,100 200,145 280,102 330,125" fill="none" stroke="#8ea4c7" strokeWidth="2" />

                {/* Heavy Volume Penetration Breakout */}
                <polyline points="330,125 380,60 450,30" fill="none" stroke="#2dd4a7" strokeWidth="3" />
                <circle cx="380" cy="100" r="5" fill="#2dd4a7" />
                <text x="390" y="90" fill="#2dd4a7" fontSize="11" fontWeight="bold" fontFamily="IBM Plex Mono">
                  CROSSING THE PIVOT
                </text>

                {/* Invalidation Shelf */}
                <line x1="280" y1="135" x2="450" y2="135" stroke="#ff6b6b" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="450" y="148" fill="#ff6b6b" fontSize="10" textAnchor="end" fontFamily="IBM Plex Mono">
                  Invalidation Stop: Re-entry inside shelf
                </text>
              </svg>
            )}

            {activePlaybook.svgType === 'stage2' && (
              <svg viewBox="0 0 500 240" className="w-full h-full">
                {/* 4 Stages: Stage 1 Base -> Stage 2 Advance */}
                <text x="80" y="180" fill="#7aa2ff" fontSize="10.5" fontFamily="IBM Plex Mono">STAGE 1: Basing</text>
                <text x="320" y="70" fill="#2dd4a7" fontSize="12" fontWeight="bold" fontFamily="IBM Plex Mono">STAGE 2: ADVANCING (BUY ZONE)</text>

                {/* Curving 30-period Moving Average */}
                <path d="M 40 150 Q 150 150 250 120 T 450 50" fill="none" stroke="#4f8df9" strokeWidth="2.5" />
                <text x="450" y="40" fill="#4f8df9" fontSize="10" textAnchor="end" fontFamily="IBM Plex Mono">Rising 30-Period Baseline</text>

                {/* Price candles oscillating around MA and taking off */}
                <polyline points="40,160 80,140 120,165 170,140 220,115 280,130 360,75 440,30" fill="none" stroke="#2dd4a7" strokeWidth="2.5" />

                <circle cx="230" cy="115" r="5" fill="#ffd60a" />
                <text x="240" y="105" fill="#ffd60a" fontSize="10" fontWeight="600" fontFamily="IBM Plex Mono">Stage 2 Breakout Point</text>
              </svg>
            )}

            {activePlaybook.svgType === 'asymmetry' && (
              <svg viewBox="0 0 500 240" className="w-full h-full">
                {/* 200 EMA Baseline */}
                <line x1="40" y1="160" x2="460" y2="160" stroke="#4f8df9" strokeWidth="2" />
                <text x="50" y="150" fill="#4f8df9" fontSize="11" fontWeight="600" fontFamily="IBM Plex Mono">
                  200-Period Trend Baseline Filter (Never Buy Under This Line)
                </text>

                {/* 5:1 Asymmetry Stack */}
                {/* Risk: 30px */}
                <rect x="200" y="160" width="160" height="30" fill="rgba(255,107,107,0.18)" stroke="#ff6b6b" rx="3" />
                <text x="280" y="180" fill="#ff6b6b" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="IBM Plex Mono">
                  RISK: 1 Unit ($100 max 1%)
                </text>

                {/* Reward: 150px (5x) */}
                <rect x="200" y="10" width="160" height="150" fill="rgba(45,212,167,0.18)" stroke="#2dd4a7" rx="3" />
                <text x="280" y="90" fill="#2dd4a7" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="IBM Plex Mono">
                  REWARD: 5 Units ($500 Net)
                </text>

                <text x="375" y="75" fill="#ffd60a" fontSize="12" fontWeight="bold" fontFamily="IBM Plex Mono">
                  5:1 ASYMMETRY
                </text>
                <text x="375" y="95" fill="#8ea4c7" fontSize="10.5" fontFamily="IBM Plex Mono">
                  Requires only 20% win-rate!
                </text>
              </svg>
            )}
          </div>

          <div className="mt-2 text-xs text-[#8ea4c7] italic bg-[#0d1629] p-2.5 rounded border border-[#16233d]">
            {activePlaybook.coreQuote}
          </div>
        </div>

        {/* Technical Callout & Rules Sidebar */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-3.5">
            <span className="text-[10px] text-[#4f8df9] font-mono uppercase tracking-wider block">
              Quantitative Mathematical Condition
            </span>
            <h3 className="text-sm font-semibold text-[#f0f4fc] mt-0.5">{activePlaybook.ruleTitle}</h3>
            <div className="mt-2 p-2 bg-[#0d1629] border border-[#182747] rounded font-mono text-xs text-[#ffd60a] text-center">
              {activePlaybook.formula}
            </div>
            <p className="text-xs text-[#8ea4c7] mt-2.5 leading-relaxed">
              {activePlaybook.plainEnglish}
            </p>
          </div>

          <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-3.5 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] text-[#2dd4a7] font-mono uppercase tracking-wider block">
                  Exact Quant Entry Trigger
                </span>
                <p className="text-[#f0f4fc] font-medium mt-0.5">{activePlaybook.entryTrigger}</p>
              </div>

              <div>
                <span className="text-[10px] text-[#ff6b6b] font-mono uppercase tracking-wider block">
                  Invalidation Stop-Loss Rule
                </span>
                <p className="text-[#8ea4c7] font-medium mt-0.5">{activePlaybook.stopLossRule}</p>
              </div>

              <div>
                <span className="text-[10px] text-[#ffd60a] font-mono uppercase tracking-wider block">
                  Profit Runway & Sizing
                </span>
                <p className="text-[#f0f4fc] font-medium mt-0.5">{activePlaybook.profitRunway}</p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#182847] text-[11px] text-[#5e7394]">
              <strong>Time-Agnostic Truth:</strong> {activePlaybook.bestHorizon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
