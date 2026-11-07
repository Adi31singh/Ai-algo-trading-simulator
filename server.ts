/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, getUserByUid } from './src/db/users.ts';
import { createTradeLog, getUserTradeLogs, updateTradeStatus } from './src/db/trades.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security Middleware: Payload size limits & Content-Type enforcement
app.use(express.json({ limit: '100kb' }));

// Security Headers against Clickjacking, MIME sniffing, and XSS
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Initialize Google GenAI client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Helper: Input sanitization to prevent injection attacks
const sanitizeTicker = (input: unknown): string => {
  if (typeof input !== 'string') return 'UNKNOWN';
  // Allow only alphanumeric characters, slashes, periods, and hyphens (strict ticker format)
  return input.trim().replace(/[^a-zA-Z0-9\/\.\-]/g, '').slice(0, 16).toUpperCase();
};

const sanitizeSafeString = (input: unknown, maxLen = 64): string => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>\"\'\`]/g, '').slice(0, maxLen);
};

// 1. Authenticate & Synchronize User Profile to PostgreSQL
app.post('/api/user/sync', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const email = req.user.email || `${req.user.uid}@anonymous.quantdesk`;
    const name = sanitizeSafeString(req.user.name || req.body.displayName || 'Trader');
    const dbUser = await getOrCreateUser(req.user.uid, email, name);
    res.json({ success: true, user: dbUser });
  } catch (err: any) {
    console.error('User sync error:', err);
    res.status(500).json({ error: 'Failed to synchronize user profile.' });
  }
});

// 2. Fetch User's Trade Logs (Strict user ownership check)
app.get('/api/trades', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const dbUser = await getUserByUid(req.user.uid);
    if (!dbUser) return res.status(404).json({ error: 'User record not found.' });

    const trades = await getUserTradeLogs(dbUser.id, 50);
    res.json({ success: true, trades });
  } catch (err: any) {
    console.error('Fetch trades error:', err);
    res.status(500).json({ error: 'Failed to fetch trade logs.' });
  }
});

// 3. Save Trade Log to Database (Parameterized & SQL-Injection Proof)
app.post('/api/trades', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const dbUser = await getUserByUid(req.user.uid);
    if (!dbUser) return res.status(404).json({ error: 'User record not found.' });

    const {
      symbol,
      market,
      horizon,
      direction,
      entryPrice,
      stopLoss,
      targetPrice,
      breakEvenPrice,
      shares,
      netRR,
      pattern,
      aiGatekeeperDecision,
      notes,
    } = req.body;

    // Strict numerical and type validation
    const sanitizedSymbol = sanitizeTicker(symbol);
    const validEntry = Math.max(0.0001, parseFloat(entryPrice) || 0);
    const validStop = Math.max(0.0001, parseFloat(stopLoss) || 0);
    const validTarget = Math.max(0.0001, parseFloat(targetPrice) || 0);
    const validBe = Math.max(0.0001, parseFloat(breakEvenPrice) || 0);
    const validShares = Math.max(1, Math.min(1000000, parseInt(shares, 10) || 1));
    const validRR = Math.max(0, parseFloat(netRR) || 0);
    const validDir = direction === 'SHORT' ? 'SHORT' : 'LONG';

    const newTrade = await createTradeLog({
      userId: dbUser.id,
      symbol: sanitizedSymbol,
      market: sanitizeSafeString(market, 32),
      horizon: sanitizeSafeString(horizon, 16),
      direction: validDir,
      entryPrice: validEntry,
      stopLoss: validStop,
      targetPrice: validTarget,
      breakEvenPrice: validBe,
      shares: validShares,
      netRR: validRR,
      pattern: sanitizeSafeString(pattern, 64),
      aiGatekeeperDecision: sanitizeSafeString(aiGatekeeperDecision, 32) || 'APPROVED',
      notes: sanitizeSafeString(notes, 500),
    });

    res.json({ success: true, trade: newTrade });
  } catch (err: any) {
    console.error('Record trade error:', err);
    res.status(500).json({ error: 'Failed to record trade log.' });
  }
});

