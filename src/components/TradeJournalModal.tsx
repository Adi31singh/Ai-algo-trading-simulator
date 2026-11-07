/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';

interface TradeRecord {
  id: number;
  symbol: string;
  market: string;
  horizon: string;
  direction: string;
  entryPrice: string;
  stopLoss: string;
  targetPrice: string;
  breakEvenPrice: string;
  shares: number;
  netRR: string;
  status: string;
  pattern: string | null;
  aiGatekeeperDecision: string;
  notes: string | null;
  createdAt: string;
}

interface TradeJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  authToken: string | null;
}

export const TradeJournalModal: React.FC<TradeJournalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  authToken,
}) => {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !authToken) return;

    const fetchTrades = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/trades', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        if (data.success && data.trades) {
          setTrades(data.trades);
        } else {
          setError(data.error || 'Failed to load trade logs');
        }
      } catch (err: any) {
        setError(err.message || 'Error connecting to database');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();
  }, [isOpen, authToken]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative bg-[#0d172b] border border-[#22355e] rounded-xl max-w-4xl w-full p-6 shadow-2xl text-[#dce5f5]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1b2c4e]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4f8df9]" />
              <h2 className="text-lg font-bold text-[#f0f4fc]">
                Cloud SQL Relational Trade Journal (PostgreSQL)
              </h2>
            </div>
            <p className="text-xs text-[#8ea4c7] mt-1">
              Encrypted, SQL-injection proof historical audit log stored in your Cloud SQL PostgreSQL database instance.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8ea4c7] hover:text-[#f0f4fc] p-1.5 rounded-lg hover:bg-[#182847] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="my-4 max-h-[60vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#8ea4c7] font-mono">
              Querying Cloud SQL PostgreSQL instance...
            </div>
          ) : error ? (
            <div className="p-4 bg-[#2b171c] border border-[#52232a] text-[#ff8585] rounded-lg text-xs">
              {error}
            </div>
          ) : trades.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8ea4c7]">
              No trade records logged yet. Use the <strong>"Record Trade to Journal"</strong> button on any active AI Advisory signal to log verified trades into PostgreSQL.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#1b2c4e] text-[#7a8fae]">
                    <th className="py-2 px-2.5 font-normal">Date</th>
                    <th className="py-2 px-2.5 font-normal">Symbol</th>
                    <th className="py-2 px-2.5 font-normal">Dir</th>
                    <th className="py-2 px-2.5 font-normal">Horizon</th>
                    <th className="py-2 px-2.5 font-normal text-right">Entry</th>
                    <th className="py-2 px-2.5 font-normal text-right">Stop</th>
                    <th className="py-2 px-2.5 font-normal text-right">Target</th>
                    <th className="py-2 px-2.5 font-normal text-right">Net R:R</th>
                    <th className="py-2 px-2.5 font-normal">Gatekeeper</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#14213d]">
                  {trades.map((t) => (
                    <tr key={t.id} className="hover:bg-[#111c33]/50 transition-colors">
                      <td className="py-2 px-2.5 text-[#7a8fae]">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-2.5 font-semibold text-[#f0f4fc]">
                        {t.symbol}
                      </td>
                      <td className="py-2 px-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            t.direction === 'LONG'
                              ? 'bg-[#122822] text-[#2dd4a7]'
                              : 'bg-[#2b171c] text-[#ff6b6b]'
                          }`}
                        >
                          {t.direction}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-[#8ea4c7]">{t.horizon}</td>
                      <td className="py-2 px-2.5 text-right text-[#c0d0ee]">
                        {parseFloat(t.entryPrice).toFixed(2)}
                      </td>
                      <td className="py-2 px-2.5 text-right text-[#ff6b6b]">
                        {parseFloat(t.stopLoss).toFixed(2)}
                      </td>
                      <td className="py-2 px-2.5 text-right text-[#2dd4a7]">
                        {parseFloat(t.targetPrice).toFixed(2)}
                      </td>
                      <td className="py-2 px-2.5 text-right font-semibold text-[#ffd60a]">
                        {parseFloat(t.netRR).toFixed(2)}:1
                      </td>
                      <td className="py-2 px-2.5">
                        <span
                          className={`text-[10px] font-semibold ${
                            t.aiGatekeeperDecision === 'APPROVED'
                              ? 'text-[#2dd4a7]'
                              : 'text-[#ff6b6b]'
                          }`}
                        >
                          {t.aiGatekeeperDecision}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-[#182847]">
          <span className="text-[11px] text-[#5e7394] font-mono">
            Signed in as: {currentUser?.email}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#4f8df9] hover:bg-[#6099fa] text-[#080d19] transition-all cursor-pointer"
          >
            Close Journal
          </button>
        </div>
      </div>
    </div>
  );
};
