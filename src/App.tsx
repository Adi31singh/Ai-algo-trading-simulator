/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { MARKET_PROFILES } from './data/marketProfiles';
import { MarketProfile, TimeframeHorizon } from './types/quant';
import { Header } from './components/Header';
import { AiAdvisoryRadar } from './components/AiAdvisoryRadar';
import { QuantEngineMatrix } from './components/QuantEngineMatrix';
import { LiquidityStage } from './components/LiquidityStage';
import { CarsDictionary } from './components/CarsDictionary';
import { MasterPlaybookSuite } from './components/MasterPlaybookSuite';
import { FeeShieldCalculator } from './components/FeeShieldCalculator';
import { BrokerApiModal } from './components/BrokerApiModal';
import { EducationalGlossaryModal } from './components/EducationalGlossaryModal';
import { TradeJournalModal } from './components/TradeJournalModal';
import { MarketCorrelationMatrix } from './components/MarketCorrelationMatrix';
import { StockSearchModal } from './components/StockSearchModal';
import { HighProbabilityOpportunities, HighProbabilityHoldingOpportunity } from './components/HighProbabilityOpportunities';
import { QuickStartGuideModal } from './components/QuickStartGuideModal';
import { FundamentalContextPanel } from './components/FundamentalContextPanel';
import { DamodaranValuationPanel } from './components/DamodaranValuationPanel';
import { DamodaranValuationResult } from './utils/damodaranValuation';

