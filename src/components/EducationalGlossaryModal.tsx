/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface EducationalGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationalGlossaryModal: React.FC<EducationalGlossaryModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const topics = [
    {
      term: 'VWAP (Volume-Weighted Average Price)',
      analogy: 'The true "Wholesale Fair Price"',
      explanation:
        'Think of VWAP as the average price paid by all major bank and hedge fund algorithms throughout the day. If price is far below VWAP, smart money considers it "on sale." If price is far above, it is "overpriced."',
      keyRule: 'Never buy aggressively when price is already stretched far above VWAP (+2σ).',
    },
    {
      term: 'Standard Deviation Bands (±1σ & ±2σ)',
      analogy: 'The Elastic Rubber Band',
      explanation:
        'Price behaves like a rubber band stretched around VWAP. About 68% of the day’s trades happen inside the ±1σ band. When price stretches all the way out to ±2σ, it has reached an extreme and usually snaps back toward the middle.',
      keyRule: '±2σ touches are prime reversal zones; inside ±1σ is unpredictable noise.',
    },
    {
      term: 'The V.A.M.P. Stop Hunt Mechanism',
      analogy: 'The "Engineered Liquidity Trap"',
      explanation:
        'When a hedge fund wants to buy 1,000,000 shares, they cannot just click "Market Buy" without pushing the price way up (slippage). Instead, they deliberately push price down below the obvious floor where amateur retail traders hide their "Stop Loss" orders. When those stops trigger, they turn into forced sell orders—which the institution happily buys at bargain prices.',
      keyRule: 'What looks like a scary breakdown is often institutional accumulation.',
    },
    {
      term: 'C.A.R.S. (Context, Asymmetry, Rejection, Structure)',
      analogy: 'The Pilot’s Pre-Flight Safety Checklist',
      explanation:
        'Top quantitative desks never gamble or guess. Before entering a trade, they require all four criteria: Context (is it at a discount?), Asymmetry (is the reward at least 3x the risk?), Rejection (did big buyers step in and leave a long wick?), and Structure (did price decisively close above resistance?).',
      keyRule: 'If even one pillar fails, skip the trade. No setup = No risk.',
    },
    {
      term: 'The Fee Shield & Break-Even Reality',
      analogy: 'The Casino House Edge',
      explanation:
        'Beginner traders often think they can make money by making 100 tiny "scalps" a day for 5 cents profit. However, government turnover taxes (STT/SEC), exchange transaction fees, and broker commissions eat up the entire profit. You must calculate your Tax Comfortable Break-Even line before taking any trade.',
      keyRule: 'A 1-tick scalp usually loses money after taxes. You need structural room to clear friction.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative bg-[#0d172b] border border-[#22355e] rounded-xl max-w-2xl w-full p-6 shadow-2xl text-[#dce5f5]">
        <div className="flex items-start justify-between pb-4 border-b border-[#1b2c4e]">
          <div>
            <span className="text-[10px] font-mono text-[#4f8df9] uppercase tracking-wider block">
              Non-Technical Guide
            </span>
            <h2 className="text-lg font-bold text-[#f0f4fc]">
              Institutional Trading Concepts Explained in Plain English
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#8ea4c7] hover:text-[#f0f4fc] p-1.5 rounded-lg hover:bg-[#182847] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 my-4 max-h-[65vh] overflow-y-auto pr-1">
          {topics.map((t, i) => (
            <div key={i} className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="text-sm font-semibold text-[#f0f4fc]">{t.term}</h3>
                <span className="text-xs text-[#2dd4a7] font-medium font-mono">{t.analogy}</span>
              </div>
              <p className="text-xs text-[#8ea4c7] mt-2 leading-relaxed">{t.explanation}</p>
              <div className="mt-2.5 p-2 bg-[#121e35] border border-[#1c2e50] rounded text-[11px] text-[#ffd60a] font-mono">
                💡 <strong>Golden Rule:</strong> {t.keyRule}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-[#1b2c4e]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#4f8df9] hover:bg-[#6099fa] text-[#080d19] transition-all cursor-pointer"
          >
            Got it, back to the terminal
          </button>
        </div>
      </div>
    </div>
  );
};
