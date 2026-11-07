/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MarketProfile } from '../types/quant';

export interface MacroHeadline {
  title: string;
  source: string;
  impact: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  summary: string;
}

export interface MacroContextData {
  macroBias: 'TAILWIND' | 'NEUTRAL' | 'HEADWIND';
  sentimentModifier: number; // e.g. +14 or -10
  centralBankStatus: string;
  gdpInflationPrint: string;
  earningsOutlook: string;
  headlines: MacroHeadline[];
  actionableSynthesis: string;
}

interface FundamentalContextPanelProps {
  currentMarket: MarketProfile;
  onApplySentimentModifier?: (modifier: number, bias: string) => void;
}

export const FundamentalContextPanel: React.FC<FundamentalContextPanelProps> = ({
  currentMarket,
  onApplySentimentModifier,
}) => {
  const [data, setData] = useState<MacroContextData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMacroContext = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/macro/headlines?symbol=${encodeURIComponent(currentMarket.defaultStock)}&market=${encodeURIComponent(currentMarket.name)}`
      );
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (onApplySentimentModifier) {
          onApplySentimentModifier(json.sentimentModifier, json.macroBias);
        }
      } else {
        setError('Unable to fetch macro context feed.');
      }
    } catch (e: any) {
      setError(e.message || 'Error connecting to macro intelligence service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMacroContext();
  }, [currentMarket.defaultStock, currentMarket.name]);

  return (
    <div className="bg-[#0b1324] border border-[#1b2c4e] rounded-xl p-5 shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#14213d]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4f8df9] animate-pulse" />
            <h3 className="text-sm font-bold text-[#f0f4fc] tracking-wider uppercase font-mono">
              Fundamental Context &amp; Macro Headlines
            </h3>
            <span className="text-[10px] font-mono text-[#4f8df9] bg-[#142340] border border-[#233860] px-2 py-0.5 rounded">
              Gemini 3.8 Flash Macro Intelligence
            </span>
          </div>
          <p className="text-xs text-[#8ea4c7] mt-1">
            Real-time global events, central bank policy (Fed/RBI), GDP, and quarterly earnings synthesized for{' '}
            <strong className="text-[#f0f4fc] font-mono">{currentMarket.defaultStock}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {data && (
            <div className="flex items-center gap-2 bg-[#080d18] border border-[#1a2b4b] px-3 py-1 rounded-lg font-mono text-xs">
              <span className="text-[#7a8fae]">Sentiment Modifier:</span>
              <span
                className={`font-bold ${
                  data.sentimentModifier > 0
                    ? 'text-[#2dd4a7]'
                    : data.sentimentModifier < 0
                    ? 'text-[#ff6b6b]'
                    : 'text-[#ffd60a]'
                }`}
              >
                {data.sentimentModifier > 0 ? `+${data.sentimentModifier}` : data.sentimentModifier} pts
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  data.macroBias === 'TAILWIND'
                    ? 'bg-[#122822] text-[#2dd4a7]'
                    : data.macroBias === 'HEADWIND'
                    ? 'bg-[#2b171c] text-[#ff6b6b]'
                    : 'bg-[#2a2414] text-[#ffd60a]'
                }`}
              >
                {data.macroBias}
              </span>
            </div>
          )}

          <button
            onClick={fetchMacroContext}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-[#142038] hover:bg-[#1c3054] text-[#c0d0ee] border border-[#233860] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Fetching...' : '↻ Refresh Headlines'}
          </button>
        </div>
      </div>

      {/* Content Body */}
      {isLoading ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-7 h-7 border-2 border-[#4f8df9] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#8ea4c7] font-mono">
            Synthesizing central bank interest rate meetings, GDP prints, and corporate earnings for {currentMarket.defaultStock}...
          </p>
        </div>
      ) : error ? (
        <div className="my-4 p-3 rounded-lg bg-[#2b171c] border border-[#52232a] text-[#ff8585] text-xs font-mono">
          {error}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4">
          {/* Key Macro Pillars (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-[#080e1c] border border-[#162542] rounded-xl p-3.5 space-y-2.5">
              <span className="text-[10px] font-mono text-[#ffd60a] uppercase tracking-wider block">
                🏛️ Central Bank &amp; Monetary Stance
              </span>
              <p className="text-xs text-[#dce5f5] leading-relaxed">
                {data.centralBankStatus}
              </p>
            </div>

            <div className="bg-[#080e1c] border border-[#162542] rounded-xl p-3.5 space-y-2.5">
              <span className="text-[10px] font-mono text-[#2dd4a7] uppercase tracking-wider block">
                📊 National GDP &amp; Inflation Print
              </span>
              <p className="text-xs text-[#dce5f5] leading-relaxed">
                {data.gdpInflationPrint}
              </p>
            </div>

            <div className="bg-[#080e1c] border border-[#162542] rounded-xl p-3.5 space-y-2.5">
              <span className="text-[10px] font-mono text-[#4f8df9] uppercase tracking-wider block">
                📈 Corporate Earnings &amp; Financial Health
              </span>
              <p className="text-xs text-[#dce5f5] leading-relaxed">
                {data.earningsOutlook}
              </p>
            </div>
          </div>

          {/* Top Headlines Feed (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono text-[#7a8fae] uppercase tracking-wider block">
                Top Macroeconomic &amp; National News Items
              </span>

              {data.headlines.map((hl, idx) => (
                <div
                  key={idx}
                  className="bg-[#080e1c] hover:bg-[#101b33] border border-[#162542] rounded-xl p-3 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-[#f0f4fc]">
                        {hl.title}
                      </h4>
                      <p className="text-[11px] text-[#8ea4c7] mt-1 leading-relaxed">
                        {hl.summary}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          hl.impact === 'BULLISH'
                            ? 'bg-[#122822] text-[#2dd4a7]'
                            : hl.impact === 'BEARISH'
                            ? 'bg-[#2b171c] text-[#ff6b6b]'
                            : 'bg-[#2a2414] text-[#ffd60a]'
                        }`}
                      >
                        {hl.impact}
                      </span>
                      <span className="text-[9px] text-[#5e7394] font-mono block mt-1">
                        {hl.source}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actionable Synthesis Banner */}
            <div className="p-3 rounded-lg bg-[#0e1c38] border border-[#1e3a70] text-xs">
              <div className="flex items-center gap-1.5 text-[#4f8df9] font-mono font-bold text-[11px] mb-1">
                <span>⚡ Actionable Synthesis:</span>
              </div>
              <p className="text-[#c5d8fb] leading-relaxed">
                {data.actionableSynthesis}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
