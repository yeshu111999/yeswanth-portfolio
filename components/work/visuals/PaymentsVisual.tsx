'use client';

import { motion } from 'framer-motion';
import { useStepper } from './useStepper';

const checkpoints = ['HMAC sign', 'Hosted checkout', 'Webhook', 'Reconcile'];

/** A card moving across a tilted floor of signed checkpoints. */
export function PaymentsVisual() {
  const [ref, step] = useStepper<HTMLDivElement>([1100, 1100, 1100, 1100, 1400]);
  return (
    <div ref={ref} className="relative flex h-full w-full items-center justify-center overflow-hidden [perspective:700px]">
      <div className="relative h-[70%] w-[88%] [transform:rotateX(52deg)_rotateZ(-8deg)] [transform-style:preserve-3d]">
        <div className="absolute inset-0 rounded-2xl border border-white/10 bg-[linear-gradient(rgba(176,141,87,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(176,141,87,0.12)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-[6%] right-[6%] top-1/2 h-[2px] -translate-y-1/2 bg-white/10" />
        <motion.div
          className="absolute left-[6%] top-1/2 h-[2px] -translate-y-1/2 bg-gold shadow-[0_0_12px_#D4B483]"
          animate={{ width: `${Math.min(step, 3) * 29.3}%` }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        />
        {checkpoints.map((c, i) => {
          const passed = step >= i;
          return (
            <div key={c} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${6 + i * 29.3}%` }}>
              <div
                className={`grid h-9 w-9 place-items-center rounded-full border-2 text-[10px] font-bold transition-all duration-500 ${
                  passed ? 'border-gold bg-gold/20 text-gold shadow-[0_0_24px_#D4B483]' : 'border-white/20 text-white/55'
                }`}
              >
                {passed ? '✓' : i + 1}
              </div>
              <div className="absolute left-1/2 top-11 -translate-x-1/2 whitespace-nowrap text-[10px] text-mist/80">{c}</div>
            </div>
          );
        })}
        <motion.div
          className="absolute top-1/2 h-10 w-16 -translate-x-1/2 rounded-md border border-white/30 bg-gradient-to-br from-bronze-300 to-bronze shadow-[0_10px_30px_rgba(176,141,87,0.6)]"
          animate={{ left: `${6 + Math.min(step, 3) * 29.3}%`, y: '-140%', rotateX: -52 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          <div className="ml-2 mt-2 h-2 w-3 rounded-sm bg-gold/80" />
          <div className="ml-2 mt-2 h-0.5 w-9 bg-white/50" />
        </motion.div>
      </div>
      <div className="absolute right-4 top-4 font-mono text-[10px] text-mist/60">
        {step >= 4 ? <span className="text-[#2EE6A0]">idempotent · reconciled</span> : 'sha256=9f2c…e41a'}
      </div>
    </div>
  );
}
