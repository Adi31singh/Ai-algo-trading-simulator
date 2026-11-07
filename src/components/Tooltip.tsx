/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface TooltipProps {
  term?: string;
  explanation: string;
  children?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const GLOSSARY_TERMS: Record<string, string> = {
  VWAP: "Volume-Weighted Average Price: The true benchmark average price paid by institutional trading algorithms throughout the trading day.",
  'Standard Deviation Bands': "Statistical envelopes (±1σ = 68.2%, ±2σ = 95.4% of price action). When price reaches ±2σ, it is mathematically stretched and prone to mean-reversion.",
  'V.A.M.P. framework': "Volume, Absorption, Manipulation, Positioning: The 4-step sequence institutional desks execute to fill massive orders against retail liquidity.",
  'C.A.R.S.': "Context, Asymmetry, Rejection, Structure: The 4-pillar quantitative checklist to validate high-probability trading setups before risking capital.",
  'Quant Entry Zone': "The precise mathematical price pocket where institutional buyers step in after stop runs or structural retests.",
  'Invalidation Stop Level': "The exact price where the institutional thesis is statistically broken. Exiting here prevents catastrophic losses.",
  'Tax Comfortable Break-Even Price': "The higher price you must reach just to pay off government turnover taxes, exchange fees, and brokerage before keeping a single cent in profit.",
  'Retail Stop-Loss Liquidity Pool': "A cluster of protective stop orders resting under obvious support lows. Institutions target this pool to fill large buy orders cheaply.",
  'Absorption Reversal': "When aggressive institutional buying completely soaks up panic selling, causing price to violently bounce upwards.",
  'Institutional Aggressive Order Volume': "Large market orders placed by quantitative funds to intentionally sweep the order book and initiate directional momentum.",
};

export const Tooltip: React.FC<TooltipProps> = ({
  term,
  explanation,
  children,
  align = 'center',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const text = explanation || (term && GLOSSARY_TERMS[term]) || '';

  const alignClasses =
    align === 'left'
      ? 'left-0'
      : align === 'right'
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  return (
    <span
      className={`relative inline-flex items-center group cursor-help ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      tabIndex={0}
      role="tooltip"
      aria-label={text}
    >
      {children ? (
        children
      ) : (
        <span className="border-b border-dotted border-[#4f8df9]/70 text-[#f0f4fc] group-hover:text-[#4f8df9] transition-colors">
          {term}
        </span>
      )}

      {isVisible && text && (
        <span
          className={`absolute bottom-full mb-2 ${alignClasses} z-50 w-64 p-2.5 text-xs font-normal text-[#dce5f5] bg-[#0c162c] border border-[#233860] rounded-lg shadow-2xl pointer-events-none transition-all duration-150 leading-relaxed`}
        >
          {term && <strong className="text-[#4f8df9] block font-semibold mb-1">{term}</strong>}
          <span>{text}</span>
          {/* Subtle arrow pointer */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#233860]" />
        </span>
      )}
    </span>
  );
};
