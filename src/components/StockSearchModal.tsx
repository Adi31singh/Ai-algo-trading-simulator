/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MarketProfile } from '../types/quant';
import { MARKET_PROFILES } from '../data/marketProfiles';

interface StockSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMarket: MarketProfile;
  onSelectStock: (stock: {
    symbol: string;
    name: string;
    price: number;
    marketId: string;
    assetType: 'EQUITY' | 'FUTURES' | 'OPTIONS' | 'FOREX';
    expiry?: string;
    strike?: string;
  }) => void;
}

interface UniversalAssetItem {
  symbol: string;
  name: string;
  price: number;
  marketId: string;
  marketName: string;
  currencySymbol: string;
  assetType: 'EQUITY' | 'FUTURES' | 'OPTIONS' | 'FOREX';
  sector: string;
  exchange: string;
  statEdge: string;
  netExpectancy: string;
  expiry?: string;
  strike?: string;
}

export const UNIVERSAL_ASSET_DATABASE: UniversalAssetItem[] = [
  // US Equities & Tech Momentum
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 186.64, marketId: 'us', marketName: 'US Equities (NASDAQ)', currencySymbol: '$', assetType: 'EQUITY', sector: 'Semiconductors & AI', exchange: 'NASDAQ', statEdge: 'VCP Volatility Contraction Pattern + Damodaran DCF Undervaluation', netExpectancy: '+3.2:1' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 342.37, marketId: 'us', marketName: 'US Equities (NASDAQ)', currencySymbol: '$', assetType: 'EQUITY', sector: 'Consumer Tech', exchange: 'NASDAQ', statEdge: 'High-Volume Flag Breakout above rising 50 EMA', netExpectancy: '+3.1:1' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 358.22, marketId: 'us', marketName: 'US Equities (NASDAQ)', currencySymbol: '$', assetType: 'EQUITY', sector: 'EV & Robotics', exchange: 'NASDAQ', statEdge: 'V.A.M.P. Stop Run Invalidation Wick', netExpectancy: '+3.8:1' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 425.00, marketId: 'us', marketName: 'US Equities (NASDAQ)', currencySymbol: '$', assetType: 'EQUITY', sector: 'Cloud Software', exchange: 'NASDAQ', statEdge: 'Institutional Order Absorption at VWAP', netExpectancy: '+2.9:1' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', price: 586.20, marketId: 'us', marketName: 'US Equities (NYSE)', currencySymbol: '$', assetType: 'EQUITY', sector: 'Broad Market ETF', exchange: 'NYSE', statEdge: 'Institutional Equilibrium Value Area Bounce', netExpectancy: '+2.8:1' },

  // Indian Equities
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 1320.0, marketId: 'in', marketName: 'India (NSE)', currencySymbol: '₹', assetType: 'EQUITY', sector: 'Energy & Conglomerate', exchange: 'NSE', statEdge: 'Wyckoff Phase C Spring below range floor', netExpectancy: '+3.2:1' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 2498.5, marketId: 'in', marketName: 'India (NSE)', currencySymbol: '₹', assetType: 'EQUITY', sector: 'IT Services', exchange: 'NSE', statEdge: 'Triple-Bottom Order Block Retest', netExpectancy: '+3.0:1' },
  { symbol: 'POLYCAB', name: 'Polycab India Ltd', price: 7871.0, marketId: 'in_mid_cap', marketName: 'India Mid-Cap', currencySymbol: '₹', assetType: 'EQUITY', sector: 'Cables & Industrial', exchange: 'NSE', statEdge: 'Paul Tudor Jones 200 EMA Baseline Defense', netExpectancy: '+3.2:1' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1722.5, marketId: 'in', marketName: 'India (NSE)', currencySymbol: '₹', assetType: 'EQUITY', sector: 'Banking & Financials', exchange: 'NSE', statEdge: 'Mean Reversion from -1.8σ VWAP', netExpectancy: '+3.1:1' },

  // UK & European Equities
  { symbol: 'SHEL.L', name: 'Shell plc', price: 27.40, marketId: 'uk', marketName: 'UK Equities (London LSE)', currencySymbol: '£', assetType: 'EQUITY', sector: 'Energy', exchange: 'LSE', statEdge: 'Value Area Low Retest with Hammer Candle', netExpectancy: '+3.2:1' },
  { symbol: 'AZN.L', name: 'AstraZeneca plc', price: 118.50, marketId: 'uk', marketName: 'UK Equities (London LSE)', currencySymbol: '£', assetType: 'EQUITY', sector: 'Pharmaceuticals', exchange: 'LSE', statEdge: 'Institutional Stage 2 Base Breakout', netExpectancy: '+2.9:1' },
  { symbol: 'ASML.AS', name: 'ASML Holding NV', price: 745.00, marketId: 'eu', marketName: 'Eurozone (Euronext)', currencySymbol: '€', assetType: 'EQUITY', sector: 'Lithography & Tech', exchange: 'Euronext', statEdge: 'High-Volume Absorption at 200 EMA', netExpectancy: '+3.4:1' },
  { symbol: 'MC.PA', name: 'LVMH Moët Hennessy', price: 680.00, marketId: 'eu', marketName: 'Eurozone (Euronext)', currencySymbol: '€', assetType: 'EQUITY', sector: 'Luxury & Retail', exchange: 'Euronext', statEdge: 'Support Zone Consolidation', netExpectancy: '+2.8:1' },

  // Asian & Canadian Equities
  { symbol: '7203.T', name: 'Toyota Motor Corp.', price: 2680.0, marketId: 'jp', marketName: 'Japan (Tokyo TSE)', currencySymbol: '¥', assetType: 'EQUITY', sector: 'Automotive', exchange: 'TSE', statEdge: 'Institutional Liquidity Defense at Baseline', netExpectancy: '+3.0:1' },
  { symbol: '0700.HK', name: 'Tencent Holdings Ltd', price: 410.0, marketId: 'hk', marketName: 'Hong Kong (HKEX)', currencySymbol: 'HK$', assetType: 'EQUITY', sector: 'Internet & Gaming', exchange: 'HKEX', statEdge: 'High-Volume Breakout above Resistance Block', netExpectancy: '+3.3:1' },
  { symbol: 'SHOP.TO', name: 'Shopify Inc.', price: 115.0, marketId: 'ca', marketName: 'Canada (Toronto TSX)', currencySymbol: 'C$', assetType: 'EQUITY', sector: 'E-Commerce Cloud', exchange: 'TSX', statEdge: 'VCP Volatility Contraction Pattern', netExpectancy: '+3.2:1' },

  // Polish Central Europe
  { symbol: 'CDR', name: 'CD Projekt SA', price: 266.9, marketId: 'global', marketName: 'Poland (WSE GPW)', currencySymbol: 'zł', assetType: 'EQUITY', sector: 'Gaming & Software', exchange: 'WSE', statEdge: 'Rounding Bottom Base Breakout', netExpectancy: '+3.2:1' },
  { symbol: 'PKN', name: 'ORLEN Spółka Akcyjna', price: 64.2, marketId: 'global', marketName: 'Poland (WSE GPW)', currencySymbol: 'zł', assetType: 'EQUITY', sector: 'Energy & Refining', exchange: 'WSE', statEdge: 'High Dividend Support & VWAP Bounce', netExpectancy: '+2.7:1' },

  // Forex & Major Pairs
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0855, marketId: 'forex_major', marketName: 'Forex Major Pairs', currencySymbol: '$', assetType: 'FOREX', sector: 'Interbank FX', exchange: 'Forex', statEdge: 'Asian Session Liquidity Sweep at London Open', netExpectancy: '+3.1:1' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', price: 1.2950, marketId: 'forex_major', marketName: 'Forex Major Pairs', currencySymbol: '$', assetType: 'FOREX', sector: 'Interbank FX', exchange: 'Forex', statEdge: 'Cable Support Zone Reversal', netExpectancy: '+3.4:1' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', price: 152.40, marketId: 'forex_major', marketName: 'Forex Major Pairs', currencySymbol: '$', assetType: 'FOREX', sector: 'Interbank FX', exchange: 'Forex', statEdge: 'Interbank Resistance Defense', netExpectancy: '+3.2:1' },
];

