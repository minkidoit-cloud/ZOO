"use client";

import { useRef, useState, useCallback } from "react";
import RouletteWheel, { RouletteWheelRef } from "@/components/RouletteWheel";
import ProbGrid from "@/components/ProbGrid";
import { useRoulette, EMOJIS } from "@/hooks/useRoulette";

export default function RoulettePage() {
  const wheelRef = useRef<RouletteWheelRef>(null);
  const [spinning, setSpinning] = useState(false);
  const [highlight, setHighlight] = useState<number | null>(null);

  const { scores, probs, totalScore, spinCount, lastResult, pickWinner, recordResult, newGame } =
    useRoulette();

  const handleSpin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setHighlight(null);

    const winner = pickWinner();
    wheelRef.current?.spin(winner, () => {
      recordResult(winner);
      setHighlight(winner);
      setSpinning(false);
    });
  }, [spinning, pickWinner, recordResult]);

  const handleNewGame = useCallback(() => {
    if (spinning) return;
    setHighlight(null);
    newGame();
  }, [spinning, newGame]);

  return (
    <main
      className="min-h-screen flex flex-col items-center px-3 py-8 overflow-x-hidden"
      style={{ background: "radial-gradient(ellipse at top, #1a1a4e 0%, #0d0d2b 60%, #000010 100%)" }}
    >
      {/* Stars overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.8) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 40%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 20%, rgba(255,255,255,0.9) 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 60%, rgba(255,255,255,0.7) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 10%, rgba(255,255,255,0.8) 0%, transparent 100%),
            radial-gradient(2px 2px at 45% 55%, rgba(255,215,0,0.5) 0%, transparent 100%),
            radial-gradient(2px 2px at 85% 35%, rgba(255,215,0,0.4) 0%, transparent 100%)
          `,
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-lg gap-5">
        {/* Title */}
        <h1
          className="text-3xl font-black tracking-widest"
          style={{
            background: "linear-gradient(90deg, #FFD700, #FFA500, #FFD700)",
            backgroundSize: "200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 12px rgba(255,200,0,0.5))",
            animation: "goldShine 3s linear infinite",
          }}
        >
          🎰 행운의 돌림판 🎰
        </h1>

        {/* Wheel */}
        <RouletteWheel ref={wheelRef} scores={scores} spinning={spinning} />

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSpin}
            disabled={spinning}
            className="px-12 py-3.5 text-xl font-black tracking-widest rounded-full text-white
              disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150
              hover:enabled:-translate-y-1 active:enabled:translate-y-0"
            style={{
              background: "linear-gradient(135deg, #FF6B35, #F7C948, #FF6B35)",
              backgroundSize: "200%",
              boxShadow: "0 6px 24px rgba(255,107,53,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
              animation: spinning ? "none" : "btnPulse 2.5s ease-in-out infinite",
            }}
          >
            🎲 돌려라!
          </button>
          <button
            onClick={handleNewGame}
            disabled={spinning}
            className="px-5 py-3.5 text-base rounded-full text-white/80 border border-white/25
              bg-white/5 backdrop-blur disabled:opacity-40 disabled:cursor-not-allowed
              transition-all hover:enabled:bg-white/15 hover:enabled:-translate-y-0.5"
          >
            🔄 새 게임
          </button>
        </div>

        {/* Result */}
        <div className="w-full min-h-[90px] flex items-center justify-center">
          {lastResult && (
            <div
              className="w-full border-2 rounded-2xl px-8 py-4 text-center backdrop-blur-md"
              style={{
                background: "rgba(255,255,255,0.07)",
                borderColor: "rgba(255,215,0,0.5)",
                boxShadow: "0 4px 30px rgba(255,200,0,0.15)",
                animation: "popIn 0.45s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              <div className="text-3xl mb-1">{EMOJIS[lastResult.winner]}</div>
              <div
                className="text-4xl font-black leading-none"
                style={{ color: "#FFD700", textShadow: "0 0 20px rgba(255,215,0,0.7)" }}
              >
                {lastResult.score}점 당첨!
              </div>
              <div className="mt-1.5 text-sm text-white/75">
                {lastResult.isMax && <span className="text-red-400">🏆 최고 점수! &nbsp;·&nbsp; </span>}
                {lastResult.isMin && <span className="text-blue-300">🎯 최저 점수 (확률 40%) &nbsp;·&nbsp; </span>}
                당첨 확률 <b>{(lastResult.prob * 100).toFixed(1)}%</b>
              </div>
            </div>
          )}
        </div>

        {/* Score board */}
        <div className="flex gap-5 text-sm text-white/60 bg-white/5 border border-white/10 rounded-full px-6 py-2">
          <span>누적 점수 <span className="text-yellow-300 font-bold text-base">{totalScore}</span>점</span>
          <span>스핀 횟수 <span className="text-yellow-300 font-bold text-base">{spinCount}</span>회</span>
          <span>
            평균{" "}
            <span className="text-yellow-300 font-bold text-base">
              {spinCount ? Math.round(totalScore / spinCount) : "-"}
            </span>
            점
          </span>
        </div>

        {/* Probability grid */}
        <ProbGrid scores={scores} probs={probs} highlightIdx={highlight} />
      </div>

      <style>{`
        @keyframes goldShine {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes btnPulse {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.55) translateY(10px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
      `}</style>
    </main>
  );
}
