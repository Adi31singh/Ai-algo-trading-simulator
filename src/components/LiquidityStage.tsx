/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VAMP_PHASES } from '../data/quantEducation';
import { Tooltip } from './Tooltip';

interface StopOrder {
  x: number;
  y: number;
  shares: number;
}

export const LiquidityStage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation timeline state
  const [animTime, setAnimTime] = useState<number>(-1); // -1 = idle
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(-1);
  const [triggeredCount, setTriggeredCount] = useState<number>(0);
  const [totalSharesAbsorbed, setTotalSharesAbsorbed] = useState<number>(0);
  const [autoPlaying, setAutoPlaying] = useState<boolean>(false);

  // Base price chart curve before the stop hunt
  const baseCurve = useRef<[number, number][]>([
    [0.02, 0.32],
    [0.09, 0.27],
    [0.17, 0.42],
    [0.25, 0.37],
    [0.34, 0.58],
    [0.40, 0.65], // First structural low pivot
    [0.47, 0.52],
    [0.54, 0.44],
    [0.59, 0.53],
    [0.63, 0.59], // Approaching consolidation
  ]);

  // Stop run hunt path keyframes: [x, y, timeInSeconds]
  const runKeyframes = useRef<[number, number, number][]>([
    [0.63, 0.59, 0.0],
    [0.67, 0.61, 0.9], // Phase 0: Volume building
    [0.71, 0.595, 1.8], // Phase 1: Absorption compression
    [0.74, 0.62, 2.4],
    [0.78, 0.88, 2.95], // Phase 2: Violent spike DOWN through stops
    [0.81, 0.82, 3.3], // Bottom wick absorption
    [0.87, 0.44, 3.9], // Phase 3: Explosive reversal markup
    [0.95, 0.26, 4.6], // Reversal continuation
  ]);

  // 14 Retail Stop-Loss Orders placed tightly beneath structural low (y = 0.65)
  const stopLosses = useRef<StopOrder[]>(
    Array.from({ length: 14 }, (_, i) => ({
      x: 0.33 + i * 0.022,
      y: 0.70 + (i % 3) * 0.032,
      shares: 2500 + ((i * 17) % 5) * 1000,
    }))
  );

  const totalStopShares = useRef(
    stopLosses.current.reduce((acc, curr) => acc + curr.shares, 0)
  );

  // Interpolate current price head coordinate given time t
  const getHeadPosition = useCallback((t: number) => {
    const kf = runKeyframes.current;
    if (t <= 0) return { x: kf[0][0], y: kf[0][1] };
    for (let i = 1; i < kf.length; i++) {
      if (t <= kf[i][2]) {
        const prev = kf[i - 1];
        const next = kf[i];
        const frac = (t - prev[2]) / (next[2] - prev[2]);
        return {
          x: prev[0] + (next[0] - prev[0]) * frac,
          y: prev[1] + (next[1] - prev[1]) * frac,
        };
      }
    }
    const last = kf[kf.length - 1];
    return { x: last[0], y: last[1] };
  }, []);

  // Trigger stop hunt animation sequence
  const startStopHunt = () => {
    setAnimTime(0);
    setAutoPlaying(true);
  };

  const resetStage = () => {
    setAnimTime(-1);
    setActivePhaseIndex(-1);
    setTriggeredCount(0);
    setTotalSharesAbsorbed(0);
    setAutoPlaying(false);
  };

  // Jump directly to a specific VAMP phase
  const jumpToPhase = (phaseIdx: number) => {
    setAutoPlaying(false);
    setActivePhaseIndex(phaseIdx);
    if (phaseIdx === 0) setAnimTime(0.5);
    else if (phaseIdx === 1) setAnimTime(1.9);
    else if (phaseIdx === 2) setAnimTime(3.0);
    else if (phaseIdx === 3) setAnimTime(4.2);
  };

  // Animation timeline tick
  useEffect(() => {
    if (!autoPlaying) return;
    let animId: number;
    let startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      if (elapsed <= 5.2) {
        setAnimTime(elapsed);
        animId = requestAnimationFrame(frame);
      } else {
        setAnimTime(5.2);
        setAutoPlaying(false);
      }
    };

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [autoPlaying]);

  // Main canvas render
  useEffect(() => {
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

    const X = (val: number) => val * W;
    const Y = (val: number) => val * H;

    // Clear background
    ctx.fillStyle = '#0a101f';
    ctx.fillRect(0, 0, W, H);

    // Subtle horizontal gridlines
    ctx.strokeStyle = '#14213d';
    ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, H * (i / 6));
      ctx.lineTo(W, H * (i / 6));
      ctx.stroke();
    }

    const t = animTime;

    // 1. Structural Low Line
    const structuralLowY = Y(0.65);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(X(0.28), structuralLowY);
    ctx.lineTo(X(0.72), structuralLowY);
    ctx.stroke();

    ctx.font = '500 11px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#8ea4c7';
    ctx.fillText('Visible Structural Support Low', X(0.38), structuralLowY - 8);

    // 2. Retail Stop-Loss Liquidity Pool Shaded Box
    const poolX = X(0.31);
    const poolY = Y(0.68);
    const poolW = X(0.35);
    const poolH = Y(0.12);

    ctx.fillStyle = 'rgba(45, 212, 167, 0.05)';
    ctx.fillRect(poolX, poolY, poolW, poolH);
    ctx.strokeStyle = 'rgba(45, 212, 167, 0.4)';
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(poolX, poolY, poolW, poolH);
    ctx.setLineDash([]);

    ctx.fillStyle = '#2dd4a7';
    ctx.fillText('RETAIL STOP-LOSS LIQUIDITY POOL', poolX + 10, poolY + poolH + 16);

    // 3. Track maximum downward depth to determine which stops were triggered
    let maxDepthY = 0;
    if (t >= 0) {
      for (let s = 0; s <= t; s += 0.04) {
        maxDepthY = Math.max(maxDepthY, getHeadPosition(s).y);
      }
    }

    // 4. Render the 14 Stop Orders
    let hitCount = 0;
    let sharesHit = 0;

    stopLosses.current.forEach((st) => {
      const isHit = t >= 0 && maxDepthY >= st.y;
      if (isHit) {
        hitCount++;
        sharesHit += st.shares;
      }

      const sx = X(st.x);
      const sy = Y(st.y);

      ctx.save();
      if (isHit) {
        // Stop triggered! Red glow + shockwave ring
        ctx.shadowColor = '#ff6b6b';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ff6b6b';
        ctx.strokeStyle = '#ff6b6b';

        // Animated pulse ring if hit recently
        ctx.beginPath();
        ctx.arc(sx, sy, 7, 0, 2 * Math.PI);
        ctx.fill();

        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(sx, sy, 11, 0, 2 * Math.PI);
        ctx.stroke();
      } else {
        // Resting green stop-loss cluster
        ctx.fillStyle = '#2dd4a7';
        ctx.fillRect(sx - 4.5, sy - 4.5, 9, 9);
      }
      ctx.restore();
    });

    setTriggeredCount(hitCount);
    setTotalSharesAbsorbed(sharesHit);

    // 5. Base Historical Price Line
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#c0d0ee';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    baseCurve.current.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(X(pt[0]), Y(pt[1]));
      else ctx.lineTo(X(pt[0]), Y(pt[1]));
    });
    ctx.stroke();

    // 6. Stop Hunt Animated Price Head & Path
    if (t >= 0) {
      const head = getHeadPosition(t);

      // Path stroke color changes based on phase (manipulation down = red, absorption markup = vibrant green)
      ctx.strokeStyle = t > 3.3 ? '#2dd4a7' : t > 2.4 ? '#ff6b6b' : '#7aa2ff';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(X(0.63), Y(0.59));

      runKeyframes.current.forEach((pt) => {
        if (pt[2] <= t && pt[2] > 0) {
          ctx.lineTo(X(pt[0]), Y(pt[1]));
        }
      });
      ctx.lineTo(X(head.x), Y(head.y));
      ctx.stroke();

      // Glowing Price Head Indicator
      ctx.save();
      ctx.shadowColor = t > 3.3 ? '#2dd4a7' : t > 2.4 ? '#ff6b6b' : '#7aa2ff';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(X(head.x), Y(head.y), 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();

      // Institutional Volume Footprint Bars at bottom
      for (let i = 0; i < 30; i++) {
        const xFrac = 0.63 + i * 0.0105;
        if (xFrac > head.x) break;

        // Volume spikes dramatically during the stop manipulation (x: 0.74 - 0.81)
        const isSpike = xFrac >= 0.74 && xFrac <= 0.82;
        const barHeight = isSpike ? 54 - (i % 3) * 6 : 14 + (i * 27) % 15;
        const barColor = isSpike ? '#ff6b6b' : xFrac > 0.82 ? '#2dd4a7' : '#2b4478';

        ctx.fillStyle = barColor;
        ctx.fillRect(X(xFrac), H - barHeight - 4, 5, barHeight);
      }
    }

    // 7. Explosive Institutional Absorption Reversal Arrow (Phase P)
    if (t > 3.3) {
      const subTime = t - 3.3;
      const bounce = Math.abs(Math.sin(subTime * 5)) * 12 * (1 - Math.min(subTime / 1.6, 1));
      const arrowX = X(0.80);
      const startY = Y(0.82) - bounce;
      const endY = Y(0.36) - bounce;

      ctx.save();
      ctx.shadowColor = '#2dd4a7';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = '#2dd4a7';
      ctx.fillStyle = '#2dd4a7';
      ctx.lineWidth = 7;

      // Shaft
      ctx.beginPath();
      ctx.moveTo(arrowX, startY);
      ctx.lineTo(arrowX, endY + 18);
      ctx.stroke();

      // Arrow Head
      ctx.beginPath();
      ctx.moveTo(arrowX, endY - 6);
      ctx.lineTo(arrowX - 16, endY + 22);
      ctx.lineTo(arrowX + 16, endY + 22);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Callout Label
      ctx.fillStyle = '#2dd4a7';
      ctx.font = '600 12px "IBM Plex Mono", monospace';
      ctx.fillText('⚡ EXPLOSIVE ABSORPTION REVERSAL', arrowX - 220, endY + 8);
    }

    // Determine current phase based on timeline t
    const currentPhase = t < 0 ? -1 : t < 1.0 ? 0 : t < 2.5 ? 1 : t < 3.3 ? 2 : 3;
    setActivePhaseIndex(currentPhase);

    ctx.restore();
  }, [animTime, getHeadPosition]);

  return (
    <div className="bg-[#0d172b] border border-[#1e2f52] rounded-xl p-5 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#182847]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-[#f0f4fc]">2. Animated Liquidity Stage</h2>
            <Tooltip
              term="V.A.M.P. framework"
              explanation="Volume, Absorption, Manipulation, Positioning: How smart money creates liquidity by hunting retail stop losses."
            >
              <span className="text-[11px] font-mono text-[#2dd4a7] bg-[#122822] border border-[#204a3e] px-2 py-0.5 rounded cursor-pointer">
                The V.A.M.P. Stop-Run Simulator
              </span>
            </Tooltip>
          </div>
          <p className="text-xs text-[#8ea4c7] mt-1 max-w-2xl">
            Watch how institutions trigger retail stop-loss liquidity resting under structural lows to fill block buy orders without incurring slippage.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={startStopHunt}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#ff6b6b] hover:bg-[#ff8080] text-[#140608] transition-all transform active:scale-95 shadow-sm cursor-pointer"
          >
            ▶ Run Stop Hunt
          </button>
          <button
            onClick={resetStage}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-[#142038] hover:bg-[#1b2b4b] text-[#c0d0ee] border border-[#22345a] transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* V.A.M.P. Interactive Scrubber / Phase Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
        {VAMP_PHASES.map((p, idx) => {
          const isActive = activePhaseIndex === idx;
          return (
            <button
              key={p.key}
              onClick={() => jumpToPhase(idx)}
              className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#182b4d] border-[#4f8df9] shadow-sm'
                  : 'bg-[#0a1222] border-[#1b2c4e] hover:border-[#2b4478]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-bold font-mono px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: isActive ? p.color : '#14213d',
                    color: isActive ? '#080d19' : p.color,
                  }}
                >
                  {p.key}
                </span>
                <span className="text-[10px] text-[#5e7394] font-mono">Phase 0{idx + 1}</span>
              </div>
              <strong className="text-xs text-[#f0f4fc] block mt-1.5 truncate">{p.title}</strong>
              <span className="text-[10px] text-[#7a8fae] block truncate mt-0.5">{p.subtitle}</span>
            </button>
          );
        })}
      </div>

      {/* Liquidity Stage Canvas */}
      <div className="relative border border-[#1e2f52] rounded-lg overflow-hidden bg-[#0a101f]">
        <canvas ref={canvasRef} className="w-full h-[300px] block" />

        {/* Live Liquidity Metric Overlay */}
        <div className="absolute top-3 right-3 bg-[#0d172bcc]/95 backdrop-blur border border-[#22365e] rounded-md px-3 py-2 text-right">
          <span className="text-[10px] text-[#8ea4c7] block">Stops Triggered</span>
          <b
            className={`text-sm font-mono font-semibold ${
              triggeredCount > 0 ? 'text-[#ff6b6b]' : 'text-[#2dd4a7]'
            }`}
          >
            {triggeredCount} / 14 Orders
          </b>
          <span className="text-[10px] text-[#5e7394] block mt-0.5 font-mono">
            {totalSharesAbsorbed.toLocaleString()} shs absorbed
          </span>
        </div>
      </div>

      {/* Explanatory Narrative Box */}
      <div className="mt-3 bg-[#0a1222] border border-[#1b2c4e] rounded-lg p-3 text-xs leading-relaxed">
        {activePhaseIndex >= 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: VAMP_PHASES[activePhaseIndex].color }}
              />
              <strong className="text-[#f0f4fc]">
                {VAMP_PHASES[activePhaseIndex].key} — {VAMP_PHASES[activePhaseIndex].title}
              </strong>
            </div>
            <p className="text-[#c0d0ee]">{VAMP_PHASES[activePhaseIndex].description}</p>
            <p className="text-[#2dd4a7] mt-1.5 text-[11px]">
              <strong>Institutional Strategy:</strong> {VAMP_PHASES[activePhaseIndex].institutionalIntent}
            </p>
          </div>
        ) : (
          <div className="text-[#8ea4c7]">
            <strong className="text-[#f0f4fc]">Setup:</strong> Retail traders place protective sell stop-loss orders just beneath the visible support low. Click <strong>"Run Stop Hunt"</strong> or select any phase above to inspect how the institutional desk hunts and absorbs this liquidity pool.
          </div>
        )}
      </div>
    </div>
  );
};
