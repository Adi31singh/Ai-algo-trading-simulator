# High-End Real-Time AI Algorithmic Trading Advisory Engine & Universal Master Trader Terminal

Build an institutional-grade, real-time AI-powered algorithmic trading terminal designed for capital preservation and net-of-tax positive expectancy. The system combines time-agnostic multi-horizon market structure (1m, 15m, 4h, 1D), master trader methodologies (Wyckoff, Livermore, Weinstein, Minervini, Tudor Jones), and an active **AI Pre-Trade Gatekeeper** that automatically computes real-time friction hurdles (brokerage, exchange taxes, STT/SEC/GPW) to ensure zero trades are recommended unless net-of-tax profitability is mathematically proven with risk strictly capped at $\le 1\%$.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices from User Consultations:**
> - **Execution Mode**: **Advisory Signal Engine** delivering real-time, low-latency setup alerts, entry/stop brackets, and detailed institutional quantitative reasoning.
> - **Capital Preservation Standard**: **Strict Fee-Shield Hurdle + Max 1% Risk** per trade. If an intraday or swing move cannot clear exchange taxes and brokerage by a minimum 2:1 net factor, the AI Gatekeeper immediately voids the setup.
> - **AI Evaluation Role**: **Pre-Trade Expectancy Gatekeeper**. Every potential signal is audited by the AI against real-time order flow, VWAP standard deviation, structural pivots, and fee friction before being alerted to the user.
> - **Timeframe Agnostic**: Supports 1-minute execution, 15-minute swing rhythms, 4-hour cycles, and Daily macro trends, illustrating how smart money patterns repeat fractally across all horizons.
> - **Global Multi-Market Readiness**: Pre-configured for Indian Intraday Equities (NSE/BSE), US Equities & ETFs (NYSE/NASDAQ), and European Global Equities (ING Dom Maklerskie / GPW).

---

## 1. Overview & Core Concept

- **The Problem It Solves**: Most retail traders lose money not because of bad charts, but because of **structural friction** (taxes, turnover charges, brokerage) and **excessive risk-taking** during unpredictable market noise.
- **The AI Algo Solution**:
  1. **Instant Math Audit**: Before any trade alert is emitted, the AI calculates the exact Net Expectancy after deducting local taxes and broker fees. If a scalp or swing does not comfortably beat the Fee Shield, it is blocked.
  2. **1% Hard Risk Ceiling**: The position sizing engine automatically calculates the exact share quantity so that hitting the invalidation stop-loss never risks more than 1% of total account capital.
  3. **Universal Master Trader Confluence**: Synthesizes the core principles of history's top consistent traders (Wyckoff springs, Livermore breakout pivots, Weinstein stage 2 momentum, Minervini VCP contractions, and Tudor Jones asymmetric 5:1 risk).

---

## 2. User Experience & Visual Design

### Key User Flows

1. **AI Live Advisory Feed & Signal Radar**:
   - Pinned high-priority radar banner showing live market regime, current signal status (`ACTIVE OPPORTUNITY`, `WAITING FOR CONFLUENCE`, or `PROTECTION SHIELD ACTIVE: HIGH CHOP`), and live expectancy score.
   - When an institutional setup satisfies all master trader criteria + fee shield clearance, an **AI Advisory Card** pops up with:
     - Suggested Stock / Instrument & Horizon (1m, 15m, 4h, 1D).
     - Recommended Entry, Invalidation Stop, and Target Net Profit.
     - **Mathematical Net-of-Tax Expectancy Breakdown** (showing gross profit vs. exact exchange taxes and brokerage).
     - One-click "Audit with AI" button that queries the server-side Gemini 3.8 Flash model for in-depth institutional reasoning.

2. **Time-Agnostic Horizon Matrix**:
   - Instant switcher between `1m Execution`, `15m Wave`, `4h Swing`, and `Daily Macro`.
   - Real-time simulated price bars dynamically adapt their volatility scale, tick rate, and price increments to the selected horizon.
   - Shows both session VWAP (for intraday) and 200-period baseline / Stage 2 moving averages (for swing/macro).

3. **Master Trader Playbook Suite**:
   - Interactive selector for the 5 legendary trader frameworks:
     - *Richard Wyckoff*: Accumulation Schematic, Spring Phase C, and Upthrust Distribution.
     - *Jesse Livermore*: Pivotal Breakout Line and Line of Least Resistance.
     - *Stan Weinstein*: 4-Stage Cycle Engine with 30-week moving average slope filter.
     - *Mark Minervini*: Volatility Contraction Pattern (VCP) with progressive volume drying.
     - *Paul Tudor Jones*: 5:1 Asymmetry and strict defense of the 200-period trend baseline.
   - Each playbook features an interactive SVG blueprint, exact quant entry trigger, stop loss rule, and a toggle to project the blueprint onto the live chart.

4. **Fee & Tax Shield Guard**:
   - Real-time calculation of flat brokerage and turnover taxes (India ₹40 + 0.045%, US $1.00 + SEC/FINRA, ING Dom Maklerskie 0.19% min 5 zł + GPW fees).
   - Automatically renders the glowing yellow **Tax Comfortable Break-Even Price** on the live chart.

### Visual Identity & Theme