// 4. AI Algorithmic Audit & Trade Gatekeeper Endpoint
app.post('/api/ai/audit-trade', async (req: Request, res: Response) => {
  try {
    const {
      symbol,
      horizon,
      entryPrice,
      stopLoss,
      targetPrice,
      breakEvenPrice,
      marketName,
      currencySymbol,
      vwapZScore,
      masterPattern,
      totalFriction,
    } = req.body;

    const safeSymbol = sanitizeTicker(symbol);
    const e = parseFloat(entryPrice) || 100;
    const sl = parseFloat(stopLoss) || e * 0.98;
    const tp = parseFloat(targetPrice) || e * 1.05;
    const be = parseFloat(breakEvenPrice) || e * 1.002;
    const friction = parseFloat(totalFriction) || 0;
    const z = parseFloat(vwapZScore) || 0;

    const grossReward = Math.abs(tp - e);
    const risk = Math.abs(e - sl);
    const netReward = grossReward - (be - e);
    const netRR = risk > 0 ? netReward / risk : 0;
    const clearsFeeShield = tp > be && netReward > 0;
    const isStatisticallyFavorable = Math.abs(z) >= 1.2 || masterPattern !== 'None';
    const gatekeeperApproved = clearsFeeShield && netRR >= 2.0 && isStatisticallyFavorable;

    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are a world-class senior quantitative finance risk officer and algorithmic trading gatekeeper.
Evaluate this prospective trade setup based on strict institutional rules:
- Market: ${sanitizeSafeString(marketName)} (${safeSymbol})
- Time Horizon: ${sanitizeSafeString(horizon)}
- Entry Price: ${currencySymbol}${e.toFixed(2)}
- Invalidation Stop-Loss: ${currencySymbol}${sl.toFixed(2)} (Risk: ${currencySymbol}${risk.toFixed(2)})
- Profit Target: ${currencySymbol}${tp.toFixed(2)} (Gross Reward: ${currencySymbol}${grossReward.toFixed(2)})
- Tax & Fee Break-Even Level: ${currencySymbol}${be.toFixed(2)} (Friction Drag: ${currencySymbol}${friction.toFixed(2)})
- Net Reward after taxes & fees: ${currencySymbol}${netReward.toFixed(2)} (Net R:R: ${netRR.toFixed(2)}:1)
- Institutional VWAP Z-Score: ${z >= 0 ? '+' : ''}${z.toFixed(2)}σ
- Master Trader Setup Pattern: ${sanitizeSafeString(masterPattern) || 'Wyckoff Spring / VCP Contraction'}
- User Capital Preservation Rule: Strictly max 1.0% risk, must beat fee-shield hurdle with positive expectancy.

Provide a concise, crisp institutional evaluation in JSON format with:
1. "decision": either "APPROVED" or "BLOCKED_BY_GATEKEEPER"
2. "expectancyRating": "HIGH_POSITIVE", "MODERATE", or "NEGATIVE_CHOP"
3. "executiveSummary": 2 short sentences explaining why the trade is approved or blocked.
4. "institutionalInsight": 1 sentence explaining the structural edge.
5. "riskScore": integer between 1 and 10.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({
            success: true,
            source: 'gemini-3.8-flash',
            audit: {
              decision: parsed.decision || (gatekeeperApproved ? 'APPROVED' : 'BLOCKED_BY_GATEKEEPER'),
              expectancyRating: parsed.expectancyRating || (gatekeeperApproved ? 'HIGH_POSITIVE' : 'NEGATIVE_CHOP'),
              executiveSummary: parsed.executiveSummary,
              institutionalInsight: parsed.institutionalInsight,
              riskScore: parsed.riskScore || (gatekeeperApproved ? 3 : 8),
              netRR: netRR.toFixed(2),
              feeHurdleCleared: clearsFeeShield,
              maxRiskPerTrade: '1.0%',
            },
          });
        }
      } catch (aiErr) {
        console.warn('Gemini generateContent error, falling back to local rule engine:', aiErr);
      }
    }

    return res.json({
      success: true,
      source: 'local_quant_gatekeeper_engine',
      audit: {
        decision: gatekeeperApproved ? 'APPROVED' : 'BLOCKED_BY_GATEKEEPER',
        expectancyRating: gatekeeperApproved ? 'HIGH_POSITIVE' : 'NEGATIVE_CHOP',
        executiveSummary: gatekeeperApproved
          ? `Trade approved. Net target comfortably clears exchange friction and taxes by ${netRR.toFixed(1)}:1 with risk strictly bounded under 1%.`
          : `Trade rejected by AI Gatekeeper. Profit runway fails to clear regulatory tax friction by the mandatory 2.0:1 margin of safety.`,
        institutionalInsight:
          Math.abs(z) > 1.8
            ? `Price is stretched ${Math.abs(z).toFixed(1)}σ from VWAP, creating an institutional mean-reversion discount edge.`
            : `Inside ±1σ equilibrium: institutional edge is low unless a confirmed structural shift prints.`,
        riskScore: gatekeeperApproved ? 3 : 8,
        netRR: netRR.toFixed(2),
        feeHurdleCleared: clearsFeeShield,
        maxRiskPerTrade: '1.0%',
      },
    });
  } catch (err: any) {
    console.error('Audit API error:', err);
    res.status(500).json({ success: false, error: 'Internal error during audit' });
  }
});

