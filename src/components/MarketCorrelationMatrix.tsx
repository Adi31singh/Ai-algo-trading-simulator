/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MarketProfile } from '../types/quant';

interface BenchmarkIndex {
  symbol: string;
  name: string;
  region: string;
  assetClass: 'Equities' | 'Commodity' | 'Volatility' | 'Bonds' | 'Currency';
  baseCorrelation: number; // default baseline correlation with active market
  rollingBeta: number;
  systemicRiskType: string;
  description: string;
}

interface CorrelationMatrixProps {
  currentMarket: MarketProfile;
}

export const MarketCorrelationMatrix: React.FC<CorrelationMatrixProps> = ({ currentMarket }) => {
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>('SPX');
  const [timeWindow, setTimeWindow] = useState<'30D' | '90D' | '1Y'>('30D');

  // Benchmark global indexes and systemic risk proxies
  const benchmarks: BenchmarkIndex[] = useMemo(() => {
    // Dynamic correlation coefficients tailored to the user's active market profile
    const isIndia = currentMarket.id === 'in' || currentMarket.id === 'in_mid_cap';
    const isUS = currentMarket.id === 'us' || currentMarket.id === 'us_high_vol';
    const isForex = currentMarket.id === 'forex_major';

    return [
      {
        symbol: 'SPX',
        name: 'S&P 500',
        region: 'US / Global',
        assetClass: 'Equities',
        baseCorrelation: isUS ? 0.94 : isIndia ? 0.62 : isForex ? -0.38 : 0.71,
        rollingBeta: isUS ? (currentMarket.id === 'us_high_vol' ? 1.68 : 1.12) : isIndia ? 0.78 : 0.45,
        systemicRiskType: 'Global Liquidity & Macro Beta',
        description: 'Primary global equity anchor. High correlation means local asset moves lockstep with Federal Reserve liquidity cycles.',
      },
      {
        symbol: 'NIFTY50',
        name: 'NIFTY 50',
        region: 'India (NSE)',
        assetClass: 'Equities',
        baseCorrelation: isIndia ? 0.96 : isUS ? 0.58 : isForex ? 0.22 : 0.48,
        rollingBeta: isIndia ? (currentMarket.id === 'in_mid_cap' ? 1.42 : 1.05) : 0.65,
        systemicRiskType: 'Emerging Market Capital Inflows',
        description: 'South Asian growth bellwether. Divergence from global equities signifies strong domestic retail liquidity decoupling.',
      },
      {
        symbol: 'XAUUSD',
        name: 'Gold Spot',
        region: 'Global',
        assetClass: 'Commodity',
        baseCorrelation: isForex ? 0.42 : isUS ? -0.22 : -0.18,
        rollingBeta: isForex ? 0.85 : -0.35,
        systemicRiskType: 'Flight to Safety / Inflation Hedge',
        description: 'Safe-haven liquidity pool. Negative correlation indicates risk-on appetite; positive correlation alerts to systemic fear.',
      },
      {
        symbol: 'VIX',
        name: 'CBOE Volatility Index',
        region: 'Global',
        assetClass: 'Volatility',
        baseCorrelation: isUS ? -0.76 : isIndia ? -0.61 : -0.45,
        rollingBeta: isUS ? (currentMarket.id === 'us_high_vol' ? -2.15 : -1.45) : -1.2,
        systemicRiskType: 'Market Tail-Risk & Gamma Squeeze',
        description: 'Equity fear index. Sharp negative correlation implies market drops coincide with violent implied volatility spikes.',
      },
      {
        symbol: 'DXY',
        name: 'US Dollar Index',
        region: 'Global FX',
        assetClass: 'Currency',
        baseCorrelation: isForex ? -0.88 : isIndia ? -0.49 : -0.32,
        rollingBeta: isForex ? -1.18 : -0.62,
        systemicRiskType: 'Dollar Shortage & EM FX Depreciation',
        description: 'Global reserve funding currency. Strong dollar exerts systemic margin compression across emerging equities and raw commodities.',
      },
      {
        symbol: 'US10Y',
        name: 'US 10-Year Treasury Yield',
        region: 'US / Global Debt',
        assetClass: 'Bonds',
        baseCorrelation: isUS ? 0.38 : isIndia ? 0.24 : -0.15,
        rollingBeta: 0.55,
        systemicRiskType: 'Discount Rate / Cost of Capital Shock',
        description: 'Risk-free benchmark yield. Yield spikes trigger systemic valuation multiple compression in high-beta and growth stocks.',
      },
    ];
  }, [currentMarket.id]);

  // Adjust correlation based on time window
  const windowMultiplier = timeWindow === '30D' ? 1.0 : timeWindow === '90D' ? 0.94 : 0.88;

  const activeBenchmarkObj = benchmarks.find((b) => b.symbol === selectedBenchmark) || benchmarks[0];

  // Systemic risk classification
  const getRiskClassification = (corr: number, beta: number) => {
    if (Math.abs(corr) > 0.8 && beta > 1.3) {
      return {
        level: 'HIGH SYSTEMIC BETA',
        color: 'text-[#ff6b6b]',
        bg: 'bg-[#2b171c]',
        border: 'border-[#52232a]',
        badge: '⚠ High Vulnerability',
      };
    }
    if (corr < -0.4) {
      return {
        level: 'HEDGE / FLIGHT-TO-QUALITY',
        color: 'text-[#2dd4a7]',
        bg: 'bg-[#122822]',
        border: 'border-[#204a3e]',
        badge: '🛡️ Natural Counter-Weight',
      };
    }
    return {
      level: 'MODERATE CORRELATION',
      color: 'text-[#ffd60a]',
      bg: 'bg-[#2a2414]',
      border: 'border-[#4d401e]',
      badge: '⚖️ Idiosyncratic Driver',
    };
  };

  return (
    <div className="bg-[#0b1324] border border-[#1b2c4e] rounded-xl p-5 shadow-lg">
      {/* Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#14213d]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffd60a]" />
            <h3 className="text-sm font-bold text-[#f0f4fc] tracking-wider uppercase font-mono">
              Global Market Correlation Matrix & Systemic Risk Radar
            </h3>
          </div>
          <p className="text-xs text-[#8ea4c7] mt-1">
            Real-time multi-asset correlation, rolling beta coefficients, and macro contagion risks for{' '}
            <strong className="text-[#4f8df9] font-mono">{currentMarket.defaultStock} ({currentMarket.name})</strong>.
          </p>
        </div>

        {/* Time Window Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7a8fae] font-mono">Rolling Window:</span>
          <div className="flex items-center bg-[#070d18] border border-[#1b2c4e] rounded-lg p-0.5 text-xs font-mono">
            {(['30D', '90D', '1Y'] as const).map((win) => (
              <button
                key={win}
                onClick={() => setTimeWindow(win)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  timeWindow === win
                    ? 'bg-[#1a2d54] text-[#f0f4fc] font-semibold'
                    : 'text-[#8ea4c7] hover:text-[#f0f4fc]'
                }`}
              >
                {win}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Correlation Heatmap Strip + Detailed Systemic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4">
        {/* Heatmap Matrix Table (7 cols) */}
        <div className="lg:col-span-7 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1b2c4e] text-[#7a8fae]">
                <th className="py-2.5 px-3 font-normal">Benchmark Index</th>
                <th className="py-2.5 px-3 font-normal">Asset Class</th>
                <th className="py-2.5 px-3 font-normal text-right">Correlation (r)</th>
                <th className="py-2.5 px-3 font-normal text-right">Beta (β)</th>
                <th className="py-2.5 px-3 font-normal text-center">Systemic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14213d]">
              {benchmarks.map((b) => {
                const adjCorr = parseFloat((b.baseCorrelation * windowMultiplier).toFixed(2));
                const risk = getRiskClassification(adjCorr, b.rollingBeta);
                const isSelected = selectedBenchmark === b.symbol;

                return (
                  <tr
                    key={b.symbol}
                    onClick={() => setSelectedBenchmark(b.symbol)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#132240] border-l-2 border-[#4f8df9]' : 'hover:bg-[#0e192f]'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#f0f4fc]">{b.symbol}</span>
                        <span className="text-[11px] text-[#7a8fae] font-sans">({b.name})</span>
                      </div>
                      <span className="text-[10px] text-[#5e7394] font-sans block">{b.region}</span>
                    </td>

                    <td className="py-3 px-3 text-[#8ea4c7]">{b.assetClass}</td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Mini Heat Indicator */}
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            adjCorr >= 0.7
                              ? 'bg-[#4f8df9]'
                              : adjCorr >= 0.3
                              ? 'bg-[#2dd4a7]'
                              : adjCorr <= -0.5
                              ? 'bg-[#ff6b6b]'
                              : 'bg-[#ffd60a]'
                          }`}
                        />
                        <span
                          className={`font-semibold ${
                            adjCorr >= 0.6
                              ? 'text-[#4f8df9]'
                              : adjCorr <= -0.4
                              ? 'text-[#ff6b6b]'
                              : 'text-[#ffd60a]'
                          }`}
                        >
                          {adjCorr > 0 ? `+${adjCorr.toFixed(2)}` : adjCorr.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-semibold text-[#f0f4fc]">
                      {b.rollingBeta.toFixed(2)}x
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${risk.bg} ${risk.color} ${risk.border}`}
                      >
                        {risk.badge}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detailed Systemic Risk Drilldown Card (5 cols) */}
        <div className="lg:col-span-5 bg-[#080e1c] border border-[#162542] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#14213d]">
              <div>
                <span className="text-[10px] font-mono text-[#ffd60a] uppercase tracking-wider block">
                  Systemic Macro Drilldown
                </span>
                <h4 className="text-base font-bold text-[#f0f4fc]">
                  {currentMarket.defaultStock} vs. {activeBenchmarkObj.name} ({activeBenchmarkObj.symbol})
                </h4>
              </div>
              <span className="text-xs font-mono font-semibold text-[#4f8df9] bg-[#112344] px-2 py-1 rounded">
                {timeWindow} Window
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-3">
              <div className="bg-[#0e182c] border border-[#1b2b4b] rounded-lg p-2.5">
                <span className="text-[10px] text-[#7a8fae] block">Correlation Coefficient</span>
                <b className="text-lg font-mono font-bold text-[#4f8df9]">
                  {(activeBenchmarkObj.baseCorrelation * windowMultiplier) > 0 ? '+' : ''}
                  {(activeBenchmarkObj.baseCorrelation * windowMultiplier).toFixed(2)}
                </b>
                <span className="text-[10px] text-[#5e7394] block mt-0.5">
                  -1.0 (Inverse) to +1.0 (Identical)
                </span>
              </div>

              <div className="bg-[#0e182c] border border-[#1b2b4b] rounded-lg p-2.5">
                <span className="text-[10px] text-[#7a8fae] block">Rolling Portfolio Beta</span>
                <b className="text-lg font-mono font-bold text-[#ffd60a]">
                  {activeBenchmarkObj.rollingBeta.toFixed(2)}x
                </b>
                <span className="text-[10px] text-[#5e7394] block mt-0.5">
                  Sensitivity to 1% benchmark move
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-[#0e182c] border border-[#1b2b4b] rounded-lg p-3">
                <strong className="text-[#f0f4fc] block mb-1">
                  Primary Risk Factor: {activeBenchmarkObj.systemicRiskType}
                </strong>
                <p className="text-[#8ea4c7] leading-relaxed">
                  {activeBenchmarkObj.description}
                </p>
              </div>

              <div className="bg-[#0e182c] border border-[#1b2b4b] rounded-lg p-3">
                <strong className="text-[#2dd4a7] block mb-1">Quant Protective Protocol:</strong>
                <p className="text-[#8ea4c7] leading-relaxed">
                  {Math.abs(activeBenchmarkObj.baseCorrelation) > 0.7
                    ? `Caution: When ${activeBenchmarkObj.symbol} experiences a systemic drawdown or flash crash, avoid adding long exposure regardless of technical wicks.`
                    : activeBenchmarkObj.baseCorrelation < -0.4
                    ? `Safe-Haven Dynamics: Active price action in ${activeBenchmarkObj.symbol} acts as natural friction hedge against broad equity drawdown.`
                    : `Low systemic spillover: Market price action is primarily driven by idiosyncratic volume absorption and local order flow.`}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#14213d] flex items-center justify-between text-[11px] text-[#5e7394] font-mono">
            <span>Formula: Cov(Ra, Rb) / (σa · σb)</span>
            <span>Net-of-tax positive expectancy focus</span>
          </div>
        </div>
      </div>
    </div>
  );
};
