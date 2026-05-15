"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import { N, SEG_COLORS, EMOJIS } from "@/hooks/useRoulette";

const SLICE = (2 * Math.PI) / N;
const SIZE  = 480;
const CX    = SIZE / 2;
const CY    = SIZE / 2;
const R     = CX - 14;

function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lighten(hex: string, a: number) {
  const [r, g, b] = hexRgb(hex);
  return `rgb(${Math.min(255,r+a)},${Math.min(255,g+a)},${Math.min(255,b+a)})`;
}
function darken(hex: string, a: number) {
  const [r, g, b] = hexRgb(hex);
  return `rgb(${Math.max(0,r-a)},${Math.max(0,g-a)},${Math.max(0,b-a)})`;
}
function easeOutQuart(t: number) { return 1 - Math.pow(1 - t, 4); }

export interface RouletteWheelRef {
  spin: (winner: number, onDone: () => void) => void;
}

interface Props {
  scores: number[];
  spinning: boolean;
}

const RouletteWheel = forwardRef<RouletteWheelRef, Props>(({ scores, spinning }, ref) => {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rotRef     = useRef(0);
  const rafRef     = useRef<number>(0);

  const draw = useCallback((rot: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, SIZE, SIZE);

    /* Outer glow ring */
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, R + 10, 0, 2 * Math.PI);
    const rg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    rg.addColorStop(0,    "rgba(255,220,0,0.9)");
    rg.addColorStop(0.33, "rgba(255,140,0,0.7)");
    rg.addColorStop(0.66, "rgba(255,220,0,0.9)");
    rg.addColorStop(1,    "rgba(255,80,80,0.6)");
    ctx.strokeStyle = rg;
    ctx.lineWidth   = 16;
    ctx.stroke();
    ctx.restore();

    /* Segments */
    for (let i = 0; i < N; i++) {
      const sa = rot + i * SLICE - Math.PI / 2;
      const ea = sa + SLICE;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, R, sa, ea);
      ctx.closePath();

      const gr = ctx.createRadialGradient(CX, CY, R * 0.05, CX, CY, R);
      gr.addColorStop(0,    lighten(SEG_COLORS[i], 70));
      gr.addColorStop(0.55, SEG_COLORS[i]);
      gr.addColorStop(1,    darken(SEG_COLORS[i], 25));
      ctx.fillStyle   = gr;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      ctx.restore();

      /* Text */
      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(sa + SLICE / 2);
      const tr = R * 0.66;

      ctx.font         = "17px serif";
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(EMOJIS[i], tr, -13);

      ctx.font        = "bold 17px 'Segoe UI', sans-serif";
      ctx.fillStyle   = "white";
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur  = 5;
      ctx.fillText(String(scores[i]), tr, 5);

      ctx.shadowBlur  = 0;
      ctx.font        = "10px 'Segoe UI', sans-serif";
      ctx.fillStyle   = "rgba(255,255,255,0.75)";
      ctx.fillText("점", tr, 19);
      ctx.restore();
    }

    /* Inner accent ring */
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, R * 0.18 + 2, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth   = 2;
    ctx.stroke();
    ctx.restore();

    /* Center circle */
    ctx.save();
    const cg = ctx.createRadialGradient(CX - 4, CY - 4, 0, CX, CY, R * 0.18);
    cg.addColorStop(0,    "#FFF176");
    cg.addColorStop(0.45, "#FFD700");
    cg.addColorStop(1,    "#B8860B");
    ctx.beginPath();
    ctx.arc(CX, CY, R * 0.18, 0, 2 * Math.PI);
    ctx.fillStyle   = cg;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth   = 3;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.font          = "bold 11px 'Segoe UI', sans-serif";
    ctx.fillStyle     = "white";
    ctx.textAlign     = "center";
    ctx.textBaseline  = "middle";
    ctx.shadowColor   = "rgba(0,0,0,0.4)";
    ctx.shadowBlur    = 3;
    ctx.fillText("GO!", CX, CY);
    ctx.restore();

    /* Pointer */
    const tip = CY - R - 2;
    ctx.save();
    ctx.shadowColor = "rgba(255,200,0,0.9)";
    ctx.shadowBlur  = 14;
    ctx.beginPath();
    ctx.moveTo(CX,      tip);
    ctx.lineTo(CX - 16, tip - 32);
    ctx.lineTo(CX + 16, tip - 32);
    ctx.closePath();
    const pg = ctx.createLinearGradient(CX - 16, tip - 32, CX + 16, tip);
    pg.addColorStop(0,   "#FFF176");
    pg.addColorStop(0.5, "#FFD700");
    pg.addColorStop(1,   "#FFA500");
    ctx.fillStyle   = pg;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth   = 2;
    ctx.stroke();
    ctx.restore();
  }, [scores]);

  /* Redraw on score change */
  useEffect(() => { draw(rotRef.current); }, [draw]);

  useImperativeHandle(ref, () => ({
    spin(winner: number, onDone: () => void) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      const offset    = 0.15 + Math.random() * 0.70;
      const base      = -(winner + offset) * SLICE;
      const numRot    = 7 + Math.floor(Math.random() * 4);
      const k         = Math.ceil((rotRef.current + 2 * Math.PI * numRot - base) / (2 * Math.PI));
      const target    = base + 2 * Math.PI * k;
      const startRot  = rotRef.current;
      const delta     = target - startRot;
      const duration  = 4200 + Math.random() * 2000;
      const t0        = performance.now();

      function frame(now: number) {
        const t = Math.min((now - t0) / duration, 1);
        rotRef.current = startRot + delta * easeOutQuart(t);
        draw(rotRef.current);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(frame);
        } else {
          rotRef.current = target;
          draw(target);
          onDone();
        }
      }
      rafRef.current = requestAnimationFrame(frame);
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="drop-shadow-[0_0_18px_rgba(255,200,0,0.35)]"
    />
  );
});

RouletteWheel.displayName = "RouletteWheel";
export default RouletteWheel;