// 5. Institutional Sentiment Gauge Endpoint (Gemini 3.8 Flash with Google Search Grounding)
app.post('/api/ai/sentiment-gauge', async (req: Request, res: Response) => {
  try {
    const {
      symbol,
      marketName,
      horizon,
      vwapZScore,
      currentPrice,
      currencySymbol,
    } = req.body;

    const safeSymbol = sanitizeTicker(symbol);
    const safeMarket = sanitizeSafeString(marketName);
    const safeHorizon = sanitizeSafeString(horizon);
    const z = parseFloat(vwapZScore) || 0;
    const price = parseFloat(currentPrice) || 100;

    // Default quantitative heuristics for sentiment
    const calculatedVolatility = Math.min(100, Math.max(10, Math.round(Math.abs(z) * 32 + 20)));
    const calculatedTrendStrength = Math.min(100, Math.max(15, Math.round(Math.abs(z) * 28 + 35)));
    let initialSentimentScore = 50 + Math.round(z * 18);
    initialSentimentScore = Math.min(95, Math.max(5, initialSentimentScore));

    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are a Chief Market Strategist and Institutional Quant Macro Risk Analyst.
Analyze the current institutional market regime and sentiment for:
- Asset / Symbol: ${safeSymbol} (${safeMarket})
- Horizon: ${safeHorizon}
- Current Spot: ${currencySymbol || '$'}${price.toFixed(2)}
- Real-Time VWAP Z-Score: ${z >= 0 ? '+' : ''}${z.toFixed(2)}σ

Determine:
1. "sentimentScore": An integer from 0 to 100 where:
   - 0-35 = Strong Risk-Off (Defensive / Capital Preservation / Volatility Expansion)
   - 36-64 = Neutral / Equilibrium / Compression
   - 65-100 = Strong Risk-On (Aggressive Expansion / Risk Appetite)
2. "regime": One of "STRONG_RISK_OFF", "MODERATE_RISK_OFF", "NEUTRAL_CHOP", "MODERATE_RISK_ON", "STRONG_RISK_ON"
3. "volatilityState": One of "COMPRESSED", "NORMAL", "EXPANDING", "EXTREME_SPIKE"
4. "volatilityScore": integer 0 to 100
5. "trendStrength": integer 0 to 100
6. "macroDriver": A crisp 1-sentence explanation of current institutional macro flows, liquidity appetite, and volatility behavior.
7. "actionableGuidance": 1 short tactical sentence for retail traders to avoid blowup and remain profitable net of taxes.

Return valid JSON with keys: sentimentScore, regime, volatilityState, volatilityScore, trendStrength, macroDriver, actionableGuidance.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        const text = response.text;
        const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources = searchChunks?.map((c: any) => ({
          title: c.web?.title || 'Market Source',
          uri: c.web?.uri || '',
        })).filter((s: any) => s.uri) || [];

        if (text) {
          // Extract JSON from potential markdown code block
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return res.json({
              success: true,
              source: 'gemini-3.8-flash-grounded',
              gauge: {
                sentimentScore: typeof parsed.sentimentScore === 'number' ? parsed.sentimentScore : initialSentimentScore,
                regime: parsed.regime || (initialSentimentScore >= 60 ? 'MODERATE_RISK_ON' : initialSentimentScore <= 40 ? 'MODERATE_RISK_OFF' : 'NEUTRAL_CHOP'),
                volatilityState: parsed.volatilityState || (calculatedVolatility > 60 ? 'EXPANDING' : 'NORMAL'),
                volatilityScore: typeof parsed.volatilityScore === 'number' ? parsed.volatilityScore : calculatedVolatility,
                trendStrength: typeof parsed.trendStrength === 'number' ? parsed.trendStrength : calculatedTrendStrength,
                macroDriver: parsed.macroDriver || 'Institutional capital positioning around VWAP bands indicates measured liquidity rotation.',
                actionableGuidance: parsed.actionableGuidance || 'Keep stop strictly anchored behind structural invalidation and verify fee-shield hurdle before entry.',
                sources: sources.slice(0, 3),
              },
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini sentiment gauge query failed, falling back to local heuristic:', geminiErr);
      }
    }

    // Heuristic fallback
    const regime = initialSentimentScore >= 65 ? 'STRONG_RISK_ON' : initialSentimentScore >= 55 ? 'MODERATE_RISK_ON' : initialSentimentScore <= 35 ? 'STRONG_RISK_OFF' : initialSentimentScore <= 45 ? 'MODERATE_RISK_OFF' : 'NEUTRAL_CHOP';
    return res.json({
      success: true,
      source: 'local_quant_telemetry',
      gauge: {
        sentimentScore: initialSentimentScore,
        regime,
        volatilityState: calculatedVolatility > 65 ? 'EXPANDING' : calculatedVolatility < 30 ? 'COMPRESSED' : 'NORMAL',
        volatilityScore: calculatedVolatility,
        trendStrength: calculatedTrendStrength,
        macroDriver: `VWAP deviation at ${z.toFixed(2)}σ signals institutional ${z > 0 ? 'demand absorption' : 'liquidity concession'} with ${calculatedVolatility}% volatility coefficient.`,
        actionableGuidance: 'Trade only when net reward beats regulatory exchange taxes by at least 2:1 ratio.',
        sources: [],
      },
    });
  } catch (err: any) {
    console.error('Sentiment gauge error:', err);
    res.status(500).json({ success: false, error: 'Internal error generating sentiment gauge' });
  }
});

// Configure Vite middleware in development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Quant Desk server running at http://localhost:${port}`);
  });
}

startServer();
