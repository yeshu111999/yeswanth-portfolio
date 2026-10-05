'use client';

import { useEffect, useRef, useState } from 'react';
import { onCursor, type CursorState } from '@/lib/cursor';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]';

/** Dot + trailing ring. Grows and glows over links, buttons, and hovered 3D objects. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<CursorState>('default');
  const [domHover, setDomHover] = useState(false);
  const [label, setLabel] = useState('');

  useEffect(() => {
    const ok =
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!ok) return;
    setEnabled(true);
    document.documentElement.classList.add('has-custom-cursor');

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let raf = 0;
    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const target = (e.target as Element | null)?.closest?.(INTERACTIVE);
      setDomHover(!!target);
      setLabel(target?.getAttribute('data-cursor-label') ?? '');
    };
    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(loop);
    const off = onCursor(setState);
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
      off();
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, []);

  if (!enabled) return null;
  const big = state === 'hover' || domHover;
  const glow = state === 'hover';

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div ref={dot} className="absolute left-0 top-0">
        <div className="-ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-gold" />
      </div>
      <div ref={ring} className="absolute left-0 top-0">
        <div
          className="flex items-center justify-center rounded-full border transition-[width,height,margin,background-color,box-shadow,border-color] duration-300 ease-out"
          style={{
            width: big ? 64 : state === 'drag' ? 48 : 32,
            height: big ? 64 : state === 'drag' ? 48 : 32,
            marginLeft: big ? -32 : state === 'drag' ? -24 : -16,
            marginTop: big ? -32 : state === 'drag' ? -24 : -16,
            borderColor: glow ? 'rgba(212,180,131,0.9)' : 'rgba(230,211,174,0.6)',
            backgroundColor: glow ? 'rgba(212,180,131,0.12)' : big ? 'rgba(176,141,87,0.12)' : 'transparent',
            boxShadow: glow
              ? '0 0 30px 6px rgba(212,180,131,0.45)'
              : big
                ? '0 0 24px 2px rgba(176,141,87,0.45)'
                : 'none',
          }}
        >
          {label && <span className="text-[10px] font-semibold uppercase tracking-widest text-white">{label}</span>}
        </div>
      </div>
    </div>
  );
}