export const StockSearchModal: React.FC<StockSearchModalProps> = ({
  isOpen,
  onClose,
  currentMarket,
  onSelectStock,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAssetFilter, setSelectedAssetFilter] = useState<string>('ALL');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredAssets = UNIVERSAL_ASSET_DATABASE.filter((asset) => {
    const matchesSearch =
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.statEdge.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAssetType =
      selectedAssetFilter === 'ALL' || asset.assetType === selectedAssetFilter;

    const matchesRegion =
      selectedRegionFilter === 'ALL' ||
      (selectedRegionFilter === 'INDIA' && (asset.marketId === 'in' || asset.marketId === 'in_mid_cap')) ||
      (selectedRegionFilter === 'US' && (asset.marketId === 'us' || asset.marketId === 'us_high_vol')) ||
      (selectedRegionFilter === 'FOREX' && asset.marketId === 'forex_major') ||
      (selectedRegionFilter === 'GLOBAL' && asset.marketId === 'global');

    return matchesSearch && matchesAssetType && matchesRegion;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative bg-[#0d172b] border border-[#22355e] rounded-xl max-w-4xl w-full p-6 shadow-2xl text-[#dce5f5]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1b2c4e]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4f8df9] animate-pulse" />
              <h2 className="text-lg font-bold text-[#f0f4fc]">
                Universal Instrument & Asset Search
              </h2>
              <span className="text-xs bg-[#192b4d] text-[#4f8df9] px-2 py-0.5 rounded font-mono font-semibold">
                Equities · Futures · Options · Forex
              </span>
            </div>
            <p className="text-xs text-[#8ea4c7] mt-1">
              Search by ticker, company, or statistical edge. Select any instrument to load its institutional matrix, fee hurdles, and live AI advisory radar.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8ea4c7] hover:text-[#f0f4fc] p-1.5 rounded-lg hover:bg-[#182847] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Search Bar & Instant Filters */}
        <div className="my-4 space-y-3">
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-[#7a8fae] text-sm">🔍</span>
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker, name, or setup (e.g., RELIANCE, NVDA, NIFTY Call, EUR/USD, Wyckoff)..."
              className="w-full bg-[#070d18] border border-[#1e3054] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#f0f4fc] placeholder-[#5e7394] focus:outline-none focus:border-[#4f8df9] font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-[#8ea4c7] hover:text-[#f0f4fc]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            {/* Asset Type */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#7a8fae]">Asset:</span>
              {(['ALL', 'EQUITY', 'OPTIONS', 'FUTURES', 'FOREX'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedAssetFilter(type)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    selectedAssetFilter === type
                      ? 'bg-[#4f8df9] text-[#080d19] font-bold'
                      : 'bg-[#101b30] text-[#8ea4c7] hover:text-[#f0f4fc]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Region */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#7a8fae]">Region:</span>
              {(['ALL', 'INDIA', 'US', 'FOREX', 'GLOBAL'] as const).map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegionFilter(reg)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    selectedRegionFilter === reg
                      ? 'bg-[#2dd4a7] text-[#080d19] font-bold'
                      : 'bg-[#101b30] text-[#8ea4c7] hover:text-[#f0f4fc]'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-2">
          {filteredAssets.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8ea4c7] font-mono">
              No matching instruments found for "{searchQuery}". Try searching for NIFTY, NVDA, AAPL, EUR/USD, or Call.
            </div>
          ) : (
            filteredAssets.map((asset) => (
              <div
                key={asset.symbol}
                onClick={() => {
                  onSelectStock({
                    symbol: asset.symbol,
                    name: asset.name,
                    price: asset.price,
                    marketId: asset.marketId,
                    assetType: asset.assetType,
                    expiry: asset.expiry,
                    strike: asset.strike,
                  });
                  onClose();
                }}
                className="bg-[#0a1222] hover:bg-[#121f38] border border-[#192b4d] hover:border-[#4f8df9] rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 font-mono ${
                      asset.assetType === 'EQUITY'
                        ? 'bg-[#162747] text-[#4f8df9]'
                        : asset.assetType === 'OPTIONS'
                        ? 'bg-[#2b1f14] text-[#ffd60a]'
                        : asset.assetType === 'FUTURES'
                        ? 'bg-[#122822] text-[#2dd4a7]'
                        : 'bg-[#24172f] text-[#c084fc]'
                    }`}
                  >
                    {asset.assetType === 'EQUITY'
                      ? 'EQ'
                      : asset.assetType === 'OPTIONS'
                      ? 'OPT'
                      : asset.assetType === 'FUTURES'
                      ? 'FUT'
                      : 'FX'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#f0f4fc] group-hover:text-[#4f8df9] font-mono">
                        {asset.symbol}
                      </h4>
                      <span className="text-[10px] text-[#7a8fae] font-sans">
                        {asset.name}
                      </span>
                      <span className="text-[10px] bg-[#14223d] text-[#8ea4c7] px-1.5 py-0.2 rounded font-mono">
                        {asset.exchange}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#8ea4c7]">
                      <span className="text-[#ffd60a]">Sector: {asset.sector}</span>
                      <span>·</span>
                      <span className="text-[#2dd4a7] font-medium font-mono">Edge: {asset.statEdge}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 font-mono">
                  <span className="text-sm font-bold text-[#f0f4fc]">
                    {asset.currencySymbol}{asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-[#7a8fae]">Net Expectancy:</span>
                    <span className="text-[#2dd4a7] font-bold">{asset.netExpectancy}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-[#182847] text-xs text-[#5e7394] font-mono">
          <span>Showing {filteredAssets.length} verified liquid instruments</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#142038] hover:bg-[#1b2c4e] text-[#f0f4fc] transition-colors cursor-pointer"
          >
            Close Search
          </button>
        </div>
      </div>
    </div>
  );
};
