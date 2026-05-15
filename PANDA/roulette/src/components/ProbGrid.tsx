"use client";

import { N, SEG_COLORS, EMOJIS } from "@/hooks/useRoulette";

interface Props {
  scores: number[];
  probs:  number[];
  highlightIdx: number | null;
}

export default function ProbGrid({ scores, probs, highlightIdx }: Props) {
  const sorted = scores
    .map((s, i) => ({ s, i, p: probs[i] }))
    .sort((a, b) => b.s - a.s);

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4">
      <p className="text-center text-xs tracking-widest uppercase opacity-40 mb-3">
        📊 당첨 확률 현황 (높은 점수 → 낮은 확률)
      </p>
      <div className="grid grid-cols-5 gap-1.5">
        {sorted.map(({ s, i, p }) => {
          const [r, g, b] = [parseInt(SEG_COLORS[i].slice(1,3),16), parseInt(SEG_COLORS[i].slice(3,5),16), parseInt(SEG_COLORS[i].slice(5,7),16)];
          const isWin = highlightIdx === i;
          return (
            <div
              key={i}
              className="rounded-xl py-2 px-1 text-center transition-all duration-300"
              style={{
                borderTop: `3px solid ${SEG_COLORS[i]}`,
                background: isWin
                  ? `rgba(${r},${g},${b},0.28)`
                  : "rgba(255,255,255,0.06)",
                transform: isWin ? "scale(1.06)" : "scale(1)",
              }}
            >
              <div className="text-base leading-tight">{EMOJIS[i]}</div>
              <div className="text-sm font-bold mt-0.5" style={{ color: SEG_COLORS[i] }}>
                {s}점
              </div>
              <div className="text-[11px] opacity-60 mt-0.5">
                {(p * 100).toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
