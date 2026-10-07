"use client";

import { useState } from "react";

const TILES: Record<string, [number, number]> = {
  AK: [0, 0],
  ME: [10, 0],
  WI: [5, 1],
  VT: [9, 1],
  NH: [10, 1],
  WA: [0, 2],
  ID: [1, 2],
  MT: [2, 2],
  ND: [3, 2],
  MN: [4, 2],
  IL: [5, 2],
  MI: [6, 2],
  NY: [8, 2],
  MA: [9, 2],
  OR: [0, 3],
  NV: [1, 3],
  WY: [2, 3],
  SD: [3, 3],
  IA: [4, 3],
  IN: [5, 3],
  OH: [6, 3],
  PA: [7, 3],
  NJ: [8, 3],
  CT: [9, 3],
  RI: [10, 3],
  CA: [0, 4],
  UT: [1, 4],
  CO: [2, 4],
  NE: [3, 4],
  MO: [4, 4],
  KY: [5, 4],
  WV: [6, 4],
  VA: [7, 4],
  MD: [8, 4],
  DE: [9, 4],
  AZ: [1, 5],
  NM: [2, 5],
  KS: [3, 5],
  AR: [4, 5],
  TN: [5, 5],
  NC: [6, 5],
  SC: [7, 5],
  DC: [8, 5],
  OK: [3, 6],
  LA: [4, 6],
  MS: [5, 6],
  AL: [6, 6],
  GA: [7, 6],
  HI: [0, 7],
  TX: [3, 7],
  FL: [7, 7],
};

export function UsMap({
  states,
  liveRegions,
}: {
  states: { label: string; count: number }[];
  liveRegions: string[];
}) {
  const counts = new Map(states.map((row) => [row.label, row.count]));
  const max = Math.max(1, ...states.map((row) => row.count));
  const [hover, setHover] = useState<string | null>(null);
  const live = new Set(liveRegions);
  const ranked = [...states].sort((a, b) => b.count - a.count);

  return (
    <div className="command-map">
      <svg viewBox="0 0 430 290" role="img" aria-label="United States visits by state">
        {Object.entries(TILES).map(([code, [col, row]]) => {
          const count = counts.get(code) ?? 0;
          const hot = count / max;
          return (
            <g
              key={code}
              onMouseEnter={() => setHover(`${code} · ${count} ${count === 1 ? "visit" : "visits"}`)}
              onMouseLeave={() => setHover(null)}
            >
              <title>
                {code}: {count} {count === 1 ? "visit" : "visits"}
                {live.has(code) ? ", someone is active" : ""}
              </title>
              <rect
                x={8 + col * 38}
                y={8 + row * 34}
                width="34"
                height="28"
                rx="5"
                fill={count ? "var(--color-gold)" : "var(--color-fg)"}
                fillOpacity={count ? 0.2 + hot * 0.75 : 0.08}
                stroke={live.has(code) ? "var(--color-bone)" : "transparent"}
                strokeWidth="1.5"
              />
              <text
                x={25 + col * 38}
                y={26 + row * 34}
                textAnchor="middle"
                fontSize="9"
                fill={count ? "var(--color-ink)" : "var(--color-fg)"}
                fillOpacity={count ? 1 : 0.55}
              >
                {code}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="command-empty">{hover ?? "Shade is visits. A bone edge means someone is active in that state."}</p>
      <ol className="command-state-list">
        {ranked.map((row) => (
          <li key={row.label}>
            <span>{row.label}</span>
            <b>{row.count}</b>
          </li>
        ))}
      </ol>
    </div>
  );
}
