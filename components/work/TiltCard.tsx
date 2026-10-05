'use client';

import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/lib/hooks';
import { useRef, type ReactNode } from 'react';

/** Card that tilts toward the pointer with a moving glare; enters with a scroll-linked rise. */
export function TiltCard({ children, className = '', accent, id, clip = true }: { children: ReactNode; className?: string; accent: string; id?: string; /** false lets popovers escape the card */ clip?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(500px circle at ${gx}% ${gy}%, ${accent}33, transparent 45%)`;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 65%'] });
  const enterY = useTransform(scrollYProgress, [0, 1], [90, 0]);
  const enterRot = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const enterOpacity = useTransform(scrollYProgress, [0, 0.7], [0, 1]);

  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 12);
    rx.set((0.5 - py) * 10);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div style={reduced ? undefined : { y: enterY, rotateX: enterRot, opacity: enterOpacity }} className={`relative [perspective:1200px] focus-within:z-20 hover:z-20 ${className}`}>
      <motion.article
        id={id}
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className={`group relative h-full scroll-mt-28 ${clip ? 'overflow-hidden' : ''} rounded-3xl border border-white/10 bg-ink-700/60 transition-colors duration-500 hover:border-white/20`}
      >
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-20 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: glare }} />
        {children}
      </motion.article>
    </motion.div>
  );
}
