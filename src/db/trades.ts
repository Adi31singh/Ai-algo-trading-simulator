/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from './index.ts';
import { tradeLogs, userSettings } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export interface NewTradeLogInput {
  userId: number;
  symbol: string;
  market: string;
  horizon: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  breakEvenPrice: number;
  shares: number;
  netRR: number;
  status?: string;
  pattern?: string;
  aiGatekeeperDecision: string;
  notes?: string;
}

// 100% Parameterized type-safe insert - impervious to SQL injection
export async function createTradeLog(input: NewTradeLogInput) {
  try {
    const result = await db
      .insert(tradeLogs)
      .values({
        userId: input.userId,
        symbol: input.symbol.trim().toUpperCase(),
        market: input.market,
        horizon: input.horizon,
        direction: input.direction,
        entryPrice: input.entryPrice.toFixed(4),
        stopLoss: input.stopLoss.toFixed(4),
        targetPrice: input.targetPrice.toFixed(4),
        breakEvenPrice: input.breakEvenPrice.toFixed(4),
        shares: input.shares,
        netRR: input.netRR.toFixed(2),
        status: input.status || 'OPEN',
        pattern: input.pattern || null,
        aiGatekeeperDecision: input.aiGatekeeperDecision,
        notes: input.notes ? input.notes.slice(0, 500) : null,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database createTradeLog failed:', error);
    throw new Error('Failed to record trade log.', { cause: error });
  }
}

// Retrieve trade logs for a specific user only (strict data isolation)
export async function getUserTradeLogs(userId: number, limit = 50) {
  try {
    return await db
      .select()
      .from(tradeLogs)
      .where(eq(tradeLogs.userId, userId))
      .orderBy(desc(tradeLogs.createdAt))
      .limit(limit);
  } catch (error) {
    console.error('Database getUserTradeLogs failed:', error);
    throw new Error('Failed to fetch trade logs.', { cause: error });
  }
}

// Update trade status (e.g. TARGET_HIT, STOPPED)
export async function updateTradeStatus(tradeId: number, userId: number, status: string) {
  try {
    const result = await db
      .update(tradeLogs)
      .set({ status })
      .where(eq(tradeLogs.id, tradeId))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database updateTradeStatus failed:', error);
    throw new Error('Failed to update trade status.', { cause: error });
  }
}
