/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { MarketProfile } from '../types/quant';
import { Tooltip } from './Tooltip';

interface FeeShieldCalculatorProps {
  currentMarket: MarketProfile;
  entryPrice: number;
  setEntryPrice: (p: number) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  targetNetProfit: number;
  setTargetNetProfit: (t: number) => void;
  brokerageFlat: number;
  setBrokerageFlat: (b: number) => void;
  turnoverTaxRate: number;
  setTurnoverTaxRate: (r: number) => void;
  onSelectMarket: (id: any) => void;
}

export const FeeShieldCalculator: React.FC<FeeShieldCalculatorProps> = ({
  currentMarket,
  entryPrice,
  setEntryPrice,
  quantity,
  setQuantity,
  targetNetProfit,
  setTargetNetProfit,
  brokerageFlat,
  setBrokerageFlat,
  turnoverTaxRate,
  setTurnoverTaxRate,
  onSelectMarket,
}) => {
  // Format utility
  const fmt = (num: number, decimals = 2) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Safe numerical calculations
  const {
    breakEvenPrice,
    targetPrice,
    frictionAtBreakEven,
    brokerageTotal,
    taxesTotal,
    ticksToClear,
    percentAboveEntry,
    scalpRows,
    verdictMessage,
    isScalpPositiveAtOneTick,
  } = useMemo(() => {
    const e = Math.max(0.01, entryPrice);
    const q = Math.max(1, quantity);
    const t = Math.max(0, targetNetProfit);
    const r = Math.max(0, turnoverTaxRate);
    const b = Math.max(0, brokerageFlat);

    // Break-even and target price formulas:
    // Net = S * q - e * q - b - r * (e * q + S * q) = Target
    // S * q * (1 - r) = e * q * (1 + r) + b + Target
    const denom = q * (1 - r);
    const baseCost = e * q * (1 + r) + b;
    const be = denom > 0 ? baseCost / denom : e;
    const tg = denom > 0 ? (baseCost + t) / denom : e;

    const buyValue = e * q;
    const sellValueAtBe = be * q;
    const taxes = r * (buyValue + sellValueAtBe);
    const totalFriction = b + taxes;
    const diffPerShare = be - e;
    const pct = e > 0 ? (diffPerShare / e) * 100 : 0;
    const ticks = currentMarket.tickSize > 0 ? Math.ceil(diffPerShare / currentMarket.tickSize - 1e-9) : 0;

    // Scalp test function: gross move per share (m)
    const calcNetForMove = (movePerShare: number) => {
      const gross = movePerShare * q;
      const sellVal = (e + movePerShare) * q;
      const tradeTaxes = r * (buyValue + sellVal);
      const totalCost = b + tradeTaxes;
      return gross - totalCost;
    };

    // Scalp test steps based on market tick size
    const tick = currentMarket.tickSize;
    const testMoves = [tick, tick * 2, tick * 5, tick * 10, tick * 20];

    const rows = testMoves.map((m) => {
      const gross = m * q;
      const net = calcNetForMove(m);
      return {
        move: m,
        gross,
        net,
        isPositive: net >= 0,
      };
    });

    const oneTickNet = calcNetForMove(tick);
    const isOneTickOk = oneTickNet >= 0;

    let verdict = '';
    if (!isOneTickOk) {
      verdict = `At this position size (${q} shares), a 1-tick scalp (${currentMarket.currencySymbol}${tick.toFixed(
        2
      )}) generates ${currentMarket.currencySymbol}${fmt(tick * q)} gross, but incurs ${currentMarket.currencySymbol}${fmt(
        totalFriction
      )} in exchange & tax friction, resulting in a net loss of ${currentMarket.currencySymbol}${fmt(
        Math.abs(oneTickNet)
      )}. Price must travel at least ${ticks} ticks (${currentMarket.currencySymbol}${fmt(
        diffPerShare
      )}/sh) before you make a single unit of currency.`;
    } else {
      verdict = `High position size allows absorption of base friction! A 1-tick move clears both flat fees and turnover taxes with ${currentMarket.currencySymbol}${fmt(
        oneTickNet
      )} in net profit.`;
    }

    return {
      breakEvenPrice: be,
      targetPrice: tg,
      frictionAtBreakEven: totalFriction,
      brokerageTotal: b,
      taxesTotal: taxes,
      ticksToClear: ticks,
      percentAboveEntry: pct,
      scalpRows: rows,
      verdictMessage: verdict,
      isScalpPositiveAtOneTick: isOneTickOk,
    };
  }, [entryPrice, quantity, targetNetProfit, turnoverTaxRate, brokerageFlat, currentMarket.tickSize, currentMarket.currencySymbol]);

  return (
    <div className="bg-[#0d172b] border border-[#1e2f52] rounded-xl p-5 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#182847]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-[#f0f4fc]">4. The Interactive Fee Shield Calculator</h2>
            <Tooltip
              term="Tax Comfortable Break-Even Price"
              explanation="The true hurdle rate: you must beat this exact price level just to clear government turnover taxes, stamp duties, and brokerage before booking profit."
            >
              <span className="text-[11px] font-mono text-[#ffd60a] bg-[#292408] border border-[#615413] px-2 py-0.5 rounded cursor-pointer">
                Structural Friction Guard
              </span>
            </Tooltip>
          </div>
          <p className="text-xs text-[#8ea4c7] mt-1 max-w-2xl">
            Institutional traders never scalp without accounting for clearing fees, stamp duties, and regulatory drag.
          </p>
        </div>

        {/* Market Selector Dropdown Menu */}
        <div className="flex items-center gap-2">
          <label htmlFor="market-select" className="text-xs text-[#8ea4c7] font-medium whitespace-nowrap">
            Market Profile:
          </label>
          <select
            id="market-select"
            value={currentMarket.id}
            onChange={(e) => onSelectMarket(e.target.value as any)}
            className="bg-[#111c33] border border-[#2b406e] text-[#f0f4fc] text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#4f8df9] cursor-pointer"
          >
            <option value="in">🇮🇳 Indian Intraday Equities (NSE)</option>
            <option value="in_mid_cap">🇮🇳 Indian Equities - Mid Cap</option>
            <option value="us">🇺🇸 US Equities (Standard)</option>
            <option value="us_high_vol">⚡ US Equities - High Volatility</option>
            <option value="forex_major">🌐 Forex - Major Pairs (EUR/USD)</option>
            <option value="global">🇪🇺 Global Markets (ING Dom Maklerskie)</option>
          </select>
        </div>
      </div>

      {/* Preset Liquid Stock Pills */}
      <div className="flex flex-wrap items-center gap-2 my-3">
        <span className="text-[11px] text-[#5e7394] font-medium">Quick Presets:</span>
        {currentMarket.sampleSymbols.map((s) => (
          <button
            key={s.name}
            onClick={() => setEntryPrice(s.price)}
            className="text-xs font-mono text-[#8ea4c7] hover:text-[#f0f4fc] bg-[#0a1222] hover:bg-[#152340] border border-[#1b2c4e] px-2.5 py-1 rounded transition-colors cursor-pointer"
            title={s.desc}
          >
            {s.name} ({currentMarket.currencySymbol}{s.price.toFixed(1)})
          </button>
        ))}
      </div>

      {/* Primary Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="stock-entry-price" className="block text-[11px] text-[#8ea4c7] font-medium mb-1">
            Stock Entry Price ({currentMarket.currencySymbol})
          </label>
          <input
            id="stock-entry-price"
            type="number"
            step={currentMarket.tickSize}
            min="0.1"
            value={entryPrice}
            onChange={(e) => setEntryPrice(Number(e.target.value))}
            className="w-full bg-[#0a1222] border border-[#1b2c4e] focus:border-[#4f8df9] text-[#f0f4fc] rounded-lg px-3 py-2 font-mono text-sm focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="share-quantity" className="block text-[11px] text-[#8ea4c7] font-medium mb-1">
            Share Quantity (Size)
          </label>
          <input
            id="share-quantity"
            type="number"
            step="1"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full bg-[#0a1222] border border-[#1b2c4e] focus:border-[#4f8df9] text-[#f0f4fc] rounded-lg px-3 py-2 font-mono text-sm focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="target-net-profit" className="block text-[11px] text-[#8ea4c7] font-medium mb-1">
            Target Net Profit ({currentMarket.currencySymbol})
          </label>
          <input
            id="target-net-profit"
            type="number"
            step="50"
            min="0"
            value={targetNetProfit}
            onChange={(e) => setTargetNetProfit(Number(e.target.value))}
            className="w-full bg-[#0a1222] border border-[#1b2c4e] focus:border-[#4f8df9] text-[#f0f4fc] rounded-lg px-3 py-2 font-mono text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Fee & Tax Parameter Adjusters (Non-hardcoded) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#182847]">
        <div>
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-[#8ea4c7]">Base Brokerage / Commission ({currentMarket.currencySymbol})</span>
            <span className="font-mono text-[#f0f4fc] font-semibold">{currentMarket.currencySymbol}{brokerageFlat.toFixed(2)}</span>
          </div>
          <input
            type="number"
            step="1"
            min="0"
            value={brokerageFlat}
            onChange={(e) => setBrokerageFlat(Number(e.target.value))}
            className="w-full bg-[#0a1222] border border-[#1b2c4e] text-[#f0f4fc] rounded px-2.5 py-1 text-xs font-mono"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-[#8ea4c7]">Turnover Tax & Regulatory Rate</span>
            <span className="font-mono text-[#f0f4fc] font-semibold">{(turnoverTaxRate * 100).toFixed(4)}%</span>
          </div>
          <input
            type="number"
            step="0.0001"
            min="0"
            value={turnoverTaxRate}
            onChange={(e) => setTurnoverTaxRate(Number(e.target.value))}
            className="w-full bg-[#0a1222] border border-[#1b2c4e] text-[#f0f4fc] rounded px-2.5 py-1 text-xs font-mono"
          />
        </div>
      </div>

      {/* Tax Comfortable Break-Even Card (Glow) */}
      <div className="mt-4 p-4 rounded-xl border border-[#6b5a0a] bg-[#1a1805] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-[#ffd60a] font-mono uppercase tracking-wider block">
              ★ TAX COMFORTABLE BREAK-EVEN PRICE (SHIELD LINE)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-mono font-bold text-[#ffd60a]">
                {currentMarket.currencySymbol}{fmt(breakEvenPrice)}
              </span>
              <span className="text-xs font-mono text-[#ffd60a]/80">
                (+{currentMarket.currencySymbol}{fmt(breakEvenPrice - entryPrice)} / sh, +{fmt(percentAboveEntry, 3)}%)
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#8ea4c7] block">Required Move</span>
            <b className="text-base font-mono font-semibold text-[#f0f4fc]">
              {ticksToClear} Ticks <span className="text-xs text-[#5e7394]">({currentMarket.tickSize.toFixed(2)} ea)</span>
            </b>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
        <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-2.5">
          <span className="text-[11px] text-[#7a8fae] block">Sell Price for Target</span>
          <b className="text-sm font-mono font-semibold text-[#2dd4a7]">
            {currentMarket.currencySymbol}{fmt(targetPrice)}
          </b>
        </div>

        <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-2.5">
          <span className="text-[11px] text-[#7a8fae] block">Friction at Break-Even</span>
          <b className="text-sm font-mono font-semibold text-[#ffd60a]">
            {currentMarket.currencySymbol}{fmt(frictionAtBreakEven)}
          </b>
        </div>

        <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-2.5">
          <span className="text-[11px] text-[#7a8fae] block">Brokerage + Taxes</span>
          <b className="text-xs font-mono text-[#8ea4c7]">
            {currentMarket.currencySymbol}{fmt(brokerageTotal)} + {currentMarket.currencySymbol}{fmt(taxesTotal)}
          </b>
        </div>

        <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-2.5">
          <span className="text-[11px] text-[#7a8fae] block">Tick Size</span>
          <b className="text-sm font-mono font-semibold text-[#f0f4fc]">
            {currentMarket.currencySymbol}{currentMarket.tickSize.toFixed(2)}
          </b>
        </div>
      </div>

      {/* Scalp Friction Stress Test Table */}
      <div className="mt-4 pt-3 border-t border-[#182847]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#f0f4fc]">
            Scalp Stress Test: Net P&L After Regulatory Friction
          </span>
          <span className="text-[10px] text-[#5e7394] font-mono">Size: {quantity} shares</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1b2c4e] text-[#7a8fae]">
                <th className="py-1.5 px-2 font-normal">Gross Move / Share</th>
                <th className="py-1.5 px-2 font-normal text-right">Gross P&L</th>
                <th className="py-1.5 px-2 font-normal text-right">Net P&L (After Tax & Fees)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14213d]">
              {scalpRows.map((r, i) => (
                <tr key={i} className="hover:bg-[#111c33]/50 transition-colors">
                  <td className="py-1.5 px-2 text-[#c0d0ee]">
                    +{currentMarket.currencySymbol}{fmt(r.move, 2)} ({Math.round(r.move / currentMarket.tickSize)} ticks)
                  </td>
                  <td className="py-1.5 px-2 text-right text-[#c0d0ee]">
                    +{currentMarket.currencySymbol}{fmt(r.gross)}
                  </td>
                  <td
                    className={`py-1.5 px-2 text-right font-semibold ${
                      r.isPositive ? 'text-[#2dd4a7]' : 'text-[#ff6b6b]'
                    }`}
                  >
                    {r.net >= 0 ? '+' : '−'}
                    {currentMarket.currencySymbol}{fmt(Math.abs(r.net))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verdict Callout */}
        <div
          className={`mt-3 p-3 rounded-lg text-xs leading-relaxed border ${
            isScalpPositiveAtOneTick
              ? 'bg-[#122822] border-[#204a3e] text-[#2dd4a7]'
              : 'bg-[#29171b] border-[#59252d] text-[#ff8585]'
          }`}
        >
          <strong>Quant Scalp Verdict:</strong> {verdictMessage}
        </div>
      </div>
    </div>
  );
};
