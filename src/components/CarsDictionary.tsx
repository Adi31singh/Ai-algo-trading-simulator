/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CARS_ITEMS } from '../data/quantEducation';
import { Tooltip } from './Tooltip';

export const CarsDictionary: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<'C' | 'A' | 'R' | 'S'>('R');

  // Interactive parameters for user simulation
  // Rejection parameters:
  const [wickPercent, setWickPercent] = useState<number>(74); // 40 - 90%
  // Asymmetry parameters:
  const [riskPoints, setRiskPoints] = useState<number>(25);
  const [rewardPoints, setRewardPoints] = useState<number>(75);
  // Structure parameters:
  const [isBodyClose, setIsBodyClose] = useState<boolean>(true);
  // Context parameters:
  const [zLevel, setZLevel] = useState<number>(-2.1);

  const activeItem = CARS_ITEMS[selectedKey];

  // Calculations for Asymmetry
  const currentRR = (rewardPoints / Math.max(riskPoints, 1)).toFixed(2);
  const breakEvenWinRate = ((riskPoints / (riskPoints + rewardPoints)) * 100).toFixed(1);

  return (
    <div className="bg-[#0d172b] border border-[#1e2f52] rounded-xl p-5 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#182847]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-[#f0f4fc]">3. The C.A.R.S. Visual Dictionary</h2>
            <Tooltip
              term="C.A.R.S."
              explanation="Context, Asymmetry, Rejection, Structure: The 4 mathematical filters institutional traders check before taking risk."
            >
              <span className="text-[11px] font-mono text-[#ffd60a] bg-[#292408] border border-[#615413] px-2 py-0.5 rounded cursor-pointer">
                Price Action & Quantitative Anatomy
              </span>
            </Tooltip>
          </div>
          <p className="text-xs text-[#8ea4c7] mt-1 max-w-2xl">
            Select a pillar to inspect its anatomical breakdown, mathematical criteria, Quant Entry Zone, and Invalidation Stop Level.
          </p>
        </div>
      </div>

      {/* 4 Pillar Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5">
        {(['C', 'A', 'R', 'S'] as const).map((k) => {
          const item = CARS_ITEMS[k];
          const isSelected = selectedKey === k;
          return (
            <button
              key={k}
              onClick={() => setSelectedKey(k)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#182b4d] border-[#4f8df9] shadow-sm'
                  : 'bg-[#0a1222] border-[#1b2c4e] hover:border-[#2b4478]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                    isSelected ? 'bg-[#4f8df9] text-[#080d19]' : 'bg-[#14213d] text-[#4f8df9]'
                  }`}
                >
                  {k}
                </span>
                <span className="text-[10px] text-[#5e7394] font-mono">Pillar {k}</span>
              </div>
              <strong className="text-xs text-[#f0f4fc] block mt-2">{item.name}</strong>
              <span className="text-[11px] text-[#7a8fae] block truncate mt-0.5">{item.shortDesc}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Diagram & Blueprint */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* SVG Pictorial Canvas */}
        <div className="lg:col-span-8 bg-[#0a101f] border border-[#1e2f52] rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#8ea4c7]">
              Anatomical Blueprint: <strong className="text-[#f0f4fc]">{activeItem.name}</strong>
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-[#2dd4a7]">
                <span className="w-2 h-2 rounded bg-[#2dd4a7]" /> Entry Zone
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#ff6b6b]">
                <span className="w-2 h-2 rounded bg-[#ff6b6b]" /> Invalidation Stop
              </span>
            </div>
          </div>

          {/* SVG Diagram Viewport */}
          <div className="relative w-full h-[270px] flex items-center justify-center">
            {selectedKey === 'C' && (
              <svg viewBox="0 0 540 260" className="w-full h-full">
                {/* VWAP Lines */}
                <line x1="30" y1="50" x2="480" y2="50" stroke="rgba(122,162,255,0.4)" strokeWidth="1" strokeDasharray="4 4" />
                <text x="490" y="54" fill="#7aa2ff" fontSize="11" fontFamily="IBM Plex Mono">+2.0σ Band</text>

                <line x1="30" y1="90" x2="480" y2="90" stroke="rgba(122,162,255,0.5)" strokeWidth="1" />
                <text x="490" y="94" fill="#7aa2ff" fontSize="11" fontFamily="IBM Plex Mono">+1.0σ Band</text>

                <line x1="30" y1="130" x2="480" y2="130" stroke="#4f8df9" strokeWidth="2.2" />
                <text x="490" y="134" fill="#4f8df9" fontSize="11" fontWeight="600" fontFamily="IBM Plex Mono">VWAP (Fair Value)</text>

                <line x1="30" y1="170" x2="480" y2="170" stroke="rgba(122,162,255,0.5)" strokeWidth="1" />
                <text x="490" y="174" fill="#7aa2ff" fontSize="11" fontFamily="IBM Plex Mono">−1.0σ Band</text>

                <line x1="30" y1="210" x2="480" y2="210" stroke="rgba(122,162,255,0.7)" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="490" y="214" fill="#4f8df9" fontSize="11" fontWeight="600" fontFamily="IBM Plex Mono">−2.0σ Threshold</text>

                {/* No Edge Chop Shading inside ±1σ */}
                <rect x="30" y="90" width="450" height="80" fill="rgba(255,255,255,0.02)" />
                <text x="250" y="115" fill="#5e7394" fontSize="11" textAnchor="middle" fontFamily="IBM Plex Mono">
                  Equilibrium Zone (Inside ±1.0σ: Zero Statistical Edge)
                </text>

                {/* Candles drifting down toward -2σ */}
                {[
                  [60, 118, 96, 126, 114],
                  [95, 112, 104, 130, 124],
                  [130, 125, 116, 148, 142],
                  [165, 140, 134, 164, 158],
                  [200, 156, 150, 180, 174],
                  [235, 172, 168, 198, 192],
                  [270, 190, 184, 214, 206],
                ].map(([x, o, h, l, c], i) => (
                  <g key={i}>
                    <line x1={x} y1={h} x2={x} y2={l} stroke="#ff6b6b" strokeWidth="1.2" />
                    <rect x={x - 7} y={Math.min(o, c)} width="14" height={Math.max(2, Math.abs(o - c))} fill="#ff6b6b" rx="2" />
                  </g>
                ))}

                {/* Entry Zone at -2σ */}
                <rect x="290" y="200" width="180" height="22" fill="rgba(45, 212, 167, 0.18)" stroke="#2dd4a7" strokeWidth="1" rx="3" />
                <text x="300" y="215" fill="#2dd4a7" fontSize="10.5" fontWeight="600" fontFamily="IBM Plex Mono">
                  QUANT ENTRY ZONE (Z ≤ −2.0σ)
                </text>

                {/* Reversal Candle at -2σ */}
                <line x1="350" y1="202" x2="350" y2="228" stroke="#2dd4a7" strokeWidth="1.5" />
                <rect x="342" y="196" width="16" height="12" fill="#2dd4a7" rx="2" />

                {/* Invalidation Stop Level */}
                <line x1="30" y1="240" x2="480" y2="240" stroke="#ff6b6b" strokeWidth="1.5" strokeDasharray="5 3" />
                <text x="30" y="254" fill="#ff6b6b" fontSize="10.5" fontFamily="IBM Plex Mono">
                  INVALIDATION STOP LEVEL: 1-min close below −2.50σ
                </text>
              </svg>
            )}

            {selectedKey === 'A' && (
              <svg viewBox="0 0 540 260" className="w-full h-full">
                {/* Entry line */}
                <line x1="50" y1="160" x2="480" y2="160" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="60" y="152" fill="#ffffff" fontSize="11" fontWeight="600" fontFamily="IBM Plex Mono">
                  ENTRY PRICE LEVEL
                </text>

                {/* Reward Box (Green) */}
                <rect
                  x="180"
                  y={160 - Math.min(120, rewardPoints * 1.3)}
                  width="220"
                  height={Math.min(120, rewardPoints * 1.3)}
                  fill="rgba(45, 212, 167, 0.16)"
                  stroke="#2dd4a7"
                  strokeWidth="1.5"
                  rx="4"
                />
                <text
                  x="200"
                  y={160 - Math.min(120, rewardPoints * 1.3) / 2 + 5}
                  fill="#2dd4a7"
                  fontSize="13"
                  fontWeight="600"
                  fontFamily="IBM Plex Mono"
                >
                  TARGET: +{rewardPoints} pts
                </text>

                {/* Risk Box (Red) */}
                <rect
                  x="180"
                  y="160"
                  width="220"
                  height={Math.min(70, riskPoints * 1.3)}
                  fill="rgba(255, 107, 107, 0.16)"
                  stroke="#ff6b6b"
                  strokeWidth="1.5"
                  rx="4"
                />
                <text
                  x="200"
                  y={160 + Math.min(70, riskPoints * 1.3) / 2 + 5}
                  fill="#ff6b6b"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="IBM Plex Mono"
                >
                  RISK: −{riskPoints} pts
                </text>

                {/* Statistical Callouts */}
                <text x="420" y="130" fill="#2dd4a7" fontSize="12" fontWeight="600" fontFamily="IBM Plex Mono">
                  R:R = {currentRR} : 1
                </text>
                <text x="420" y="150" fill="#ffd60a" fontSize="10.5" fontFamily="IBM Plex Mono">
                  Req. Win Rate: {breakEvenWinRate}%
                </text>

                {/* Invalidation Label */}
                <line
                  x1="50"
                  y1={160 + Math.min(70, riskPoints * 1.3)}
                  x2="480"
                  y2={160 + Math.min(70, riskPoints * 1.3)}
                  stroke="#ff6b6b"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <text
                  x="60"
                  y={160 + Math.min(70, riskPoints * 1.3) + 16}
                  fill="#ff6b6b"
                  fontSize="10.5"
                  fontFamily="IBM Plex Mono"
                >
                  INVALIDATION STOP LEVEL
                </text>
              </svg>
            )}

            {selectedKey === 'R' && (
              <svg viewBox="0 0 540 260" className="w-full h-full">
                {/* Candlestick with user-controlled wick length */}
                {/* Total candle height = 150px. Body = (100 - wickPercent)% */}
                {(() => {
                  const totalH = 150;
                  const candleX = 180;
                  const candleTop = 60;
                  const candleBot = candleTop + totalH; // 210
                  const wickH = (totalH * wickPercent) / 100;
                  const bodyH = totalH - wickH;
                  const bodyTop = candleTop + 8; // small upper wick
                  const bodyBot = bodyTop + bodyH;
                  const isAccepted = wickPercent >= 70;

                  return (
                    <g>
                      {/* Range brackets */}
                      <line x1="80" y1={candleTop} x2="110" y2={candleTop} stroke="#5e7394" strokeWidth="1" />
                      <line x1="80" y1={candleBot} x2="110" y2={candleBot} stroke="#5e7394" strokeWidth="1" />
                      <line x1="95" y1={candleTop} x2="95" y2={candleBot} stroke="#5e7394" strokeWidth="1" strokeDasharray="2 2" />
                      <text x="75" y={candleTop + totalH / 2} fill="#8ea4c7" fontSize="10" textAnchor="end" fontFamily="IBM Plex Mono">
                        Full Range: 150 ticks
                      </text>

                      {/* Main Rejection Wick (Lower Shadow) */}
                      <line
                        x1={candleX}
                        y1={bodyBot}
                        x2={candleX}
                        y2={candleBot}
                        stroke={isAccepted ? '#2dd4a7' : '#ff6b6b'}
                        strokeWidth="3.5"
                      />
                      {/* Upper Wick */}
                      <line x1={candleX} y1={candleTop} x2={candleX} y2={bodyTop} stroke="#2dd4a7" strokeWidth="1.8" />

                      {/* Candle Body */}
                      <rect
                        x={candleX - 16}
                        y={bodyTop}
                        width="32"
                        height={Math.max(4, bodyH)}
                        fill="#2dd4a7"
                        stroke="#2dd4a7"
                        rx="2"
                      />

                      {/* Wick Dimension Callout */}
                      <line x1="220" y1={bodyBot} x2="250" y2={bodyBot} stroke="#7aa2ff" strokeWidth="1" />
                      <line x1="220" y1={candleBot} x2="250" y2={candleBot} stroke="#7aa2ff" strokeWidth="1" />
                      <line x1="240" y1={bodyBot} x2="240" y2={candleBot} stroke="#7aa2ff" strokeWidth="1.5" />
                      <text x="256" y={bodyBot + wickH / 2 + 4} fill="#7aa2ff" fontSize="11" fontWeight="600" fontFamily="IBM Plex Mono">
                        Lower Wick: {wickPercent}% of range
                      </text>

                      {/* Quant Status Badge */}
                      <rect
                        x="330"
                        y="50"
                        width="180"
                        height="30"
                        fill={isAccepted ? 'rgba(45,212,167,0.15)' : 'rgba(255,107,107,0.15)'}
                        stroke={isAccepted ? '#2dd4a7' : '#ff6b6b'}
                        rx="4"
                      />
                      <text
                        x="420"
                        y="70"
                        fill={isAccepted ? '#2dd4a7' : '#ff6b6b'}
                        fontSize="11"
                        fontWeight="600"
                        textAnchor="middle"
                        fontFamily="IBM Plex Mono"
                      >
                        {isAccepted ? '✓ QUANT CRITERIA MET (≥70%)' : '✗ REJECTION TOO WEAK (<70%)'}
                      </text>

                      {/* Quant Entry Zone */}
                      <rect x="290" y={bodyTop} width="160" height={Math.max(16, bodyH * 1.4)} fill="rgba(45,212,167,0.18)" stroke="#2dd4a7" rx="3" />
                      <text x="300" y={bodyTop + 14} fill="#2dd4a7" fontSize="10.5" fontWeight="600" fontFamily="IBM Plex Mono">
                        QUANT ENTRY ZONE
                      </text>
                      <text x="300" y={bodyTop + 26} fill="#8ea4c7" fontSize="9.5" fontFamily="IBM Plex Mono">
                        Retest of upper body
                      </text>

                      {/* Invalidation Level */}
                      <line x1="60" y1={candleBot + 8} x2="480" y2={candleBot + 8} stroke="#ff6b6b" strokeWidth="1.5" strokeDasharray="4 3" />
                      <text x="60" y={candleBot + 22} fill="#ff6b6b" fontSize="10.5" fontWeight="600" fontFamily="IBM Plex Mono">
                        INVALIDATION STOP: 1 tick below wick low ({candleBot})
                      </text>
                    </g>
                  );
                })()}
              </svg>
            )}

            {selectedKey === 'S' && (
              <svg viewBox="0 0 540 260" className="w-full h-full">
                {/* Bear trend: LH and LL sequence */}
                <polyline points="40,65 95,140 155,95 215,175 275,120" fill="none" stroke="#8ea4c7" strokeWidth="2" />
                <text x="40" y="55" fill="#5e7394" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">LH1</text>
                <text x="95" y="156" fill="#5e7394" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">LL1</text>
                <text x="155" y="85" fill="#5e7394" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">LH2</text>
                <text x="215" y="192" fill="#5e7394" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">LL2</text>
                <text x="275" y="108" fill="#ffd60a" fontSize="10.5" fontWeight="600" textAnchor="middle" fontFamily="IBM Plex Mono">
                  LAST LOWER HIGH (Pivotal Resistance: 120)
                </text>

                {/* Key Pivot Level Line */}
                <line x1="275" y1="120" x2="490" y2="120" stroke="#ffd60a" strokeWidth="1.5" strokeDasharray="4 3" />

                {/* Candle breaking the level based on user toggle: isBodyClose */}
                {isBodyClose ? (
                  <g>
                    {/* Bullish Close Candle ABOVE LH */}
                    <line x1="340" y1="80" x2="340" y2="140" stroke="#2dd4a7" strokeWidth="1.5" />
                    <rect x="330" y="88" width="20" height="42" fill="#2dd4a7" rx="2" />
                    <text x="340" y="70" fill="#2dd4a7" fontSize="10.5" fontWeight="600" textAnchor="middle" fontFamily="IBM Plex Mono">
                      Body CLOSE Above LH
                    </text>
                    <text x="340" y="58" fill="#2dd4a7" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="IBM Plex Mono">
                      = CONFIRMED REVERSAL SHIFT
                    </text>

                    {/* Entry Zone on Retest */}
                    <rect x="380" y="112" width="120" height="20" fill="rgba(45,212,167,0.2)" stroke="#2dd4a7" rx="3" />
                    <text x="390" y="126" fill="#2dd4a7" fontSize="10" fontWeight="600" fontFamily="IBM Plex Mono">
                      QUANT ENTRY: Retest
                    </text>
                  </g>
                ) : (
                  <g>
                    {/* Wick Only Sweep: Fails to close above */}
                    <line x1="340" y1="80" x2="340" y2="150" stroke="#ff6b6b" strokeWidth="1.5" />
                    <rect x="330" y="125" width="20" height="20" fill="#ff6b6b" rx="2" />
                    <text x="340" y="70" fill="#ff6b6b" fontSize="10.5" fontWeight="600" textAnchor="middle" fontFamily="IBM Plex Mono">
                      Wick-Only Pierced
                    </text>
                    <text x="340" y="58" fill="#ff6b6b" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="IBM Plex Mono">
                      = LIQUIDITY SWEEP (NOT A SHIFT)
                    </text>
                  </g>
                )}

                {/* Invalidation Stop */}
                <line x1="40" y1="210" x2="490" y2="210" stroke="#ff6b6b" strokeWidth="1.5" strokeDasharray="5 3" />
                <text x="50" y="226" fill="#ff6b6b" fontSize="10.5" fontWeight="600" fontFamily="IBM Plex Mono">
                  INVALIDATION STOP LEVEL: 1 tick below structural swing low LL2
                </text>
              </svg>
            )}
          </div>

          {/* Interactive Parameter Control Slider */}
          <div className="mt-2 pt-2.5 border-t border-[#182847] bg-[#0d1629] p-3 rounded-lg">
            {selectedKey === 'R' && (
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-[#8ea4c7]">Test Rejection Wick Length:</span>
                  <span className="font-mono font-bold text-[#f0f4fc]">{wickPercent}% of candle height</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="90"
                  value={wickPercent}
                  onChange={(e) => setWickPercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#14213d] rounded appearance-none cursor-pointer accent-[#2dd4a7]"
                />
                <span className="text-[10px] text-[#5e7394] block mt-1 font-mono">
                  Move slider to test when a pin-bar satisfies the quant threshold (≥ 70%).
                </span>
              </div>
            )}

            {selectedKey === 'A' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#ff6b6b]">Risk (Stop):</span>
                    <span className="font-mono text-[#f0f4fc]">{riskPoints} pts</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={riskPoints}
                    onChange={(e) => setRiskPoints(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#14213d] rounded appearance-none cursor-pointer accent-[#ff6b6b]"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#2dd4a7]">Reward (Target):</span>
                    <span className="font-mono text-[#f0f4fc]">{rewardPoints} pts</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="150"
                    value={rewardPoints}
                    onChange={(e) => setRewardPoints(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#14213d] rounded appearance-none cursor-pointer accent-[#2dd4a7]"
                  />
                </div>
              </div>
            )}

            {selectedKey === 'S' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8ea4c7]">Simulate Breakout Candle Behavior:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsBodyClose(true)}
                    className={`px-3 py-1 text-xs font-semibold rounded border cursor-pointer ${
                      isBodyClose
                        ? 'bg-[#1b3d32] text-[#2dd4a7] border-[#2dd4a7]'
                        : 'bg-[#111c33] text-[#8ea4c7] border-[#22345a]'
                    }`}
                  >
                    Decisive Body Close
                  </button>
                  <button
                    onClick={() => setIsBodyClose(false)}
                    className={`px-3 py-1 text-xs font-semibold rounded border cursor-pointer ${
                      !isBodyClose
                        ? 'bg-[#3d1c22] text-[#ff6b6b] border-[#ff6b6b]'
                        : 'bg-[#111c33] text-[#8ea4c7] border-[#22345a]'
                    }`}
                  >
                    Wick Only (Trap)
                  </button>
                </div>
              </div>
            )}

            {selectedKey === 'C' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8ea4c7]">Deviation Level Trigger:</span>
                <div className="flex gap-2">
                  {[-1.0, -2.0, -2.5].map((z) => (
                    <button
                      key={z}
                      onClick={() => setZLevel(z)}
                      className={`px-3 py-1 text-xs font-mono rounded border cursor-pointer ${
                        zLevel === z
                          ? 'bg-[#182b4d] text-[#4f8df9] border-[#4f8df9] font-bold'
                          : 'bg-[#111c33] text-[#8ea4c7] border-[#22345a]'
                      }`}
                    >
                      {z.toFixed(1)}σ
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Technical Callout & Mathematical Formulation Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Formula Card */}
          <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-3.5">
            <span className="text-[10px] text-[#4f8df9] font-mono uppercase tracking-wider block">
              Quantitative Rule
            </span>
            <h3 className="text-sm font-semibold text-[#f0f4fc] mt-0.5">{activeItem.ruleTitle}</h3>
            <div className="mt-2 p-2 bg-[#0d1629] border border-[#182747] rounded font-mono text-xs text-[#ffd60a] text-center">
              {activeItem.mathFormula}
            </div>
            <p className="text-xs text-[#8ea4c7] mt-2.5 leading-relaxed">
              {activeItem.plainEnglishExplanation}
            </p>
          </div>

          {/* Zones Summary */}
          <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-3.5 flex-1 flex flex-col justify-between">
            <div>
              <div className="mb-3">
                <span className="text-[10px] text-[#2dd4a7] font-mono uppercase tracking-wider block">
                  Institutional Execution
                </span>
                <p className="text-xs text-[#f0f4fc] font-medium mt-1 leading-snug">
                  {activeItem.entryZone}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-[#ff6b6b] font-mono uppercase tracking-wider block">
                  Thesis Invalidation
                </span>
                <p className="text-xs text-[#8ea4c7] font-medium mt-1 leading-snug">
                  {activeItem.invalidationLevel}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#182847] text-[11px] text-[#5e7394]">
              <strong>Non-Technical Takeaway:</strong> In institutional trading, emotion is removed. Every setup must meet measurable mathematical conditions before an order is placed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
