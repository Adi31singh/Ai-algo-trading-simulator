# Quant Desk: AI Algorithmic Trading Advisory & Master Trader Suite

A high-performance, time-agnostic institutional quantitative trading terminal and AI algorithmic advisory suite built with React 19, TypeScript, Tailwind CSS, and Google Gemini 3.8 Flash.

---

## 🌟 Key Features

### 1. The Quant Engine Matrix (Time-Agnostic Chart)
- **Multi-Horizon Support**: Seamlessly toggle between **1-Minute Execution**, **15-Minute Intraday Wave**, **4-Hour Swing Cycle**, and **Daily Macro Trend**.
- **Institutional VWAP & Confidence Envelopes**: Superimposes the session Volume-Weighted Average Price line with $\pm 1\sigma$ (68.2%) and $\pm 2\sigma$ (95.4%) standard deviation bands.
- **200-Period Trend Baseline**: Real-time baseline defense filter (Paul Tudor Jones rule).
- **Institutional Volume Aggression Slider**: Adjust aggressive order flow (0k to 500k shares/min) to observe price stretching, volatility expansion, and mean-reversion discount regimes.

### 2. Real-Time AI Advisory Radar & Pre-Trade Gatekeeper
- **Capital Preservation Rule**: Automatically calculates position sizing to strictly enforce a **maximum 1.0% account risk ceiling**.
- **Fee Shield Clearance**: Mathematically validates that gross target profits exceed brokerage and regulatory taxes by at least a 2.0:1 margin of safety before an alert is permitted.
- **Deep AI Audit**: Powered by **Google Gemini 3.8 Flash** via a server-side proxy endpoint (`/api/ai/audit-trade`) to deliver instant institutional risk scoring, executive summaries, and structural edge analysis.

### 3. Universal Master Trader Playbook Suite
Interactive, high-fidelity visual blueprints and mathematical rules from history's most profitable, consistent traders:
- **Richard Wyckoff**: Phase C Spring & Passive Absorption schematic.
- **Mark Minervini & William O'Neil**: Volatility Contraction Pattern (VCP) with volume dry-up.
- **Jesse Livermore**: Pivotal Breakout Line and Line of Least Resistance.
- **Stan Weinstein**: 4-Stage Market Cycle (Basing, Advancing, Distribution, Decline).
- **Paul Tudor Jones & Ed Seykota**: 5:1 Asymmetry Stack and 200-period moving average defense.

### 4. Animated Liquidity Stage (V.A.M.P. Stop-Run Simulator)
- Real-time animated demonstration of **Volume**, **Absorption**, **Manipulation** (the stop hunt), and **Positioning** (markup reversal).
- Highlights the **Retail Stop-Loss Liquidity Pool** below structural lows, with stops turning from green to glowing red upon trigger, followed by an explosive institutional absorption reversal arrow.
- Interactive phase scrubber to inspect and step through each phase individually.

### 5. Multi-Market Fee Shield Calculator & Presets
- Pre-configured asset class profiles:
  - **Indian Intraday Equities (NSE/BSE)**: ₹40 flat brokerage + 0.045% turnover taxes.
  - **Indian Equities - Mid Cap**: Moderate liquidity pools with higher beta.
  - **US Equities (NYSE/NASDAQ)**: $1.00 base routing + SEC (0.00278%) & FINRA TAF.
  - **US Equities - High Volatility**: NVDA/TSLA high ATR momentum profiles.
  - **Forex - Major Pairs (EUR/USD)**: Interbank raw ECN spread + deep liquidity pools.
  - **Global Markets (ING Dom Maklerskie / GPW)**: 0.19% (min. 5 zł) + WSE clearing fees.
- Renders the exact **Tax Comfortable Break-Even Price** directly on the live chart.

### 6. International Brokerage API Integration Suite
- Secure client-side integration hooks for:
  - **Interactive Brokers (IBKR)**: Client Portal REST & TWS Gateway bracket orders.
  - **Alpaca Markets**: US Equities paper-trading and live order routing.
  - **ING Dom Maklerskie**: Warsaw Stock Exchange GPW Open Banking & FIX 4.4 protocol.
  - **Zerodha Kite Connect 3.0**: NSE/BSE intraday MIS order routing.
- **Zero-Knowledge Security**: Credentials remain in volatile memory and are never persisted to external databases.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

---

## 🔒 Security Architecture
- **Server-Side AI API Proxy**: The Gemini API key (`GEMINI_API_KEY`) is kept strictly server-side in `server.ts` and never exposed to the client bundle.
- **Zero-Knowledge Broker Keys**: Broker API keys and secrets exist only in client-side memory during active user sessions.
