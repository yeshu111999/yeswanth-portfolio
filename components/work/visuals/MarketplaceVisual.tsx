'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/hooks';

/** A creator hub with 12 connected social platforms orbiting it. */
export function MarketplaceVisual() {
  const reduced = useReducedMotion();
  const nodes = Array.from({ length: 12 });
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden [perspective:600px]">
      <div className="relative h-48 w-48 [transform:rotateX(58deg)] [transform-style:preserve-3d]">
        <div className="absolute inset-0 rounded-full border border-white/10" />
        <div className="absolute inset-6 rounded-full border border-dashed border-bronze/30" />
        <motion.div
          className="absolute inset-0"
          animate={reduced ? {} : { rotate: 360 }}
          transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
        >
          {nodes.map((_, i) => {
            const a = (i / nodes.length) * Math.PI * 2;
            return (
              <span
                key={i}
                className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: `${50 + Math.cos(a) * 50}%`,
                  top: `${50 + Math.sin(a) * 50}%`,
                  background: i % 3 === 0 ? '#D4B483' : '#C99A86',
                  boxShadow: `0 0 12px ${i % 3 === 0 ? '#D4B483' : '#C99A86'}`,
                }}
              />
            );
          })}
        </motion.div>
      </div>
      <div className="absolute grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#C99A86] to-bronze font-display text-lg font-bold text-white shadow-[0_0_40px_rgba(201,154,134,0.6)]">
        12
      </div>
      <motion.div
        className="glass absolute bottom-4 left-4 rounded-2xl rounded-bl-sm px-3 py-2 text-[11px] text-mist"
        animate={reduced ? {} : { y: [6, 0, 0, 6], opacity: [0, 1, 1, 0] }}
        transition={{ repeat: Infinity, duration: 4, times: [0, 0.15, 0.85, 1] }}
      >
        AI: your reach grew this week ✦
      </motion.div>
    </div>
  );
}
