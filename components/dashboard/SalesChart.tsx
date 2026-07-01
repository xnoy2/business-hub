"use client";

import { useState } from "react";
import { IconChevron } from "../icons";

/* Hand-rolled SVG area chart — smooth catmull-rom-ish curve, gold gradient
   fill, hover tooltip on the latest "won" point. No chart dependency. */
export function SalesChart({
  data,
  labels,
  wonValue,
  wonDelta,
}: {
  data: number[];
  labels: string[];
  wonValue: string;
  wonDelta: string;
}) {
  const W = 560;
  const H = 230;
  const pad = { l: 38, r: 16, t: 18, b: 26 };
  const max = Math.max(...data) * 1.15;
  const min = 0;

  const px = (i: number) =>
    pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
  const py = (v: number) =>
    pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);

  const pts = data.map((v, i) => [px(i), py(v)] as const);

  // Smooth path via cubic segments
  const line = pts
    .map((p, i) => {
      if (i === 0) return `M ${p[0]} ${p[1]}`;
      const prev = pts[i - 1];
      const cx = (prev[0] + p[0]) / 2;
      return `C ${cx} ${prev[1]}, ${cx} ${p[1]}, ${p[0]} ${p[1]}`;
    })
    .join(" ");

  const area = `${line} L ${pts[pts.length - 1][0]} ${H - pad.b} L ${pts[0][0]} ${H - pad.b} Z`;
  const last = pts[pts.length - 1];

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round((max * t) / 20) * 20);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[15px] font-semibold text-ink">Sales Overview</h3>
        <button className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-3 py-1.5 text-xs text-ink-soft hover:border-line-strong transition">
          This Month <IconChevron width={14} height={14} className="text-muted" />
        </button>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <defs>
            <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9a24b" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#c9a24b" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8c7233" />
              <stop offset="100%" stopColor="#e4c77b" />
            </linearGradient>
          </defs>

          {/* gridlines + y labels */}
          {yTicks.map((t, i) => {
            const y = py(t);
            return (
              <g key={i}>
                <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="#26262c" strokeDasharray="3 5" />
                <text x={4} y={y + 3.5} fontSize="9.5" fill="#5c5c64">
                  £{t}K
                </text>
              </g>
            );
          })}

          <path d={area} fill="url(#goldArea)" />
          <path d={line} fill="none" stroke="url(#goldLine)" strokeWidth="2.4" />

          {/* end marker */}
          <circle cx={last[0]} cy={last[1]} r="5" fill="#e4c77b" />
          <circle cx={last[0]} cy={last[1]} r="9" fill="#e4c77b" opacity="0.18" />

          {/* x labels */}
          {labels.map((l, i) =>
            l ? (
              <text key={i} x={px(i)} y={H - 6} fontSize="9.5" fill="#5c5c64" textAnchor="middle">
                {l}
              </text>
            ) : null
          )}
        </svg>

        {/* Floating tooltip near the latest point */}
        <div
          className="absolute pointer-events-none rounded-xl border border-line bg-elevated/95 px-3 py-2 shadow-xl"
          style={{ left: "46%", top: "20%" }}
        >
          <div className="text-[15px] font-semibold text-ink">{wonValue}</div>
          <div className="text-[11px] text-muted">Won This Month</div>
          <div className="text-[11px] text-pos">↑ {wonDelta}</div>
        </div>
      </div>
    </div>
  );
}
