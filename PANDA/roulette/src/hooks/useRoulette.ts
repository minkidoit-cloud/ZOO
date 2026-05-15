import { useState, useCallback } from "react";

export const N = 10;

export const SEG_COLORS = [
  "#FF6B6B","#FF9F43","#F9CA24","#6AB04C","#22A6B3",
  "#4BCFFA","#7D5FFF","#E056FD","#F0932B","#EB4D4B",
];

export const EMOJIS = ["🍒","🌟","💎","🎯","🔥","💰","🎁","⭐","🌈","🏆"];

function calcProbs(scores: number[]): number[] {
  const minVal = Math.min(...scores);
  const minIdx = scores.indexOf(minVal);
  const p = new Array(N).fill(0);
  p[minIdx] = 0.4;

  const others = scores.map((s, i) => ({ s, i })).filter((x) => x.i !== minIdx);
  const invSum = others.reduce((acc, x) => acc + 1 / x.s, 0);
  others.forEach(({ s, i }) => { p[i] = (1 / s / invSum) * 0.6; });
  return p;
}

function weightedPick(p: number[]): number {
  let r = Math.random(), cum = 0;
  for (let i = 0; i < p.length; i++) {
    cum += p[i];
    if (r < cum) return i;
  }
  return p.length - 1;
}

function makeScores(): number[] {
  return Array.from({ length: N }, () => Math.floor(Math.random() * 100) + 1);
}

export interface SpinResult {
  winner: number;
  score: number;
  prob: number;
  isMax: boolean;
  isMin: boolean;
}

export function useRoulette() {
  const [scores, setScores]         = useState<number[]>(() => makeScores());
  const [probs,  setProbs]          = useState<number[]>(() => calcProbs(makeScores()));
  const [totalScore, setTotalScore] = useState(0);
  const [spinCount,  setSpinCount]  = useState(0);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);

  const pickWinner = useCallback((): number => weightedPick(probs), [probs]);

  const recordResult = useCallback((winner: number) => {
    const score = scores[winner];
    setTotalScore((t) => t + score);
    setSpinCount((c) => c + 1);
    setLastResult({
      winner,
      score,
      prob:  probs[winner],
      isMax: score === Math.max(...scores),
      isMin: score === Math.min(...scores),
    });
  }, [scores, probs]);

  const newGame = useCallback(() => {
    const s = makeScores();
    setScores(s);
    setProbs(calcProbs(s));
    setTotalScore(0);
    setSpinCount(0);
    setLastResult(null);
  }, []);

  return { scores, probs, totalScore, spinCount, lastResult, pickWinner, recordResult, newGame };
}
