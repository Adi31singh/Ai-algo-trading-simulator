/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { relations } from 'drizzle-orm';
import {
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

// Users table linked securely to Firebase Authentication UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  accountCapital: numeric('account_capital', { precision: 14, scale: 2 }).default('100000.00'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Trade logs & journal: tracks all paper/simulated/algo orders
export const tradeLogs = pgTable('trade_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  symbol: varchar('symbol', { length: 32 }).notNull(),
  market: varchar('market', { length: 32 }).notNull(),
  horizon: varchar('horizon', { length: 16 }).notNull(),
  direction: varchar('direction', { length: 8 }).notNull(), // LONG / SHORT
  entryPrice: numeric('entry_price', { precision: 12, scale: 4 }).notNull(),
  stopLoss: numeric('stop_loss', { precision: 12, scale: 4 }).notNull(),
  targetPrice: numeric('target_price', { precision: 12, scale: 4 }).notNull(),
  breakEvenPrice: numeric('break_even_price', { precision: 12, scale: 4 }).notNull(),
  shares: integer('shares').notNull(),
  netRR: numeric('net_rr', { precision: 6, scale: 2 }).notNull(),
  status: varchar('status', { length: 32 }).default('OPEN').notNull(), // OPEN, TARGET_HIT, STOPPED, CANCELLED
  pattern: varchar('pattern', { length: 64 }),
  aiGatekeeperDecision: varchar('ai_gatekeeper_decision', { length: 32 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User risk settings table
export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  defaultMarket: varchar('default_market', { length: 32 }).default('in').notNull(),
  defaultHorizon: varchar('default_horizon', { length: 16 }).default('1m').notNull(),
  maxRiskPercent: numeric('max_risk_percent', { precision: 4, scale: 2 }).default('1.00').notNull(),
  slippageGuard: numeric('slippage_guard', { precision: 4, scale: 2 }).default('0.05').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  trades: many(tradeLogs),
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
}));

export const tradeLogsRelations = relations(tradeLogs, ({ one }) => ({
  user: one(users, {
    fields: [tradeLogs.userId],
    references: [users.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));
