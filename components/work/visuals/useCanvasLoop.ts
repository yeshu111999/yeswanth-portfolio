'use client';

import { useEffect, useRef } from 'react';

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

/** rAF canvas loop that only runs while visible; draws one static frame under reduced motion. */
export function useCanvasLoop(draw: Draw) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let visible = false;
    let w = 0;
    let h = 0;
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced || !visible) drawRef.current(ctx, w, h, 4);
    };
    const frame = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      drawRef.current(ctx, w, h, (now - start) / 1000);
      if (visible && !reduced) raf = requestAnimationFrame(frame);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);
    resize();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return ref;
}