export default function App() {
  // Current active market profile (defaults to US Equities with accurate live tape & low-friction regulatory fee structure)
  const [currentMarket, setCurrentMarket] = useState<MarketProfile>(MARKET_PROFILES.us);

  // Time-Agnostic Horizon State: 1m, 15m, 4h, 1d
  const [currentHorizon, setCurrentHorizon] = useState<TimeframeHorizon>('1m');

  // Core financial state
  const [entryPrice, setEntryPrice] = useState<number>(currentMarket.defaultPrice);
  const [quantity, setQuantity] = useState<number>(currentMarket.defaultQty);
  const [targetNetProfit, setTargetNetProfit] = useState<number>(150);
  const [brokerageFlat, setBrokerageFlat] = useState<number>(currentMarket.brokerageFlat);
  const [turnoverTaxRate, setTurnoverTaxRate] = useState<number>(currentMarket.turnoverTaxRate);

  // Damodaran DCF Valuation state
  const [damodaranValuation, setDamodaranValuation] = useState<DamodaranValuationResult | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(false);

  // Macro sentiment modifier and bias state from FundamentalContextPanel
  const [macroSentimentModifier, setMacroSentimentModifier] = useState<number>(14);
  const [macroBias, setMacroBias] = useState<string>('TAILWIND');

  // Live telemetry state from chart
  const [lastTelemetry, setLastTelemetry] = useState<{
    lastPrice: number;
    zScore: number;
    barVolume: number;
  }>({
    lastPrice: currentMarket.defaultPrice,
    zScore: 0,
    barVolume: 0,
  });

  // Live Data Feed state (default ON)
  const [isLiveFeedEnabled, setIsLiveFeedEnabled] = useState<boolean>(true);

  // Modals state
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState<boolean>(false);
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState<boolean>(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isQuickGuideModalOpen, setIsQuickGuideModalOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('matrix');

  // Firebase auth & user state
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Reusable real-time exchange quote & Damodaran DCF valuation fetcher
  const fetchLiveQuoteAndValuation = async (symbol: string, currency: string, marketId: string) => {
    setIsLoadingQuote(true);
    try {
      const res = await fetch(
        `/api/market/quote?symbol=${encodeURIComponent(symbol)}&currency=${encodeURIComponent(currency)}&market=${encodeURIComponent(marketId)}`
      );
      const data = await res.json();
      if (data.success) {
        if (data.quote && typeof data.quote.price === 'number') {
          const livePrice = data.quote.price;
          setEntryPrice(livePrice);
          setCurrentMarket((prev) => ({
            ...prev,
            defaultPrice: livePrice,
          }));
          setLastTelemetry((prev) => ({
            ...prev,
            lastPrice: livePrice,
          }));
        }
        if (data.damodaran) {
          setDamodaranValuation(data.damodaran);
        }
      }
    } catch (e) {
      console.warn('Real-time quote and Damodaran valuation fetch error:', e);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  // Sync live market quote on initial mount
  useEffect(() => {
    fetchLiveQuoteAndValuation(currentMarket.defaultStock, currentMarket.currencySymbol, currentMarket.id);
  }, []);

  // Switch market / asset preset with exact realistic local brokerages and statutory taxes
  const handleSelectMarket = (marketId: string) => {
    const profile = MARKET_PROFILES[marketId] || MARKET_PROFILES.us;
    setCurrentMarket(profile);
    setEntryPrice(profile.defaultPrice);
    setQuantity(profile.defaultQty);
    setBrokerageFlat(profile.brokerageFlat);
    setTurnoverTaxRate(profile.turnoverTaxRate);

    // Set realistic default target profit depending on currency & country
    if (profile.currencySymbol === '₹') {
      setTargetNetProfit(500);
    } else if (profile.currencySymbol === '¥') {
      setTargetNetProfit(5000);
    } else if (profile.currencySymbol === 'HK$') {
      setTargetNetProfit(500);
    } else if (profile.currencySymbol === 'zł') {
      setTargetNetProfit(250);
    } else {
      setTargetNetProfit(150);
    }

    fetchLiveQuoteAndValuation(profile.defaultStock, profile.currencySymbol, profile.id);
  };

  // Handle asset selected from universal search modal with real-time price and localized fee structures
  const handleSelectSearchedStock = async (stock: {
    symbol: string;
    name: string;
    price: number;
    marketId: string;
    assetType: 'EQUITY' | 'FUTURES' | 'OPTIONS' | 'FOREX';
  }) => {
    const baseProfile = MARKET_PROFILES[stock.marketId] || currentMarket;
    const initialPrice = stock.price > 0 ? stock.price : baseProfile.defaultPrice;

    const customizedProfile: MarketProfile = {
      ...baseProfile,
      defaultStock: stock.symbol,
      defaultPrice: initialPrice,
    };
    setCurrentMarket(customizedProfile);
    setEntryPrice(initialPrice);
    setQuantity(baseProfile.defaultQty);
    setBrokerageFlat(baseProfile.brokerageFlat);
    setTurnoverTaxRate(baseProfile.turnoverTaxRate);

    if (baseProfile.currencySymbol === '₹') {
      setTargetNetProfit(500);
    } else if (baseProfile.currencySymbol === '¥') {
      setTargetNetProfit(5000);
    } else if (baseProfile.currencySymbol === 'HK$') {
      setTargetNetProfit(500);
    } else if (baseProfile.currencySymbol === 'zł') {
      setTargetNetProfit(250);
    } else {
      setTargetNetProfit(150);
    }

    setLastTelemetry({
      lastPrice: initialPrice,
      zScore: -1.2,
      barVolume: 15000,
    });

    fetchLiveQuoteAndValuation(stock.symbol, baseProfile.currencySymbol, baseProfile.id);
  };

  // Handle opportunity selected from High Probability holding list
  const handleSelectOpportunity = async (opp: HighProbabilityHoldingOpportunity) => {
    const baseProfile = MARKET_PROFILES[opp.marketId] || currentMarket;
    const customizedProfile: MarketProfile = {
      ...baseProfile,
      defaultStock: opp.ticker,
      defaultPrice: opp.currentPrice,
    };
    setCurrentMarket(customizedProfile);
    setEntryPrice(opp.currentPrice);
    setQuantity(baseProfile.defaultQty);
    setBrokerageFlat(baseProfile.brokerageFlat);
    setTurnoverTaxRate(baseProfile.turnoverTaxRate);

    if (baseProfile.currencySymbol === '₹') {
      setTargetNetProfit(500);
    } else if (baseProfile.currencySymbol === '¥') {
      setTargetNetProfit(5000);
    } else if (baseProfile.currencySymbol === 'HK$') {
      setTargetNetProfit(500);
    } else if (baseProfile.currencySymbol === 'zł') {
      setTargetNetProfit(250);
    } else {
      setTargetNetProfit(150);
    }

    setLastTelemetry({
      lastPrice: opp.currentPrice,
      zScore: -1.6, // favorable statistical buy zone
      barVolume: 18000,
    });

    // Scroll directly to Quant Engine Matrix
    scrollToSection('matrix');

    fetchLiveQuoteAndValuation(opp.ticker, baseProfile.currencySymbol, baseProfile.id);
  };

  // Calculate dynamic break-even price and target net price
  const { breakEvenPrice, targetNetPrice, totalFriction } = useMemo(() => {
    const e = Math.max(0.0001, entryPrice);
    const q = Math.max(1, quantity);
    const t = Math.max(0, targetNetProfit);
    const r = Math.max(0, turnoverTaxRate);
    const b = Math.max(0, brokerageFlat);

    const denom = q * (1 - r);
    const baseCost = e * q * (1 + r) + b;
    const be = denom > 0 ? baseCost / denom : e;
    const tg = denom > 0 ? (baseCost + t) / denom : e;
    const friction = b + r * (e * q + be * q);

    return { breakEvenPrice: be, targetNetPrice: tg, totalFriction: friction };
  }, [entryPrice, quantity, targetNetProfit, turnoverTaxRate, brokerageFlat]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#080d19] text-[#dce5f5] flex flex-col font-sans">
      {/* 3-Zone Sticky Header adhering to Top Bar Contract */}
      <Header
        currentMarket={currentMarket}
        onSelectMarket={handleSelectMarket}
        onOpenBrokerModal={() => setIsBrokerModalOpen(true)}
        onOpenGlossaryModal={() => setIsGlossaryModalOpen(true)}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onOpenQuickGuideModal={() => setIsQuickGuideModalOpen(true)}
        activeSection={activeSection}
        onNavigateSection={scrollToSection}
        onAuthChange={(user, token) => {
          setCurrentUser(user);
          setAuthToken(token);
        }}
        onOpenJournal={() => setIsJournalModalOpen(true)}
        isLiveFeedEnabled={isLiveFeedEnabled}
        onToggleLiveFeed={setIsLiveFeedEnabled}
      />

      {/* Main Educational & Algorithmic Workspace */}
      <main className="flex-1 max-w-[1540px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Real-Time AI Advisory Radar Strip & Pre-Trade Expectancy Gatekeeper */}
        <section id="radar">
          <AiAdvisoryRadar
            currentMarket={currentMarket}
            currentHorizon={currentHorizon}
            lastPrice={lastTelemetry.lastPrice}
            vwapZScore={lastTelemetry.zScore}
            breakEvenPrice={breakEvenPrice}
            targetNetPrice={targetNetPrice}
            entryPrice={entryPrice}
            quantity={quantity}
            totalFriction={totalFriction}
            authToken={authToken}
            onOpenJournal={() => setIsJournalModalOpen(true)}
            macroSentimentModifier={macroSentimentModifier}
            macroBias={macroBias}
          />
        </section>

        {/* Editorial Subtitle Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d172b]/60 border border-[#1a2846] rounded-xl px-5 py-3">
          <div className="text-xs text-[#8ea4c7]">
            <span className="font-semibold text-[#f0f4fc]">Universal Institutional Quant Terminal:</span>{' '}
            Time-agnostic trading framework with real-time AI risk gatekeeper, V.A.M.P. stop-run simulator, and master trader playbooks.
          </div>
          <div className="flex items-center gap-3 text-xs text-[#7a8fae] shrink-0 font-mono">
            <span>Asset Class: <strong className="text-[#4f8df9]">{currentMarket.name}</strong></span>
            <span>·</span>
            <span>Horizon: <strong className="text-[#ffd60a]">{currentHorizon.toUpperCase()}</strong></span>
            <span>·</span>
            <span>Currency: <strong className="text-[#2dd4a7]">{currentMarket.currencyCode} ({currentMarket.currencySymbol})</strong></span>
          </div>
        </div>

        {/* Row 1: The Quant Engine Matrix (8 cols) + Fee Shield Calculator (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section id="matrix" className="lg:col-span-8">
            <QuantEngineMatrix
              currentMarket={currentMarket}
              currentHorizon={currentHorizon}
              onHorizonChange={setCurrentHorizon}
              breakEvenPrice={breakEvenPrice}
              targetNetPrice={targetNetPrice}
              entryPrice={entryPrice}
              onTelemetryUpdate={(telemetry) => setLastTelemetry(telemetry)}
            />
          </section>

          <section id="feeshield" className="lg:col-span-4">
            <FeeShieldCalculator
              currentMarket={currentMarket}
              entryPrice={entryPrice}
              setEntryPrice={setEntryPrice}
              quantity={quantity}
              setQuantity={setQuantity}
              targetNetProfit={targetNetProfit}
              setTargetNetProfit={setTargetNetProfit}
              brokerageFlat={brokerageFlat}
              setBrokerageFlat={setBrokerageFlat}
              turnoverTaxRate={turnoverTaxRate}
              setTurnoverTaxRate={setTurnoverTaxRate}
              onSelectMarket={handleSelectMarket}
            />
          </section>
        </div>

        {/* Row 2: Universal Master Trader Playbook Suite (Full Width) */}
        <section id="playbooks">
          <MasterPlaybookSuite />
        </section>

        {/* Row 3: High-Expectancy Active Holding Opportunities (Pre-Screened Audited Setups) */}
        <section id="opportunities">
          <HighProbabilityOpportunities
            currentMarket={currentMarket}
            onSelectOpportunity={handleSelectOpportunity}
          />
        </section>

        {/* Row 4: Fundamental Context Panel & Macro Headlines (FED, GDP, Earnings) */}
        <section id="macro">
          <FundamentalContextPanel
            currentMarket={currentMarket}
            onApplySentimentModifier={(modifier, bias) => {
              setMacroSentimentModifier(modifier);
              setMacroBias(bias);
            }}
          />
        </section>

        {/* Row 5: Prof. Aswath Damodaran Corporate DCF Valuation & Dual Rationale Engine */}
        <section id="damodaran">
          <DamodaranValuationPanel
            currentMarket={currentMarket}
            currentPrice={entryPrice}
            valuation={damodaranValuation}
            onRefreshQuote={() => fetchLiveQuoteAndValuation(currentMarket.defaultStock, currentMarket.currencySymbol, currentMarket.id)}
            isLoadingQuote={isLoadingQuote}
          />
        </section>

        {/* Row 6: Market Correlation Matrix & Systemic Risk Radar */}
        <section id="correlation">
          <MarketCorrelationMatrix currentMarket={currentMarket} />
        </section>

        {/* Row 5: Animated Liquidity Stage (6 cols) + C.A.R.S. Dictionary (6 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section id="liquidity" className="lg:col-span-6">
            <LiquidityStage />
          </section>

          <section id="cars" className="lg:col-span-6">
            <CarsDictionary />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#182847] bg-[#070b15] py-4 px-6 text-xs text-[#5e7394] mt-8">
        <div className="max-w-[1540px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Quant Desk Terminal · Institutional Algorithmic Trading Advisory &amp; Master Trader Laboratory.
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Pure Client-Side Math Simulation</span>
            <span>Zero-Knowledge API Security</span>
            <span>Powered by Gemini 3.8 Flash Risk Engine</span>
          </div>
        </div>
      </footer>

      {/* Universal Stock, Futures, Options & Forex Search Modal */}
      <StockSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        currentMarket={currentMarket}
        onSelectStock={handleSelectSearchedStock}
      />

      {/* Shortest Quick-Start & Purpose Guide Modal */}
      <QuickStartGuideModal
        isOpen={isQuickGuideModalOpen}
        onClose={() => setIsQuickGuideModalOpen(false)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onNavigateSection={scrollToSection}
      />

      {/* International Brokerage API Sandbox & Integration Modal */}
      <BrokerApiModal
        isOpen={isBrokerModalOpen}
        onClose={() => setIsBrokerModalOpen(false)}
        currentMarket={currentMarket}
      />

      {/* Plain English Institutional Concepts Guide */}
      <EducationalGlossaryModal
        isOpen={isGlossaryModalOpen}
        onClose={() => setIsGlossaryModalOpen(false)}
      />

      {/* Cloud SQL PostgreSQL Trade Journal Modal */}
      <TradeJournalModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        currentUser={currentUser}
        authToken={authToken}
      />
    </div>
  );
}
