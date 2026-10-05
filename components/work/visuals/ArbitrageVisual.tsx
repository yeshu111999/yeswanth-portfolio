'use client';

import { motion } from 'framer-motion';
import { useStepper } from './useStepper';

// Illustrative quotes for the animation only.
const frames = [
  [100.0, 100.02, 99.99],
  [100.04, 100.01, 99.71],
  [100.04, 100.01, 99.71],
  [100.03, 100.02, 100.0],
];
const venues = ['Binance', 'Alpaca', 'Jupiter'];

/** Three venues tick; a spread opens, gets flagged, and closes. */
export function ArbitrageVisual() {
  const [ref, step] = useStepper<HTMLDivElement>([1400, 900, 2000, 1400]);
  const q = frames[step];
  const lo = Math.min(...q);
  const hi = Math.max(...q);
  const spread = ((hi - lo) / lo) * 100;
  const flagged = step === 2;
  return (
    <div ref={ref} className="flex h-full w-full flex-col justify-center gap-3 px-6 font-mono">
      <div className="grid grid-cols-3 gap-3">
        {venues.map((v, i) => {
          const isLo = flagged && q[i] === lo;
          const isHi = flagged && q[i] === hi;
          return (
            <div
              key={v}
              className={`rounded-xl border p-3 transition-all duration-500 ${
                isLo ? 'border-[#2EE6A0]/60 bg-[#2EE6A0]/10' : isHi ? 'border-gold/60 bg-gold/10' : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <div className="text-[10px] uppercase tracking-widest text-mist/65">{v}</div>
              <motion.div key={`${step}-${i}`} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-lg text-white">
                {q[i].toFixed(2)}
              </motion.div>
              <div className="h-3 text-[10px]">
                {isLo && <span className="text-[#2EE6A0]">buy</span>}
                {isHi && <span className="text-gold">sell</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px]">
        <span className="text-mist/60">spread</span>
        <motion.span animate={{ color: flagged ? '#D4B483' : '#CFC8BC' }}>{spread.toFixed(2)}%</motion.span>
        <span className={flagged ? 'text-gold' : 'text-mist/65'}>{flagged ? 'opportunity flagged' : 'watching'}</span>
      </div>
    </div>
  );
}
