'use client';

import { useMemo } from 'react';
import { useCanvasLoop } from './useCanvasLoop';

/** Isometric, extruded candlesticks scrolling past. */
export function TradingVisual() {
  const series = useMemo(() => {
    const out: { o: number; c: number; h: number; l: number }[] = [];
    let p = 50;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 80; i++) {
      const o = p;
      const c = Math.max(10, Math.min(90, o + (rnd() - 0.45) * 14));
      out.push({ o, c, h: Math.max(o, c) + rnd() * 5, l: Math.min(o, c) - rnd() * 5 });
      p = c;
    }
    return out;
  }, []);

  const ref = useCanvasLoop((ctx, w, h, t) => {
    const bw = 14;
    const gap = 8;
    const depth = 7;
    const offset = (t * 18) % (bw + gap);
    const startIdx = Math.floor(t * 18 / (bw + gap));
    const n = Math.ceil(w / (bw + gap)) + 2;
    const visible = Array.from({ length: n }, (_, k) => series[(startIdx + k) % series.length]);
    const lo = Math.min(...visible.map((d) => d.l));
    const hi = Math.max(...visible.map((d) => d.h));
    const scaleY = (v: number) => h * 0.88 - ((v - lo) / Math.max(1, hi - lo)) * h * 0.66;

    // Floor grid.
    ctx.strokeStyle = 'rgba(176,141,87,0.12)';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 22) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    for (let k = 0; k < n; k++) {
      const d = series[(startIdx + k) % series.length];
      const x = k * (bw + gap) - offset + 10;
      const up = d.c >= d.o;
      const top = scaleY(Math.max(d.o, d.c));
      const bot = scaleY(Math.min(d.o, d.c));
      const body = Math.max(2, bot - top);
      const col = up ? [46, 230, 160] : [255, 92, 122];
      // Wick
      ctx.strokeStyle = `rgba(${col},0.7)`;
      ctx.beginPath();
      ctx.moveTo(x + bw / 2 + depth / 2, scaleY(d.h) - depth / 2);
      ctx.lineTo(x + bw / 2 + depth / 2, scaleY(d.l) - depth / 2);
      ctx.stroke();
      // Side face
      ctx.fillStyle = `rgba(${col.map((c) => c * 0.45)},0.95)`;
      ctx.beginPath();
      ctx.moveTo(x + bw, top);
      ctx.lineTo(x + bw + depth, top - depth);
      ctx.lineTo(x + bw + depth, top - depth + body);
      ctx.lineTo(x + bw, top + body);
      ctx.closePath();
      ctx.fill();
      // Top face
      ctx.fillStyle = `rgba(${col.map((c) => Math.min(255, c * 1.15))},1)`;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x + depth, top - depth);
      ctx.lineTo(x + bw + depth, top - depth);
      ctx.lineTo(x + bw, top);
      ctx.closePath();
      ctx.fill();
      // Front face
      ctx.shadowColor = `rgb(${col})`;
      ctx.shadowBlur = 10;
      ctx.fillStyle = `rgba(${col},0.9)`;
      ctx.fillRect(x, top, bw, body);
      ctx.shadowBlur = 0;
    }

    // Live price tag.
    const last = series[(startIdx + n - 3) % series.length];
    ctx.font = '600 11px ui-monospace, monospace';
    ctx.fillStyle = 'rgba(176,141,87,0.9)';
    ctx.beginPath();
    ctx.roundRect(w - 104, 14, 90, 24, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(last.c >= last.o ? "SOL ▲ swap" : "SOL ▼ guard", w - 96, 30);
  });
  return <canvas ref={ref} className="h-full w-full" aria-hidden />;
}
