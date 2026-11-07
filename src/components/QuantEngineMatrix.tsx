/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MarketProfile, AggressorSide, Candle, TimeframeHorizon } from '../types/quant';
import { Tooltip } from './Tooltip';

interface QuantEngineMatrixProps {
  currentMarket: MarketProfile;
  currentHorizon: TimeframeHorizon;
  onHorizonChange: (h: TimeframeHorizon) => void;
  breakEvenPrice: number;
  targetNetPrice: number;
  entryPrice: number;
  onTelemetryUpdate?: (telemetry: { lastPrice: number; zScore: number; barVolume: number }) => void;
}

export const QuantEngineMatrix: React.FC<QuantEngineMatrixProps> = ({
  currentMarket,
  currentHorizon,
  onHorizonChange,
  breakEvenPrice,
  targetNetPrice,
  entryPrice,
  onTelemetryUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation Controls
  const [aggressiveVolume, setAggressiveVolume] = useState<number>(35); // 0 - 100
  const [aggressorSide, setAggressorSide] = useState<AggressorSide>(1); // 1 = Buying, -1 = Selling, 0 = Balanced
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showBands, setShowBands] = useState<boolean>(true);
  const [showFeeLine, setShowFeeLine] = useState<boolean>(true);
  const [showBaseline, setShowBaseline] = useState<boolean>(true); // 200 EMA baseline

  // Live Telemetry state for UI display
  const [lastPrice, setLastPrice] = useState<number>(entryPrice);
  const [sessionVwap, setSessionVwap] = useState<number>(entryPrice);
  const [zScore, setZScore] = useState<number>(0);
  const [barVolume, setBarVolume] = useState<number>(0);
  const [regime, setRegime] = useState<string>('Balanced inside 1σ');

  // Hover Crosshair
  const [hoveredCandle, setHoveredCandle] = useState<{
    candle: Candle;
    x: number;
    y: number;
    index: number;
  } | null>(null);

  // Simulation internal state ref
  const simStateRef = useRef<{
    bars: Candle[];
    cur: Candle & { n: number };
    PV: number;
    P2V: number;
    V: number;
  }>({
    bars: [],
    cur: { o: entryPrice, h: entryPrice, l: entryPrice, c: entryPrice, v: 0, n: 0 },
    PV: 0,
    P2V: 0,
    V: 0,
  });

  // Gaussian random helper (Box-Muller)
  const randNormal = () => {
    let u = 0;
    while (!u) u = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
  };

  const getVwap = useCallback(() => {
    const s = simStateRef.current;
    if (s.V <= 0) return [s.cur.c, 1];
    const mean = s.PV / s.V;
    const variance = Math.max(s.P2V / s.V - mean * mean, 0.04);
    return [mean, Math.sqrt(variance)];
  }, []);

  const accumulateVolume = useCallback((p: number, v: number) => {
    const s = simStateRef.current;
    s.PV += p * v;
    s.P2V += p * p * v;
    s.V += v;
  }, []);

  // Single simulation tick
  const stepSimulation = useCallback(() => {
    const s = simStateRef.current;
    const b = s.cur;
    const a = aggressiveVolume / 100;
    const [mean, stdDev] = getVwap();

    // Horizon Volatility Multiplier: Daily & 4h swings have wider ranges
    const horizonMult =
      currentHorizon === '1m'
        ? 0.75
        : currentHorizon === '15m'
        ? 1.15
        : currentHorizon === '4h'
        ? 2.1
        : 3.4;

    const volMult = currentMarket.volatilityMultiplier || 1.0;
    const priceScale = Math.max(b.c * 0.0008 * volMult * horizonMult, currentMarket.tickSize * 2);

    // Dynamic price shift formula
    const drift = aggressorSide * a * priceScale * 1.6;
    const noise = priceScale * (1 + a * 2.5) * randNormal();
    const meanReversion = (mean - b.c) * 0.02 * (1 - a * 0.65);

    const nextPrice = Math.max(currentMarket.tickSize, b.c + drift + noise + meanReversion);

    b.c = nextPrice;
    b.h = Math.max(b.h, nextPrice);
    b.l = Math.min(b.l, nextPrice);

    const tickVol = (500 + Math.random() * 800) * (1 + a * 7) * (currentHorizon === '1d' ? 40 : 1);
    b.v += tickVol;
    accumulateVolume(nextPrice, tickVol);
    b.n++;

    // Ticks per bar dynamically adjusts to horizon
    const ticksPerBar =
      currentHorizon === '1m'
        ? Math.max(8, Math.round(16 - a * 6))
        : currentHorizon === '15m'
        ? 24
        : currentHorizon === '4h'
        ? 36
        : 48;

    if (b.n >= ticksPerBar) {
      const [currentVwap, currentStd] = getVwap();
      b.vw = currentVwap;
      b.sd = currentStd;
      b.time = Date.now();
      s.bars.push({ ...b });

      if (s.bars.length > 120) {
        s.bars.shift();
      }

      s.cur = {
        o: b.c,
        h: b.c,
        l: b.c,
        c: b.c,
        v: 0,
        n: 0,
      };
    }

    const currentZ = stdDev > 0 ? (b.c - mean) / stdDev : 0;
    setLastPrice(b.c);
    setSessionVwap(mean);
    setZScore(currentZ);
    setBarVolume(Math.round(b.v));

    if (onTelemetryUpdate) {
      onTelemetryUpdate({ lastPrice: b.c, zScore: currentZ, barVolume: Math.round(b.v) });
    }

    if (Math.abs(currentZ) < 1.0) {
      setRegime('Balanced Inside 1σ (Fair Value)');
    } else if (Math.abs(currentZ) < 2.0) {
      setRegime(currentZ > 0 ? 'Bullish Extension (Flow Visible)' : 'Bearish Extension (Flow Visible)');
    } else {
      setRegime(currentZ > 0 ? 'Overbought (+2σ Reversal Zone)' : 'Oversold (−2σ Reversal Zone)');
    }
  }, [
    aggressiveVolume,
    aggressorSide,
    currentHorizon,
    currentMarket.volatilityMultiplier,
    currentMarket.tickSize,
    getVwap,
    accumulateVolume,
    onTelemetryUpdate,
  ]);

  // Rebase simulation around a new target price
  const rebaseSimulation = useCallback((targetBasePrice: number) => {
    const s = simStateRef.current;
    const currentPrice = s.cur.c;
    const delta = targetBasePrice - currentPrice;
    if (Math.abs(delta) < 0.0001) return;

    s.P2V += 2 * delta * s.PV + delta * delta * s.V;
    s.PV += delta * s.V;

    s.bars.forEach((b) => {
      b.o += delta;
      b.h += delta;
      b.l += delta;
      b.c += delta;
      if (b.vw) b.vw += delta;
    });

    s.cur.o += delta;
    s.cur.h += delta;
    s.cur.l += delta;
    s.cur.c += delta;
    if (s.cur.vw) s.cur.vw += delta;

    setLastPrice(s.cur.c);
  }, []);

  const initSession = useCallback(() => {
    const s = simStateRef.current;
    s.bars = [];
    s.PV = 0;
    s.P2V = 0;
    s.V = 0;
    s.cur = { o: entryPrice, h: entryPrice, l: entryPrice, c: entryPrice, v: 0, n: 0 };

    accumulateVolume(entryPrice, 10000);

    for (let i = 0; i < 48 * 12; i++) {
      stepSimulation();
    }
    rebaseSimulation(entryPrice);
  }, [entryPrice, accumulateVolume, stepSimulation, rebaseSimulation]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    rebaseSimulation(entryPrice);
  }, [entryPrice, rebaseSimulation]);

  // Animation render loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);

      if (!isPaused) {
        const interval = Math.max(35, (160 - aggressiveVolume * 1.1) / simSpeed);
        if (now - lastTime >= interval) {
          stepSimulation();
          lastTime = now;
        }
      }

      renderChart();
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, simSpeed, aggressiveVolume, stepSimulation]);

  // Main Canvas Drawing
  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    ctx.fillStyle = '#0a101f';
    ctx.fillRect(0, 0, W, H);

    const s = simStateRef.current;
    const [currentVwap, currentStd] = getVwap();
    const curWithVwap = { ...s.cur, vw: currentVwap, sd: currentStd };
    const allBars = s.bars.slice(-54).concat([curWithVwap]);

    if (allBars.length === 0) {
      ctx.restore();
      return;
    }

    const pad = { top: 20, right: 90, bottom: 28, left: 16 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;
    const slotW = plotW / Math.max(allBars.length, 1);
    const candleW = Math.max(3, slotW * 0.65);

    let minPrice = Infinity;
    let maxPrice = -Infinity;

    allBars.forEach((b) => {
      minPrice = Math.min(minPrice, b.l);
      maxPrice = Math.max(maxPrice, b.h);
      if (showBands && b.vw && b.sd) {
        minPrice = Math.min(minPrice, b.vw - 2.2 * b.sd);
        maxPrice = Math.max(maxPrice, b.vw + 2.2 * b.sd);
      }
    });

    if (showFeeLine) {
      minPrice = Math.min(minPrice, entryPrice, breakEvenPrice);
      maxPrice = Math.max(maxPrice, entryPrice, breakEvenPrice, targetNetPrice);
    }

    const pRange = Math.max(maxPrice - minPrice, currentMarket.tickSize * 20);
    minPrice -= pRange * 0.08;
    maxPrice += pRange * 0.08;

    const getY = (p: number) => pad.top + plotH * (1 - (p - minPrice) / (maxPrice - minPrice));
    const getX = (idx: number) => pad.left + slotW * (idx + 0.5);

    // 1. Gridlines
    const gridLines = 6;
    ctx.strokeStyle = '#14213d';
    ctx.lineWidth = 1;
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridLines; i++) {
      const p = minPrice + (maxPrice - minPrice) * (i / gridLines);
      const y = getY(p);

      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();

      ctx.fillStyle = '#6b82a7';
      const decimals = currentMarket.tickSize < 0.01 ? 4 : 2;
      ctx.fillText(
        `${currentMarket.currencySymbol}${p.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}`,
        W - pad.right + 8,
        y
      );
    }

    // 2. VWAP Standard Deviation Bands
    if (showBands && allBars.length > 2) {
      const sigma = (b: Candle) => Math.max(b.sd || 0.4, currentMarket.tickSize * 2);

      // Shaded clouds
      ctx.beginPath();
      allBars.forEach((b, i) => {
        const top = getY((b.vw || b.c) + 2 * sigma(b));
        if (i === 0) ctx.moveTo(getX(i), top);
        else ctx.lineTo(getX(i), top);
      });
      for (let i = allBars.length - 1; i >= 0; i--) {
        const b = allBars[i];
        const bot = getY((b.vw || b.c) - 2 * sigma(b));
        ctx.lineTo(getX(i), bot);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(79, 141, 249, 0.05)';
      ctx.fill();

      // Band Lines
      const drawBandLine = (mult: number, strokeColor: string, isDashed: boolean, lineWidth = 1) => {
        ctx.beginPath();
        allBars.forEach((b, i) => {
          const val = (b.vw || b.c) + mult * sigma(b);
          const y = getY(val);
          if (i === 0) ctx.moveTo(getX(i), y);
          else ctx.lineTo(getX(i), y);
        });
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash(isDashed ? [4, 4] : []);
        ctx.stroke();
        ctx.setLineDash([]);
      };

      drawBandLine(2, 'rgba(79, 141, 249, 0.55)', true);
      drawBandLine(-2, 'rgba(79, 141, 249, 0.55)', true);
      drawBandLine(1, 'rgba(79, 141, 249, 0.65)', false);
      drawBandLine(-1, 'rgba(79, 141, 249, 0.65)', false);
      drawBandLine(0, '#4f8df9', false, 2.2);

      const lastBar = allBars[allBars.length - 1];
      const lastV = lastBar.vw || lastBar.c;
      const lastSd = sigma(lastBar);

      ctx.font = '9px "IBM Plex Mono", monospace';
      const labels = [
        { name: '+2σ', y: getY(lastV + 2 * lastSd), color: '#4f8df9' },
        { name: '+1σ', y: getY(lastV + 1 * lastSd), color: '#7aa2ff' },
        { name: 'VWAP', y: getY(lastV), color: '#4f8df9' },
        { name: '−1σ', y: getY(lastV - 1 * lastSd), color: '#7aa2ff' },
        { name: '−2σ', y: getY(lastV - 2 * lastSd), color: '#4f8df9' },
      ];
      labels.forEach((l) => {
        ctx.fillStyle = l.color;
        ctx.fillText(l.name, W - pad.right + 58, l.y);
      });
    }

    // 3. 200-Period Trend Baseline
    if (showBaseline && allBars.length > 5) {
      ctx.beginPath();
      allBars.forEach((b, i) => {
        const baseVal = (b.vw || b.c) * 0.992;
        const y = getY(baseVal);
        if (i === 0) ctx.moveTo(getX(i), y);
        else ctx.lineTo(getX(i), y);
      });
      ctx.strokeStyle = '#2dd4a7';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.fillStyle = '#2dd4a7';
      ctx.font = '9px "IBM Plex Mono", monospace';
      ctx.fillText('200 Baseline', W - pad.right + 8, getY(allBars[allBars.length - 1].c * 0.992) + 12);
    }

    // 4. Candlesticks
    allBars.forEach((b, i) => {
      const isUp = b.c >= b.o;
      const color = isUp ? '#2dd4a7' : '#ff6b6b';
      const x = getX(i);

      const yO = getY(b.o);
      const yC = getY(b.c);
      const yH = getY(b.h);
      const yL = getY(b.l);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, yH);
      ctx.lineTo(x, yL);
      ctx.stroke();

      const bodyTop = Math.min(yO, yC);
      const bodyHeight = Math.max(1.8, Math.abs(yO - yC));
      ctx.fillStyle = color;
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyHeight);
    });

    // 5. Entry & Target Lines
    if (showFeeLine && entryPrice > minPrice && entryPrice < maxPrice) {
      const yEntry = getY(entryPrice);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.left, yEntry);
      ctx.lineTo(W - pad.right, yEntry);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.fillText(
        `Entry: ${currentMarket.currencySymbol}${entryPrice.toFixed(currentMarket.tickSize < 0.01 ? 4 : 2)}`,
        pad.left + 8,
        yEntry - 5
      );
    }

    // 6. Tax Comfortable Break-Even Price
    if (showFeeLine && breakEvenPrice > minPrice && breakEvenPrice < maxPrice) {
      const yBe = getY(breakEvenPrice);

      ctx.save();
      ctx.shadowColor = '#ffd60a';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#ffd60a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(pad.left, yBe);
      ctx.lineTo(W - pad.right, yBe);
      ctx.stroke();
      ctx.restore();

      const decimals = currentMarket.tickSize < 0.01 ? 4 : 2;
      const badgeText = `TAX COMFORTABLE BREAK-EVEN: ${currentMarket.currencySymbol}${breakEvenPrice.toFixed(decimals)}`;
      ctx.font = '600 10.5px "IBM Plex Mono", monospace';
      const textMetrics = ctx.measureText(badgeText);
      const bW = textMetrics.width + 16;
      const bH = 18;

      ctx.fillStyle = '#ffd60a';
      ctx.fillRect(pad.left + 10, yBe - 24, bW, bH);
      ctx.fillStyle = '#151300';
      ctx.fillText(badgeText, pad.left + 18, yBe - 15);
    }

    // 7. Last Price Marker
    const lastBar = allBars[allBars.length - 1];
    const yLast = getY(lastBar.c);
    const lastColor = lastBar.c >= lastBar.o ? '#2dd4a7' : '#ff6b6b';

    ctx.fillStyle = lastColor;
    ctx.fillRect(W - pad.right + 2, yLast - 10, 84, 20);
    ctx.fillStyle = '#080d19';
    ctx.font = '600 11px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    const dec = currentMarket.tickSize < 0.01 ? 4 : 2;
    ctx.fillText(`${currentMarket.currencySymbol}${lastBar.c.toFixed(dec)}`, W - pad.right + 44, yLast + 1);

    // 8. Hover Crosshair
    if (hoveredCandle) {
      const hx = hoveredCandle.x;
      const hy = hoveredCandle.y;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      ctx.beginPath();
      ctx.moveTo(hx, pad.top);
      ctx.lineTo(hx, H - pad.bottom);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pad.left, hy);
      ctx.lineTo(W - pad.right, hy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [
    currentMarket,
    getVwap,
    showBands,
    showBaseline,
    showFeeLine,
    entryPrice,
    breakEvenPrice,
    targetNetPrice,
    hoveredCandle,
  ]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const pad = { top: 20, right: 90, bottom: 28, left: 16 };
    const plotW = rect.width - pad.left - pad.right;
    const allBars = simStateRef.current.bars.slice(-54).concat([simStateRef.current.cur]);

    if (mouseX >= pad.left && mouseX <= rect.width - pad.right && allBars.length > 0) {
      const slotW = plotW / allBars.length;
      const index = Math.min(allBars.length - 1, Math.max(0, Math.floor((mouseX - pad.left) / slotW)));
      const candle = allBars[index];
      const candleX = pad.left + slotW * (index + 0.5);

      setHoveredCandle({ candle, x: candleX, y: mouseY, index });
    } else {
      setHoveredCandle(null);
    }
  };

  return (
    <div className="bg-[#0d172b] border border-[#1e2f52] rounded-xl p-5 shadow-sm">
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#182847]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-[#f0f4fc]">1. The Quant Engine Matrix</h2>
            <Tooltip
              term="Time-Agnostic Engine"
              explanation="Modern institutional algorithms execute fractally across all time horizons: 1m execution, 15m session waves, 4h swing cycles, and Daily macro trends."
            >
              <span className="text-[11px] font-mono text-[#4f8df9] bg-[#142340] border border-[#233860] px-2 py-0.5 rounded cursor-pointer">
                Fractal Multi-Horizon Engine
              </span>
            </Tooltip>
          </div>
          <p className="text-xs text-[#8ea4c7] mt-1 max-w-2xl">
            Live simulated price bars with dynamic VWAP, standard deviation confidence bands, and 200-period baseline defense.
          </p>
        </div>

        {/* Timeframe Horizon Switcher & Controls */}
        <div className="flex items-center gap-2">
          {/* Horizon Selector */}
          <div className="flex items-center bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-0.5 text-xs font-mono">
            {(['1m', '15m', '4h', '1d'] as const).map((h) => (
              <button
                key={h}
                onClick={() => onHorizonChange(h)}
                className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                  currentHorizon === h
                    ? 'bg-[#1e3460] text-[#f0f4fc] shadow-sm'
                    : 'text-[#7a8fae] hover:text-[#f0f4fc]'
                }`}
              >
                {h.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isPaused
                ? 'bg-[#1e3460] text-[#ffd60a] border-[#ffd60a]/40'
                : 'bg-[#142038] text-[#c0d0ee] border-[#22345a] hover:bg-[#1b2b4b]'
            }`}
          >
            {isPaused ? '▶' : '⏸'}
          </button>

          <button
            onClick={() => setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 4 : 1)}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-[#142038] text-[#c0d0ee] border border-[#22345a] hover:bg-[#1b2b4b] cursor-pointer"
          >
            {simSpeed}x
          </button>

          <button
            onClick={() => {
              const currentSide = aggressorSide;
              initSession();
              setAggressorSide(currentSide);
            }}
            className="px-3 py-1 text-xs font-medium rounded-lg bg-[#182847] hover:bg-[#223862] text-[#f0f4fc] border border-[#263e6e] transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Live Metric Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 my-3.5">
        <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-2.5">
          <span className="text-[11px] text-[#7a8fae] block">Last Price</span>
          <b className="text-base font-mono font-semibold text-[#f0f4fc]">
            {currentMarket.currencySymbol}
            {lastPrice.toLocaleString(undefined, {
              minimumFractionDigits: currentMarket.tickSize < 0.01 ? 4 : 2,
              maximumFractionDigits: currentMarket.tickSize < 0.01 ? 4 : 2,
            })}
          </b>
        </div>

        <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-2.5">
          <span className="text-[11px] text-[#7a8fae] block">Session VWAP</span>
          <b className="text-base font-mono font-semibold text-[#4f8df9]">
            {currentMarket.currencySymbol}
            {sessionVwap.toLocaleString(undefined, {
              minimumFractionDigits: currentMarket.tickSize < 0.01 ? 4 : 2,
              maximumFractionDigits: currentMarket.tickSize < 0.01 ? 4 : 2,
            })}
          </b>
        </div>

        <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-2.5">
          <span className="text-[11px] text-[#7a8fae] block">VWAP Deviation (Z)</span>
          <b
            className={`text-base font-mono font-semibold ${
              Math.abs(zScore) > 2
                ? 'text-[#ff6b6b]'
                : Math.abs(zScore) > 1
                ? 'text-[#ffd60a]'
                : 'text-[#2dd4a7]'
            }`}
          >
            {zScore >= 0 ? '+' : '−'}
            {Math.abs(zScore).toFixed(2)}σ
          </b>
        </div>

        <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-2.5">
          <span className="text-[11px] text-[#7a8fae] block">Current Bar Volume</span>
          <b className="text-base font-mono font-semibold text-[#f0f4fc]">
            {barVolume.toLocaleString()} shs
          </b>
        </div>

        <div className="bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-2.5 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-[#7a8fae] block">Statistical Regime</span>
          <b
            className={`text-xs font-medium block truncate mt-0.5 ${
              Math.abs(zScore) > 2
                ? 'text-[#ff6b6b]'
                : Math.abs(zScore) > 1
                ? 'text-[#ffd60a]'
                : 'text-[#8ea4c7]'
            }`}
            title={regime}
          >
            {regime}
          </b>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative border border-[#1e2f52] rounded-lg overflow-hidden bg-[#0a101f]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredCandle(null)}
          className="w-full h-[370px] cursor-crosshair block"
        />

        {hoveredCandle && (
          <div className="absolute top-3 left-3 bg-[#0d172bcc]/95 backdrop-blur border border-[#2b3e68] rounded-md px-3 py-1.5 text-[11px] font-mono text-[#dce5f5] shadow-lg pointer-events-none flex items-center gap-3">
            <span>O: <strong className="text-[#f0f4fc]">{hoveredCandle.candle.o.toFixed(2)}</strong></span>
            <span>H: <strong className="text-[#2dd4a7]">{hoveredCandle.candle.h.toFixed(2)}</strong></span>
            <span>L: <strong className="text-[#ff6b6b]">{hoveredCandle.candle.l.toFixed(2)}</strong></span>
            <span>C: <strong className="text-[#f0f4fc]">{hoveredCandle.candle.c.toFixed(2)}</strong></span>
            <span>Vol: <strong className="text-[#8ea4c7]">{Math.round(hoveredCandle.candle.v).toLocaleString()}</strong></span>
          </div>
        )}

        <div className="absolute bottom-2 left-3 flex items-center gap-2 text-[11px]">
          <button
            onClick={() => setShowBands(!showBands)}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              showBands
                ? 'bg-[#18294d] text-[#7aa2ff] border-[#29427b]'
                : 'bg-[#0f1728]/80 text-[#5f7496] border-[#1a263e]'
            }`}
          >
            VWAP ±1σ / ±2σ Bands
          </button>
          <button
            onClick={() => setShowBaseline(!showBaseline)}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              showBaseline
                ? 'bg-[#112a20] text-[#2dd4a7] border-[#1d4837]'
                : 'bg-[#0f1728]/80 text-[#5f7496] border-[#1a263e]'
            }`}
          >
            200 Trend Baseline
          </button>
          <button
            onClick={() => setShowFeeLine(!showFeeLine)}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              showFeeLine
                ? 'bg-[#292408] text-[#ffd60a] border-[#615413]'
                : 'bg-[#0f1728]/80 text-[#5f7496] border-[#1a263e]'
            }`}
          >
            Fee Shield Line
          </button>
        </div>
      </div>

      {/* Inputs Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mt-4 pt-3 border-t border-[#182847]">
        <div className="md:col-span-6">
          <div className="flex items-center justify-between text-xs mb-1">
            <label htmlFor="order-vol-slider" className="text-[#8ea4c7] font-medium">
              Institutional Aggressive Order Volume
            </label>
            <span className="font-mono font-semibold text-[#f0f4fc]">
              {aggressiveVolume * 5}k shares / min
            </span>
          </div>
          <input
            id="order-vol-slider"
            type="range"
            min="0"
            max="100"
            value={aggressiveVolume}
            onChange={(e) => setAggressiveVolume(Number(e.target.value))}
            className="w-full h-1.5 bg-[#14213d] rounded-lg appearance-none cursor-pointer accent-[#4f8df9]"
          />
        </div>

        <div className="md:col-span-3">
          <span className="text-xs text-[#8ea4c7] font-medium block mb-1">Aggressor Flow Side</span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setAggressorSide(1)}
              className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                aggressorSide === 1
                  ? 'bg-[#1b3d32] text-[#2dd4a7] border-[#2dd4a7]/60 shadow-sm'
                  : 'bg-[#111c33] text-[#8ea4c7] border-[#1f2f50] hover:text-[#f0f4fc]'
              }`}
            >
              ▲ Buy Flow
            </button>
            <button
              onClick={() => setAggressorSide(-1)}
              className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                aggressorSide === -1
                  ? 'bg-[#3d1c22] text-[#ff6b6b] border-[#ff6b6b]/60 shadow-sm'
                  : 'bg-[#111c33] text-[#8ea4c7] border-[#1f2f50] hover:text-[#f0f4fc]'
              }`}
            >
              ▼ Sell Flow
            </button>
          </div>
        </div>

        <div className="md:col-span-3 text-[11px] text-[#8ea4c7] bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-2.5">
          <strong className="text-[#f0f4fc] block mb-0.5">Time-Agnostic Law:</strong>
          Price action repeats fractally. 1-minute stop runs and daily Wyckoff springs share identical structural geometry.
        </div>
      </div>
    </div>
  );
};
