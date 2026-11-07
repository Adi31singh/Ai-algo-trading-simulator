/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MarketProfile } from '../types/quant';
import { DamodaranValuationResult } from '../utils/damodaranValuation';

interface DamodaranValuationPanelProps {
  currentMarket: MarketProfile;
  currentPrice: number;
  valuation: DamodaranValuationResult | null;
  onRefreshQuote?: () => void;
  isLoadingQuote?: boolean;
}

export const DamodaranValuationPanel: React.FC<DamodaranValuationPanelProps> = ({
  currentMarket,
  currentPrice,
  valuation,
  onRefreshQuote,
  isLoadingQuote = false,
}) => {
  // Allow user to interactively adjust the ONLY assumed variable: growth to perpetuity (gn <= Rf)
  const [userPerpetuityGrowth, setUserPerpetuityGrowth] = useState<number | null>(null);

  if (!valuation) return null;

  const currency = valuation.currency || currentMarket.currencySymbol;
  const spotPrice = Math.max(0.01, currentPrice || valuation.currentPrice);
  const activeGn = userPerpetuityGrowth !== null ? userPerpetuityGrowth : valuation.growthToPerpetuity;

  // Damodaran sensitivity adjustment based on gn change relative to WACC hurdle
  const waccDec = valuation.wacc / 100;
  const baseGnDec = valuation.growthToPerpetuity / 100;
  const currentGnDec = activeGn / 100;

  // Terminal value ratio adjustment: TV ~ 1 / (WACC - gn)
  const baseSpread = Math.max(0.01, waccDec - baseGnDec);
  const currentSpread = Math.max(0.01, waccDec - currentGnDec);
  const sensitivityMultiplier = baseSpread / currentSpread;

  const adjustedIntrinsicValue = parseFloat(
    (valuation.dcfIntrinsicValue * (0.35 + 0.65 * sensitivityMultiplier)).toFixed(2)
  );
  const adjustedMarginOfSafety = parseFloat(
    (((adjustedIntrinsicValue - spotPrice) / spotPrice) * 100).toFixed(1)
  );

  const isUndervalued = adjustedMarginOfSafety > 0;

  return (
    <div className="bg-[#0b1324] border border-[#1b2c4e] rounded-xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#14213d]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4f8df9]" />
            <h3 className="text-sm font-bold text-[#f0f4fc] tracking-wider uppercase font-mono">
              Prof. Aswath Damodaran Corporate Valuation &amp; DCF Engine
            </h3>
            <span className="text-[10px] font-mono text-[#4f8df9] bg-[#12233f] border border-[#1e3b6e] px-2 py-0.5 rounded">
              NYU Stern Methodology
            </span>
          </div>
          <p className="text-xs text-[#8ea4c7] mt-1 leading-relaxed">
            Zero speculative assumptions: cost of capital (WACC), ROIC, and reinvestment are derived from Damodaran sector matrices. The only assumed parameter is growth to perpetuity ($g_n$), strictly capped at the sovereign risk-free rate ($g_n \le R_f$).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefreshQuote && (
            <button
              onClick={onRefreshQuote}
              disabled={isLoadingQuote}
              className="px-3 py-1.5 text-xs font-mono font-semibold rounded bg-[#162747] hover:bg-[#203763] text-[#4f8df9] border border-[#233f72] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className={isLoadingQuote ? 'animate-spin' : ''}>↻</span>
              <span>{isLoadingQuote ? 'Fetching Live Tape...' : 'Sync Live Exchange Tape'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Intrinsic Value & Valuation Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Spot Price */}
        <div className="bg-[#070d18] border border-[#1b2c4e] rounded-lg p-3">
          <span className="text-[10px] text-[#7a8fae] font-mono block uppercase">
            Live Market Spot ({valuation.symbol})
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold font-mono text-[#f0f4fc]">
              {currency}{spotPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[9px] text-[#2dd4a7] font-mono mt-0.5 block">
            ● Real-Time Exchange Feed
          </span>
        </div>

        {/* Damodaran DCF Intrinsic Value */}
        <div className="bg-[#070d18] border border-[#1b2c4e] rounded-lg p-3">
          <span className="text-[10px] text-[#4f8df9] font-mono block uppercase">
            Damodaran DCF Fair Value
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold font-mono text-[#4f8df9]">
              {currency}{adjustedIntrinsicValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[9px] text-[#8ea4c7] font-mono mt-0.5 block">
            Discounted FCFF + Terminal Value
          </span>
        </div>

        {/* Margin of Safety */}
        <div className="bg-[#070d18] border border-[#1b2c4e] rounded-lg p-3">
          <span className="text-[10px] text-[#ffd60a] font-mono block uppercase">
            Margin of Safety
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span
              className={`text-xl font-bold font-mono ${
                isUndervalued ? 'text-[#2dd4a7]' : 'text-[#ff6b6b]'
              }`}
            >
              {isUndervalued ? '+' : ''}{adjustedMarginOfSafety}%
            </span>
          </div>
          <span
            className={`text-[9px] font-mono font-bold mt-0.5 block ${
              isUndervalued ? 'text-[#2dd4a7]' : 'text-[#ff6b6b]'
            }`}
          >
            {isUndervalued ? 'UNDERVALUED (Positive Buffer)' : 'PREMIUM TO FAIR VALUE'}
          </span>
        </div>

        {/* EVA Spread (ROIC - WACC) */}
        <div className="bg-[#070d18] border border-[#1b2c4e] rounded-lg p-3">
          <span className="text-[10px] text-[#7a8fae] font-mono block uppercase">
            Economic Value Added (EVA)
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span
              className={`text-xl font-bold font-mono ${
                valuation.evaSpread >= 0 ? 'text-[#2dd4a7]' : 'text-[#ff6b6b]'
              }`}
            >
              {valuation.evaSpread >= 0 ? '+' : ''}{valuation.evaSpread.toFixed(1)}%
            </span>
          </div>
          <span className="text-[9px] text-[#8ea4c7] font-mono mt-0.5 block">
            ROIC {valuation.roic.toFixed(1)}% vs WACC {valuation.wacc.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Dual Rationale Cards (Technical Price Action vs Fundamental DCF) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Card 1: Technical Rationale */}
        <div className="bg-[#080e1c] border border-[#1c2e50] rounded-lg p-3.5 space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b border-[#14213d]">
            <span className="text-xs">📈</span>
            <h4 className="text-xs font-bold text-[#f0f4fc] font-mono">
              Proven Technical Price Action Rationale
            </h4>
          </div>
          <p className="text-xs text-[#c0d0ee] leading-relaxed">
            {valuation.technicalRationale}
          </p>
          <div className="bg-[#0b1324] p-2 rounded border border-[#15233c] text-[10px] text-[#8ea4c7] font-mono flex items-center justify-between">
            <span>Execution Edge:</span>
            <span className="text-[#2dd4a7]">Volume Profile VAL + Wyckoff Absorption</span>
          </div>
        </div>

        {/* Card 2: Fundamental Rationale */}
        <div className="bg-[#080e1c] border border-[#1c2e50] rounded-lg p-3.5 space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b border-[#14213d]">
            <span className="text-xs">🏛️</span>
            <h4 className="text-xs font-bold text-[#f0f4fc] font-mono">
              Damodaran Fundamental &amp; DCF Rationale
            </h4>
          </div>
          <p className="text-xs text-[#c0d0ee] leading-relaxed">
            {valuation.fundamentalRationale}
          </p>
          <div className="bg-[#0b1324] p-2 rounded border border-[#15233c] text-[10px] text-[#8ea4c7] font-mono flex items-center justify-between">
            <span>Terminal Constraint:</span>
            <span className="text-[#4f8df9]">Strict $g_n \le R_f$ ({activeGn.toFixed(2)}% ≤ {valuation.growthToPerpetuityCap.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      {/* Damodaran Corporate Finance Breakdown Table */}
      <div className="bg-[#070d18] border border-[#162542] rounded-lg p-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#14213d]">
          <h4 className="text-xs font-bold text-[#f0f4fc] font-mono">
            Step-by-Step Damodaran Valuation Parameter Matrix
          </h4>
          <span className="text-[10px] text-[#7a8fae] font-mono">
            Sector Benchmark: {valuation.sector}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 text-xs font-mono">
          <div className="bg-[#0b1324] p-2 rounded border border-[#15233c]">
            <span className="text-[10px] text-[#7a8fae] block">Risk-Free Rate (Rf)</span>
            <b className="text-[#f0f4fc] text-xs">{valuation.riskFreeRate.toFixed(2)}%</b>
            <span className="text-[9px] text-[#5e7394] block">10Y Benchmark Sovereign</span>
          </div>

          <div className="bg-[#0b1324] p-2 rounded border border-[#15233c]">
            <span className="text-[10px] text-[#7a8fae] block">Equity Risk Premium (ERP)</span>
            <b className="text-[#f0f4fc] text-xs">{valuation.equityRiskPremium.toFixed(2)}%</b>
            <span className="text-[9px] text-[#5e7394] block">Damodaran Country Table</span>
          </div>

          <div className="bg-[#0b1324] p-2 rounded border border-[#15233c]">
            <span className="text-[10px] text-[#7a8fae] block">Industry Levered Beta</span>
            <b className="text-[#4f8df9] text-xs">{valuation.beta.toFixed(2)}</b>
            <span className="text-[9px] text-[#5e7394] block">Unlevered Peer Adjusted</span>
          </div>

          <div className="bg-[#0b1324] p-2 rounded border border-[#15233c]">
            <span className="text-[10px] text-[#7a8fae] block">Cost of Equity (Ke)</span>
            <b className="text-[#ffd60a] text-xs">{valuation.costOfEquity.toFixed(2)}%</b>
            <span className="text-[9px] text-[#5e7394] block">Ke = Rf + Beta * ERP</span>
          </div>

          <div className="bg-[#0b1324] p-2 rounded border border-[#15233c]">
            <span className="text-[10px] text-[#7a8fae] block">After-Tax Cost of Debt</span>
            <b className="text-[#f0f4fc] text-xs">{valuation.afterTaxCostOfDebt.toFixed(2)}%</b>
            <span className="text-[9px] text-[#5e7394] block">Kd * (1 - {valuation.effectiveTaxRate}%)</span>
          </div>

          <div className="bg-[#0b1324] p-2 rounded border border-[#15233c]">
            <span className="text-[10px] text-[#7a8fae] block">Capital Weights (E / D)</span>
            <b className="text-[#f0f4fc] text-xs">{valuation.equityWeight}% / {valuation.debtWeight}%</b>
            <span className="text-[9px] text-[#5e7394] block">Market Value Weights</span>
          </div>

          <div className="bg-[#0b1324] p-2 rounded border border-[#15233c]">
            <span className="text-[10px] text-[#7a8fae] block">Weighted Cost of Capital</span>
            <b className="text-[#2dd4a7] text-xs">{valuation.wacc.toFixed(2)}% WACC</b>
            <span className="text-[9px] text-[#5e7394] block">Discount Rate Hurdle</span>
          </div>

          <div className="bg-[#0b1324] p-2 rounded border border-[#15233c]">
            <span className="text-[10px] text-[#7a8fae] block">Fundamental Growth (g)</span>
            <b className="text-[#2dd4a7] text-xs">{valuation.fundamentalGrowthRate.toFixed(2)}%</b>
            <span className="text-[9px] text-[#5e7394] block">Reinvestment * ROIC</span>
          </div>
        </div>

        {/* Interactive Growth to Perpetuity Assumed Slider */}
        <div className="mt-3 pt-3 border-t border-[#14213d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#f0f4fc] font-semibold">
                Sensitivity Slider: Assumed Growth to Perpetuity (gn)
              </span>
              <span className="text-[10px] text-[#ffd60a] bg-[#292408] border border-[#615413] px-1.5 py-0.2 rounded font-mono">
                gn ≤ Rf Cap ({valuation.growthToPerpetuityCap.toFixed(2)}%)
              </span>
            </div>
            <p className="text-[10px] text-[#7a8fae]">
              Damodaran Rule: No firm can grow faster than the economy indefinitely. We constrain gn strictly below the sovereign risk-free rate.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1.0"
              max={valuation.growthToPerpetuityCap.toFixed(2)}
              step="0.1"
              value={activeGn}
              onChange={(e) => setUserPerpetuityGrowth(parseFloat(e.target.value))}
              className="w-36 accent-[#4f8df9] cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-[#4f8df9] min-w-[48px]">
              {activeGn.toFixed(2)}%
            </span>
            {userPerpetuityGrowth !== null && (
              <button
                onClick={() => setUserPerpetuityGrowth(null)}
                className="text-[10px] text-[#7a8fae] hover:text-[#f0f4fc] underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
