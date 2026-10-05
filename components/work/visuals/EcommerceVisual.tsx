'use client';

import { motion } from 'framer-motion';
import { useStepper } from './useStepper';

const hues = ['#B08D57', '#D4B483', '#9FC9B8', '#C99A86', '#E6D3AE', '#B87333'];

/** Storefront tiles flip in, while the admin panel tallies orders. */
export function EcommerceVisual() {
  const [ref, step] = useStepper<HTMLDivElement>([700, 700, 700, 700, 700, 700, 1500]);
  return (
    <div ref={ref} className="flex h-full w-full gap-3 p-5 [perspective:800px]">
      <div className="grid flex-1 grid-cols-3 gap-2">
        {hues.map((c, i) => (
          <motion.div
            key={i}
            animate={{ rotateY: step > i ? 0 : 90, opacity: step > i ? 1 : 0.2 }}
            transition={{ duration: 0.5 }}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-1.5"
          >
            <div className="aspect-square rounded-md" style={{ background: `linear-gradient(135deg, ${c}, ${c}33)` }} />
            <div className="mt-1.5 h-1 w-3/4 rounded bg-white/30" />
            <div className="mt-1 h-1 w-1/3 rounded bg-gold/70" />
          </motion.div>
        ))}
      </div>
      <div className="glass flex w-[38%] flex-col gap-1.5 rounded-xl p-2.5 font-mono text-[10px] text-mist/70">
        <div className="mb-1 text-[10px] uppercase tracking-widest text-mist/65">admin · orders</div>
        {hues.map((c, i) => (
          <motion.div key={i} animate={{ opacity: step > i ? 1 : 0.15, x: step > i ? 0 : 8 }} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
            <span className="h-1 flex-1 rounded bg-white/15" />
            <span className="text-[#2EE6A0]">paid</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
