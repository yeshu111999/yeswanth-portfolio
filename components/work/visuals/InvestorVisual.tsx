'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useMemo, useRef } from 'react';

/** Portfolio curve drawing itself over a commit-activity grid. */
export function InvestorVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-10%' });
  const cells = useMemo(() => Array.from({ length: 7 * 22 }, (_, i) => ((i * 9301 + 49297) % 233280) / 233280), []);
  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden p-5">
      <div className="grid h-full grid-flow-col grid-rows-7 gap-[3px] opacity-70">
        {cells.map((v, i) => (
          <motion.span
            key={i}
            className="rounded-[2px]"
            initial={{ opacity: 0.08 }}
            animate={inView ? { opacity: [0.08, 0.15 + v * 0.85, 0.15 + v * 0.85] } : {}}
            transition={{ delay: (i % 22) * 0.04, duration: 1.2 }}
            style={{ background: v > 0.75 ? '#D4B483' : '#B08D57' }}
          />
        ))}
      </div>
      <svg viewBox="0 0 300 120" preserveAspectRatio="none" className="absolute inset-5 h-[calc(100%-2.5rem)] w-[calc(100%-2.5rem)]" aria-hidden>
        <defs>
          <linearGradient id="inv" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#D4B483" stopOpacity="0.35" />
            <stop offset="1" stopColor="#D4B483" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0 100 C30 95 40 80 70 82 S110 60 140 62 S190 40 210 44 S260 18 300 12 L300 120 L0 120Z"
          fill="url(#inv)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1, duration: 1 }}
        />
        <motion.path
          d="M0 100 C30 95 40 80 70 82 S110 60 140 62 S190 40 210 44 S260 18 300 12"
          fill="none"
          stroke="#D4B483"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 2, ease: 'easeInOut' }}
          style={{ filter: 'drop-shadow(0 0 6px #D4B483)' }}
        />
      </svg>
    </div>
  );
}
