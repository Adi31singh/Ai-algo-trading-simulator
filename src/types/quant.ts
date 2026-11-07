/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MarketProfile {
  id: 'in' | 'us' | 'global' | 'us_high_vol' | 'in_mid_cap' | 'forex_major' | 'pl' | 'uk' | 'eu' | 'jp' | 'hk' | 'ca';
  name: string;
  country: string;
  currencySymbol: string;
  currencyCode: string;
  defaultStock: string;
  defaultPrice: number;
  defaultQty: number;
  tickSize: number;
  brokerageFlat: number; // in local currency
  brokeragePercent: number; // e.g. 0.0019 for 0.19%
  minBrokerage: number;
  turnoverTaxRate: number; // dynamic regulatory & exchange tax rate
  taxDescription: string;
  volatilityMultiplier?: number; // preset volatility scalar
  typicalPoolSize?: number; // preset liquidity pool order count
  sampleSymbols: { name: string; price: number; desc: string }[];
}

export type TimeframeHorizon = '1m' | '15m' | '4h' | '1d';

export interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  vw?: number;
  sd?: number;
  time?: number;
}

export type AggressorSide = 1 | -1 | 0; // 1 = Buying, -1 = Selling, 0 = Balanced

export interface VAMPPhaseInfo {
  key: 'V' | 'A' | 'M' | 'P';
  title: string;
  subtitle: string;
  description: string;
  institutionalIntent: string;
  color: string;
}

export interface CARSItem {
  id: 'C' | 'A' | 'R' | 'S';
  letter: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  ruleTitle: string;
  mathFormula: string;
  plainEnglishExplanation: string;
  entryZone: string;
  invalidationLevel: string;
}

export interface BrokerApiConfig {
  id: 'zerodha' | 'alpaca' | 'ibkr' | 'ing_dm';
  name: string;
  provider: string;
  region: 'India' | 'US / Global' | 'Poland / EU';
  authType: 'API Key + Secret' | 'OAuth 2.0 / Client Secret' | 'TWS Gateway / Gateway REST' | 'ING DM FIX / Web API';
  sandboxSupported: boolean;
  docUrl: string;
  features: string[];
  defaultEndpoint: string;
}

export type MasterTraderId = 'wyckoff' | 'livermore' | 'weinstein' | 'minervini' | 'tudor_jones';

export interface MasterTraderPlaybook {
  id: MasterTraderId;
  name: string;
  trader: string;
  era: string;
  coreQuote: string;
  corePrinciple: string;
  ruleTitle: string;
  formula: string;
  plainEnglish: string;
  entryTrigger: string;
  stopLossRule: string;
  profitRunway: string;
  bestHorizon: string;
  svgType: 'spring' | 'pivot' | 'stage2' | 'vcp' | 'asymmetry';
}

export interface AiAdvisorySignal {
  id: string;
  symbol: string;
  horizon: TimeframeHorizon;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  breakEvenPrice: number;
  netRR: number;
  riskCapitalPercent: number; // strictly <= 1.0%
  sharesRecommended: number;
  gatekeeperStatus: 'APPROVED' | 'BLOCKED_BY_GATEKEEPER';
  blockReason?: string;
  masterTraderPattern: string;
  timestamp: number;
  confidenceScore: number;
  reasoning: string;
}
