/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MarketProfile, TimeframeHorizon, AiAdvisorySignal } from '../types/quant';
import { Tooltip } from './Tooltip';

interface AiAdvisoryRadarProps {
  currentMarket: MarketProfile;
  currentHorizon: TimeframeHorizon;
  lastPrice: number;
  vwapZScore: number;
  breakEvenPrice: number;
  targetNetPrice: number;
  entryPrice: number;
  quantity: number;
  totalFriction: number;
  authToken?: string | null;
  onOpenJournal?: () => void;
}

export const AiAdvisoryRadar: React.FC<AiAdvisoryRadarProps> = ({
  currentMarket,
  currentHorizon,
  lastPrice,
  vwapZScore,
  breakEvenPrice,
  targetNetPrice,
  entryPrice,
  quantity,
  totalFriction,
  authToken,
  onOpenJournal,
}) => {
  const [accountCapital, setAccountCapital] = useState<number>(
    currentMarket.currencySymbol === '₹' ? 500000 : currentMarket.currencySymbol === '$' ? 50000 : 150000
  );
  const [maxRiskPercent, setMaxRiskPercent] = useState<number>(1.0); // 1.0% hard risk ceiling
  const [activeSignal, setActiveSignal] = useState<AiAdvisorySignal | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [isSavingTrade, setIsSavingTrade] = useState<boolean>(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<{
    decision: string;
    expectancyRating: string;
    executiveSummary: string;
    institutionalInsight: string;
    riskScore: number;
    netRR: string;
    feeHurdleCleared: boolean;
  } | null>(null);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);

  // Institutional Sentiment Gauge State (Gemini 3.8 Flash + Search Grounding)
  const [sentimentGauge, setSentimentGauge] = useState<{
    sentimentScore: number; // 0-100 (0=Extreme Risk-Off, 100=Extreme Risk-On)
    regime: string;
    volatilityState: string;
    volatilityScore: number;
    trendStrength: number;
    macroDriver: string;
    actionableGuidance: string;
    sources?: Array<{ title: string; uri: string }>;
  }>({
    sentimentScore: 58,
    regime: 'MODERATE_RISK_ON',
    volatilityState: 'NORMAL',
    volatilityScore: 42,
    trendStrength: 64,
    macroDriver: 'Order book liquidity reflects steady accumulation around the primary VWAP value area.',
    actionableGuidance: 'Net expectancy hurdle cleared; maintain stop-loss strictly behind structure.',
    sources: [],
  });
  const [isFetchingGauge, setIsFetchingGauge] = useState<boolean>(false);

  // Fetch or refresh Institutional Sentiment Gauge from Gemini API
  const refreshSentimentGauge = async () => {
    setIsFetchingGauge(true);
    try {
      const res = await fetch('/api/ai/sentiment-gauge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: currentMarket.defaultStock,
          marketName: currentMarket.name,
          horizon: currentHorizon,
          vwapZScore: vwapZScore,
          currentPrice: lastPrice,
          currencySymbol: currentMarket.currencySymbol,
        }),
      });
      const data = await res.json();
      if (data.success && data.gauge) {
        setSentimentGauge(data.gauge);
      }
    } catch (e) {
      console.warn('Sentiment gauge fetch error:', e);
    } finally {
      setIsFetchingGauge(false);
    }
  };

  // Auto-refresh sentiment gauge when asset or horizon changes
  useEffect(() => {
    refreshSentimentGauge();
  }, [currentMarket.id, currentHorizon]);

  // Generate dynamic real-time institutional advisory setup
  useEffect(() => {
    const symbol = currentMarket.defaultStock;
    const isBullishExt = vwapZScore <= -1.4;
    const isOverbought = vwapZScore >= 1.8;

    const stopDistance = Math.max(lastPrice * 0.015, currentMarket.tickSize * 4);
    const stopLoss = isBullishExt ? lastPrice - stopDistance : lastPrice - stopDistance;
    const rewardDistance = stopDistance * 3.2;
    const targetPrice = lastPrice + rewardDistance;

    // Strict 1% risk position sizing formula:
    // Risk amount = accountCapital * (maxRiskPercent / 100)
    // Shares = Risk amount / (Entry - StopLoss)
    const dollarRisk = accountCapital * (maxRiskPercent / 100);
    const riskPerShare = Math.max(Math.abs(lastPrice - stopLoss), currentMarket.tickSize);
    const recommendedShares = Math.max(1, Math.floor(dollarRisk / riskPerShare));

    // Fee shield clearance check:
    const grossProfit = rewardDistance * recommendedShares;
    const estimatedTaxesAndFees = totalFriction * (recommendedShares / Math.max(quantity, 1));
    const netProfit = grossProfit - estimatedTaxesAndFees;
    const netRR = dollarRisk > 0 ? netProfit / dollarRisk : 0;

    const clearsFeeShield = netProfit > 0 && netRR >= 2.0;
    const isPositiveExpectancy = clearsFeeShield && (isBullishExt || Math.abs(vwapZScore) >= 1.0);

    const patternName = isBullishExt
      ? 'Wyckoff Spring & VWAP Mean-Reversion'
      : isOverbought
      ? 'Exhaustion Extension (+2σ)'
      : 'Minervini VCP Compression';

    setActiveSignal({
      id: `sig_${Date.now()}`,
      symbol,
      horizon: currentHorizon,
      direction: isOverbought ? 'SHORT' : 'LONG',
      entryPrice: lastPrice,
      stopLoss,
      targetPrice,
      breakEvenPrice,
      netRR: parseFloat(netRR.toFixed(2)),
      riskCapitalPercent: maxRiskPercent,
      sharesRecommended: recommendedShares,
      gatekeeperStatus: isPositiveExpectancy ? 'APPROVED' : 'BLOCKED_BY_GATEKEEPER',
      blockReason: !clearsFeeShield
        ? 'Insufficient structural runway to clear exchange taxes by 2:1 net ratio.'
        : undefined,
      masterTraderPattern: patternName,
      timestamp: Date.now(),
      confidenceScore: isPositiveExpectancy ? 88 : 42,
      reasoning: isPositiveExpectancy
        ? `Statistical edge confirmed: Z-score is ${vwapZScore.toFixed(2)}σ with ${patternName}. Net reward exceeds friction hurdles by ${netRR.toFixed(1)}:1.`
        : `Chop warning: Net runway fails to beat regulatory tax friction and brokerage. Pre-trade gatekeeper halted execution to protect capital.`,
    });
  }, [
    currentMarket,
    currentHorizon,
    lastPrice,
    vwapZScore,
    breakEvenPrice,
    accountCapital,
    maxRiskPercent,
    totalFriction,
    quantity,
  ]);

  // Call the server-side AI trade audit endpoint
  const handleDeepAiAudit = async () => {
    if (!activeSignal) return;
    setIsAuditing(true);
    setShowAuditModal(true);

    try {
      const response = await fetch('/api/ai/audit-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: activeSignal.symbol,
          horizon: activeSignal.horizon,
          entryPrice: activeSignal.entryPrice,
          stopLoss: activeSignal.stopLoss,
          targetPrice: activeSignal.targetPrice,
          breakEvenPrice: activeSignal.breakEvenPrice,
          marketName: currentMarket.name,
          currencySymbol: currentMarket.currencySymbol,
          vwapZScore: vwapZScore,
          masterPattern: activeSignal.masterTraderPattern,
          accountSize: accountCapital,
          maxRiskPercent: maxRiskPercent,
          totalFriction: totalFriction,
        }),
      });

      const data = await response.json();
      if (data.success && data.audit) {
        setAuditResult(data.audit);
      } else {
        // Fallback result
        setAuditResult({
          decision: activeSignal.gatekeeperStatus,
          expectancyRating: activeSignal.gatekeeperStatus === 'APPROVED' ? 'HIGH_POSITIVE' : 'NEGATIVE_CHOP',
          executiveSummary: activeSignal.reasoning,
          institutionalInsight: `Calculated net reward-to-risk after taxes is ${activeSignal.netRR}:1 with max 1% account risk.`,
          riskScore: activeSignal.gatekeeperStatus === 'APPROVED' ? 2 : 8,
          netRR: activeSignal.netRR.toString(),
          feeHurdleCleared: activeSignal.gatekeeperStatus === 'APPROVED',
        });
      }
    } catch (err) {
      console.warn('AI audit fetch error, using local fallback:', err);
      setAuditResult({
        decision: activeSignal.gatekeeperStatus,
        expectancyRating: activeSignal.gatekeeperStatus === 'APPROVED' ? 'HIGH_POSITIVE' : 'NEGATIVE_CHOP',
        executiveSummary: activeSignal.reasoning,
        institutionalInsight: `Local quant rules verified: Risk strictly bounded under ${maxRiskPercent}% of capital.`,
        riskScore: activeSignal.gatekeeperStatus === 'APPROVED' ? 3 : 8,
        netRR: activeSignal.netRR.toString(),
        feeHurdleCleared: activeSignal.gatekeeperStatus === 'APPROVED',
      });
    } finally {
      setIsAuditing(false);
    }
  };

  if (!activeSignal) return null;

  const isApproved = activeSignal.gatekeeperStatus === 'APPROVED';

  return (
    <div className="bg-[#0b1324] border border-[#1b2c4e] rounded-xl p-4 shadow-md relative overflow-hidden">
      {/* Top Banner: Status & Pre-Trade Gatekeeper Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#14213d]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isApproved ? 'bg-[#2dd4a7] animate-pulse' : 'bg-[#ff6b6b]'
              }`}
            />
            <span className="text-xs font-bold text-[#f0f4fc] tracking-wider uppercase font-mono">
              AI Algorithmic Radar
            </span>
          </div>

          <span
            className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${
              isApproved
                ? 'bg-[#122822] text-[#2dd4a7] border-[#204a3e]'
                : 'bg-[#2b171c] text-[#ff6b6b] border-[#52232a]'
            }`}
          >
            {isApproved ? '✓ APPROVED: POSITIVE EXPECTANCY' : '⚠ BLOCKED: CHOP & TAX FRICTION'}
          </span>
        </div>

        {/* Capital Preservation Configs */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#8ea4c7]">
            <span>Account:</span>
            <input
              type="number"
              step="10000"
              value={accountCapital}
              onChange={(e) => setAccountCapital(Number(e.target.value))}
              className="w-24 bg-[#070d18] border border-[#1b2c4e] text-[#f0f4fc] rounded px-2 py-0.5 text-xs text-right"
            />
            <span>{currentMarket.currencySymbol}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#8ea4c7]">
            <span>Max Risk:</span>
            <span className="text-[#ffd60a] font-semibold">{maxRiskPercent.toFixed(1)}%</span>
            <span className="text-[10px] text-[#5e7394]">
              ({currentMarket.currencySymbol}
              {((accountCapital * maxRiskPercent) / 100).toLocaleString()})
            </span>
          </div>

          <button
            onClick={handleDeepAiAudit}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#4f8df9] hover:bg-[#6099fa] text-[#080d19] transition-all cursor-pointer whitespace-nowrap shadow-sm"
          >
            🤖 Audit with AI (Gemini)
          </button>

          {/* Cloud SQL Journal Action */}
          {authToken ? (
            <button
              onClick={async () => {
                if (!activeSignal || isSavingTrade) return;
                setIsSavingTrade(true);
                setSavedSuccessMsg(null);
                try {
                  const res = await fetch('/api/trades', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                      symbol: activeSignal.symbol,
                      market: currentMarket.id,
                      horizon: activeSignal.horizon,
                      direction: activeSignal.direction,
                      entryPrice: activeSignal.entryPrice,
                      stopLoss: activeSignal.stopLoss,
                      targetPrice: activeSignal.targetPrice,
                      breakEvenPrice: activeSignal.breakEvenPrice,
                      shares: activeSignal.sharesRecommended,
                      netRR: activeSignal.netRR,
                      pattern: activeSignal.masterTraderPattern,
                      aiGatekeeperDecision: activeSignal.gatekeeperStatus,
                      notes: activeSignal.reasoning,
                    }),
                  });
                  const json = await res.json();
                  if (json.success) {
                    setSavedSuccessMsg('✓ Logged to Cloud SQL');
                    setTimeout(() => setSavedSuccessMsg(null), 3000);
                  }
                } catch (e) {
                  console.error('Failed to log trade to SQL:', e);
                } finally {
                  setIsSavingTrade(false);
                }
              }}
              disabled={isSavingTrade}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#193229] hover:bg-[#204a3e] text-[#2dd4a7] border border-[#204a3e] transition-all cursor-pointer whitespace-nowrap shadow-sm disabled:opacity-50"
            >
              {isSavingTrade ? 'Saving...' : savedSuccessMsg || '💾 Log to Cloud SQL'}
            </button>
          ) : (
            <button
              onClick={onOpenJournal}
              title="Sign in with Google to enable Cloud SQL journal logging"
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#142038] hover:bg-[#1b2c4e] text-[#8ea4c7] border border-[#23355b] transition-all cursor-pointer whitespace-nowrap"
            >
              🔒 Sign In to Log Trades
            </button>
          )}
        </div>
      </div>

      {/* Main Advisory Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 my-3">
        <div className="bg-[#080e1c] border border-[#162542] rounded-lg p-2.5">
          <span className="text-[10px] text-[#7a8fae] block">Instrument & Horizon</span>
          <b className="text-sm font-mono font-semibold text-[#f0f4fc]">
            {activeSignal.symbol}{' '}
            <span className="text-xs text-[#4f8df9] font-normal font-sans">
              [{currentHorizon.toUpperCase()}]
            </span>
          </b>
        </div>

        <div className="bg-[#080e1c] border border-[#162542] rounded-lg p-2.5">
          <span className="text-[10px] text-[#7a8fae] block">Entry Level</span>
          <b className="text-sm font-mono font-semibold text-[#f0f4fc]">
            {currentMarket.currencySymbol}
            {activeSignal.entryPrice.toFixed(2)}
          </b>
        </div>

        <div className="bg-[#080e1c] border border-[#162542] rounded-lg p-2.5">
          <span className="text-[10px] text-[#ff6b6b] block">Invalidation Stop (1%)</span>
          <b className="text-sm font-mono font-semibold text-[#ff6b6b]">
            {currentMarket.currencySymbol}
            {activeSignal.stopLoss.toFixed(2)}
          </b>
        </div>

        <div className="bg-[#080e1c] border border-[#162542] rounded-lg p-2.5">
          <span className="text-[10px] text-[#2dd4a7] block">Target Net Profit</span>
          <b className="text-sm font-mono font-semibold text-[#2dd4a7]">
            {currentMarket.currencySymbol}
            {activeSignal.targetPrice.toFixed(2)}
          </b>
        </div>

        <div className="bg-[#080e1c] border border-[#162542] rounded-lg p-2.5">
          <span className="text-[10px] text-[#7a8fae] block">Recommended Size</span>
          <b className="text-sm font-mono font-semibold text-[#ffd60a]">
            {activeSignal.sharesRecommended.toLocaleString()} shs
          </b>
        </div>

        <div className="bg-[#080e1c] border border-[#162542] rounded-lg p-2.5">
          <span className="text-[10px] text-[#7a8fae] block">Net R:R (After Tax)</span>
          <b
            className={`text-sm font-mono font-semibold ${
              activeSignal.netRR >= 2 ? 'text-[#2dd4a7]' : 'text-[#ff6b6b]'
            }`}
          >
            {activeSignal.netRR.toFixed(2)} : 1
          </b>
        </div>
      </div>

      {/* Narrative & Institutional Rationale */}
      <div className="text-xs text-[#8ea4c7] bg-[#080e1c] border border-[#162542] rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <strong className="text-[#f0f4fc] mr-1">Pattern Detected:</strong>
          <span className="text-[#ffd60a] font-medium">{activeSignal.masterTraderPattern}</span>
          <p className="text-[#c0d0ee] mt-0.5">{activeSignal.reasoning}</p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-[#5e7394] block font-mono">Expectancy Confidence</span>
          <span className="text-sm font-mono font-bold text-[#f0f4fc]">
            {activeSignal.confidenceScore}%
          </span>
        </div>
      </div>

      {/* Institutional Sentiment Gauge: Real-Time Risk-Off vs. Risk-On Meter */}
      <div className="mt-3 bg-[#070d1a] border border-[#182744] rounded-lg p-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#121e35]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4f8df9] animate-pulse" />
            <h4 className="text-xs font-bold text-[#f0f4fc] tracking-wider uppercase font-mono">
              Institutional Sentiment Gauge
            </h4>
            <span className="text-[10px] text-[#7a8fae] font-sans">
              (Gemini 3.8 Flash · Volatility &amp; Trend Strength Grounding)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                sentimentGauge.sentimentScore >= 65
                  ? 'bg-[#122822] text-[#2dd4a7] border-[#204a3e]'
                  : sentimentGauge.sentimentScore <= 35
                  ? 'bg-[#2b171c] text-[#ff6b6b] border-[#52232a]'
                  : 'bg-[#2a2414] text-[#ffd60a] border-[#4d401e]'
              }`}
            >
              {sentimentGauge.sentimentScore >= 65
                ? '⚡ RISK-ON APPETITE'
                : sentimentGauge.sentimentScore <= 35
                ? '🛡️ RISK-OFF DEFENSIVE'
                : '⚖️ EQUILIBRIUM CHOP'}
            </span>

            <button
              onClick={refreshSentimentGauge}
              disabled={isFetchingGauge}
              className="text-[10px] font-mono text-[#8ea4c7] hover:text-[#f0f4fc] px-2 py-1 bg-[#101b30] hover:bg-[#162542] rounded border border-[#1d2e50] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isFetchingGauge ? 'Analyzing...' : '↻ Refresh Gauge'}
            </button>
          </div>
        </div>

        {/* Gauge Bar & Dual Meters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-3 items-center">
          {/* Main Risk-Off vs Risk-On Visual Needle Bar (6 cols) */}
          <div className="md:col-span-6 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-[#ff6b6b] font-semibold flex items-center gap-1">
                <span>◀ 0</span> <span>EXTREME RISK-OFF</span>
              </span>
              <span className="text-[#8ea4c7]">
                Score: <strong className="text-[#f0f4fc] text-xs">{sentimentGauge.sentimentScore}</strong>/100
              </span>
              <span className="text-[#2dd4a7] font-semibold flex items-center gap-1">
                <span>EXTREME RISK-ON</span> <span>100 ▶</span>
              </span>
            </div>

            {/* Continuous Gradient Track with Dynamic Needle Indicator */}
            <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-[#ff4d4d] via-[#ffd60a] to-[#2dd4a7] p-[1px] overflow-hidden shadow-inner">
              <div
                className="absolute top-0 bottom-0 w-2.5 bg-white border border-[#080d19] rounded-full shadow-md transition-all duration-700 -ml-1.5"
                style={{ left: `${sentimentGauge.sentimentScore}%` }}
              />
            </div>

            <div className="flex justify-between text-[9px] text-[#5e7394] font-mono px-0.5">
              <span>Capital Preservation Priority</span>
              <span>Neutral Equilibrium</span>
              <span>Aggressive Expansion</span>
            </div>
          </div>

          {/* Volatility & Trend Strength Co-Meters (6 cols) */}
          <div className="md:col-span-6 grid grid-cols-2 gap-3">
            <div className="bg-[#0b1424] border border-[#162542] rounded-lg p-2.5">
              <div className="flex justify-between items-center text-[10px] text-[#8ea4c7] font-mono mb-1">
                <span>Volatility State:</span>
                <b className={`font-semibold ${sentimentGauge.volatilityScore > 65 ? 'text-[#ff6b6b]' : 'text-[#2dd4a7]'}`}>
                  {sentimentGauge.volatilityState}
                </b>
              </div>
              <div className="w-full bg-[#121c2e] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    sentimentGauge.volatilityScore > 65 ? 'bg-[#ff6b6b]' : 'bg-[#ffd60a]'
                  }`}
                  style={{ width: `${sentimentGauge.volatilityScore}%` }}
                />
              </div>
              <span className="text-[9px] text-[#5e7394] font-mono mt-1 block">
                Aggression Coeff: {sentimentGauge.volatilityScore}%
              </span>
            </div>

            <div className="bg-[#0b1424] border border-[#162542] rounded-lg p-2.5">
              <div className="flex justify-between items-center text-[10px] text-[#8ea4c7] font-mono mb-1">
                <span>Trend Strength:</span>
                <b className="font-semibold text-[#4f8df9] font-mono">
                  {sentimentGauge.trendStrength}%
                </b>
              </div>
              <div className="w-full bg-[#121c2e] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4f8df9] transition-all duration-500"
                  style={{ width: `${sentimentGauge.trendStrength}%` }}
                />
              </div>
              <span className="text-[9px] text-[#5e7394] font-mono mt-1 block">
                Directional Persistence
              </span>
            </div>
          </div>
        </div>

        {/* Tactical Macro Synthesis & Guidance */}
        <div className="mt-2.5 pt-2 border-t border-[#121e35] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
          <div className="text-[#8ea4c7] leading-relaxed">
            <strong className="text-[#f0f4fc] mr-1">Institutional Macro Flow:</strong>
            <span>{sentimentGauge.macroDriver}</span>{' '}
            <span className="text-[#ffd60a] font-medium ml-1">Tactical: {sentimentGauge.actionableGuidance}</span>
          </div>

          {sentimentGauge.sources && sentimentGauge.sources.length > 0 && (
            <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
              <span className="text-[#5e7394]">Grounded Web Sources:</span>
              {sentimentGauge.sources.slice(0, 2).map((s, idx) => (
                <a
                  key={idx}
                  href={s.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#4f8df9] hover:underline truncate max-w-[120px]"
                  title={s.title}
                >
                  {s.title}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Deep Audit Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0d172b] border border-[#22355e] rounded-xl max-w-xl w-full p-6 text-[#dce5f5] shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-[#1b2c4e]">
              <div>
                <span className="text-[10px] font-mono text-[#4f8df9] uppercase tracking-wider block">
                  Gemini 3.8 Flash · Algorithmic Risk Officer
                </span>
                <h3 className="text-base font-bold text-[#f0f4fc]">
                  Institutional Pre-Trade Risk & Expectancy Audit
                </h3>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-[#8ea4c7] hover:text-[#f0f4fc] p-1 rounded hover:bg-[#182847] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {isAuditing ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-[#4f8df9] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#8ea4c7] font-mono">
                  Auditing order flow, tax friction drag, and VWAP deviation...
                </p>
              </div>
            ) : auditResult ? (
              <div className="space-y-4 my-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a1222] border border-[#1b2c4e]">
                  <div>
                    <span className="text-[10px] text-[#7a8fae] block">Gatekeeper Verdict</span>
                    <b
                      className={`text-sm font-mono font-bold ${
                        auditResult.decision === 'APPROVED' ? 'text-[#2dd4a7]' : 'text-[#ff6b6b]'
                      }`}
                    >
                      {auditResult.decision === 'APPROVED' ? '✓ APPROVED FOR EXECUTION' : '⛔ REJECTED BY GATEKEEPER'}
                    </b>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#7a8fae] block">Risk Score (1-10)</span>
                    <b
                      className={`text-base font-mono font-bold ${
                        auditResult.riskScore <= 4 ? 'text-[#2dd4a7]' : 'text-[#ff6b6b]'
                      }`}
                    >
                      {auditResult.riskScore} / 10
                    </b>
                  </div>
                </div>

                <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-3 text-xs leading-relaxed">
                  <strong className="text-[#f0f4fc] block mb-1">Executive Summary:</strong>
                  <p className="text-[#c0d0ee]">{auditResult.executiveSummary}</p>
                </div>

                <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-3 text-xs leading-relaxed">
                  <strong className="text-[#4f8df9] block mb-1">Structural Edge:</strong>
                  <p className="text-[#8ea4c7]">{auditResult.institutionalInsight}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-[#111c33] p-2 rounded border border-[#1f2f50]">
                    <span className="text-[#7a8fae] block text-[10px]">Net R:R Ratio:</span>
                    <b className="text-[#2dd4a7]">{auditResult.netRR} : 1</b>
                  </div>
                  <div className="bg-[#111c33] p-2 rounded border border-[#1f2f50]">
                    <span className="text-[#7a8fae] block text-[10px]">Fee Shield Cleared:</span>
                    <b className={auditResult.feeHurdleCleared ? 'text-[#2dd4a7]' : 'text-[#ff6b6b]'}>
                      {auditResult.feeHurdleCleared ? 'YES (Profitable Net of Tax)' : 'NO (Fails Tax Hurdle)'}
                    </b>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-3 border-t border-[#1b2c4e]">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#182847] hover:bg-[#22355e] text-[#f0f4fc] cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
