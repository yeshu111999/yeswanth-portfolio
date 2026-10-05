'use client';

import { useCanvasLoop } from './useCanvasLoop';

/** A 3D ribbon of waveforms that swells as the call connects, then talks in bursts. */
export function VoiceVisual() {
  const ref = useCanvasLoop((ctx, w, h, t) => {
    const cycle = t % 9;
    const connect = Math.min(1, Math.max(0, (cycle - 1.6) / 0.8));
    const rows = 22;
    const cx = w / 2;
    const horizon = h * 0.28;

    // Dialing rings before connect.
    if (connect < 1) {
      for (let i = 0; i < 3; i++) {
        const r = ((t * 40 + i * 30) % 90) + 10;
        ctx.beginPath();
        ctx.arc(cx, h * 0.55, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(230,211,174,${(1 - r / 100) * (1 - connect) * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    for (let r = rows - 1; r >= 0; r--) {
      const depth = r / rows;
      const persp = 1 / (1 + depth * 2.2);
      const y = horizon + (h * 0.75 - horizon) * persp + (1 - persp) * 10;
      const width = w * 1.1 * persp;
      const amp = h * 0.22 * persp * connect;
      ctx.beginPath();
      const seg = 90;
      for (let i = 0; i <= seg; i++) {
        const u = i / seg;
        const x = cx - width / 2 + u * width;
        const env = Math.sin(u * Math.PI) ** 2;
        const talk = 0.55 + 0.45 * Math.sin(t * 2.3 + depth * 3) * Math.sin(t * 0.9);
        const v =
          Math.sin(u * 22 + t * 6 - depth * 4) * 0.55 +
          Math.sin(u * 47 - t * 9 + depth * 2) * 0.3 +
          Math.sin(u * 9 + t * 2) * 0.15;
        const yy = y - v * amp * env * talk;
        if (i === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      const front = 1 - depth;
      const mix = r % 5 === 0 ? '212,180,131' : '176,141,87';
      ctx.strokeStyle = `rgba(${mix},${0.15 + front * 0.8})`;
      ctx.lineWidth = 0.6 + front * 1.6;
      ctx.shadowColor = r % 5 === 0 ? '#D4B483' : '#B08D57';
      ctx.shadowBlur = front * 12;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Call status pill.
    const connected = connect >= 1;
    const label = connected ? `Connected  00:${String(Math.floor(cycle - 2.4 < 0 ? 0 : cycle - 2.4)).padStart(2, '0')}` : 'Dialing via Telnyx…';
    ctx.font = '600 12px Inter, system-ui, sans-serif';
    const tw = ctx.measureText(label).width + 34;
    const px = 20;
    const py = 20;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.roundRect(px, py, tw, 28, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = connected ? '#2EE6A0' : '#D4B483';
    ctx.beginPath();
    ctx.arc(px + 14, py + 14, 4 + (connected ? Math.sin(t * 6) : 0), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F3EEE6';
    ctx.fillText(label, px + 25, py + 18);
  });
  return <canvas ref={ref} className="h-full w-full" aria-hidden />;
}