- **Palette**: Deep dark institutional cockpit (`#080d19` background, `#0d172b` panels, `#1e2f52` borders).
- **Accents**:
  - AI Emerald (`#2dd4a7`): Approved low-risk signals and net-positive expectancy.
  - Risk Coral (`#ff6b6b`): Stop loss levels, high-risk warnings, and rejected trades.
  - Institutional Blue (`#4f8df9`): VWAP, trend baselines, and master trader playbooks.
  - Fee Yellow (`#ffd60a`): Tax break-even shield line and pivotal breakout triggers.
- **Typography**: Clean `Plus Jakarta Sans` headings paired with `IBM Plex Mono` tabular numerals for all prices, calculations, and trade coordinates.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Advisory Signal Engine vs. Black-Box Autonomous Execution**
  - *Chosen Approach*: Deliver clear, actionable advisory signals with complete mathematical rationale, risk sizing, and confirmation gates rather than blind black-box execution.
  - *Why*: Direct alignment with user response; preserves user control and total transparency into *why* the AI selected or blocked the setup.
- **Decision 2: Strict Pre-Trade Gatekeeper vs. Permissive Alert Spammer**
  - *Chosen Approach*: The AI engine ruthlessly filters out marginal setups. If a trade does not clear the Fee Shield with at least a 2.5:1 reward-to-risk ratio and strict 1% risk sizing, it is flagged as `TRADE BLOCKED BY GATEKEEPER`.
  - *Why*: Eliminates over-trading, churn, and small-scalp losses that deplete retail accounts.
- **Decision 3: Server-Side Gemini API Proxy Route**
  - *Chosen Approach*: Implement a secure Express endpoint (`/api/ai/audit-trade`) running `@google/genai` with `gemini-3.8-flash` to evaluate live market structure, order book imbalance, and friction metrics.
  - *Why*: Conforms strictly to security guidelines (no client-side API keys) and provides instant natural language reasoning.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│               QUANT DESK: REAL-TIME AI ALGO TERMINAL                   │
├────────────────────────────────────────────────────────────────────────┤
│  Top Bar: Market Profiles (India ₹ / US $ / Global zł) · Broker APIs   │
├────────────────────────────────────────────────────────────────────────┤
│  AI ADVISORY RADAR & PRE-TRADE EXPECTANCY GATEKEEPER                   │
│  - Real-Time Opportunity Scanner (Active Setup vs. Blocked by Taxes)   │
│  - Max 1% Capital Risk Calculator & Auto-Position Sizing               │
│  - One-Click Deep AI Institutional Audit (Gemini 3.8 Flash via API)    │
├───────────────────────────────────┬────────────────────────────────────┤
│  1. TIME-AGNOSTIC QUANT ENGINE    │  4. INTERACTIVE FEE SHIELD GUARD   │
│  - Horizons: 1m, 15m, 4h, Daily   │  - Exact Tax Break-Even Shield Line│
│  - Dynamic Session VWAP & Bands   │  - Gross vs. Net Scalp Matrix      │
│  - Volume Aggression Controls     │  - Overnight / Swing Holding Math  │
├───────────────────────────────────┴────────────────────────────────────┤
│  5. UNIVERSAL MASTER TRADER PLAYBOOK SUITE                             │
│  - Wyckoff Spring & Absorption · Livermore Pivots · Weinstein Stages   │
│  - Minervini Volatility Contraction · Tudor Jones 5:1 Asymmetric Rule  │
├───────────────────────────────────┬────────────────────────────────────┤
│  2. ANIMATED LIQUIDITY STAGE      │  3. C.A.R.S. VISUAL DICTIONARY     │
│  - V.A.M.P. Stop-Run Simulator    │  - Context, Asymmetry, Rejection,  │
│  - Stop Pool Manipulation Waves   │    and Structure Anatomical Models │
└───────────────────────────────────┴────────────────────────────────────┘
```

### Component & State Plan

1. **`server.ts`**:
   - Mount Express backend with `vite.middlewares` in dev.
   - Endpoint `POST /api/ai/audit-trade`: takes current market price, VWAP deviation, candidate setup, horizon, and friction cost, and calls `ai.models.generateContent` with `gemini-3.8-flash` to produce real-time institutional risk grading.
2. **`src/types/quant.ts`**:
   - Add `TimeframeHorizon` (`'1m' | '15m' | '4h' | '1d'`).
   - Add `AiTradeSignal` (symbol, direction, entry, stop, target, netExpectancy, gatekeeperStatus, riskScore, masterTraderPattern).
   - Add `MasterPlaybook` interfaces.
3. **`src/components/AiAdvisoryRadar.tsx`**:
   - Real-time AI advisory strip displaying current setup alerts, live risk gatekeeper verdict, and "Deep AI Audit" modal integration.
4. **`src/components/MasterPlaybookSuite.tsx`**:
   - Interactive visual playbook selector covering Wyckoff, Livermore, Weinstein, Minervini, and Tudor Jones.
5. **`src/components/QuantEngineMatrix.tsx`**:
   - Timeframe horizon switcher (`1m`, `15m`, `4h`, `1d`) that dynamically recalibrates tick speed, candle aggregation, and volatility.
6. **`src/components/FeeShieldCalculator.tsx`**:
   - Enhanced with 1% capital risk sizing and swing vs. intraday friction breakdown.
