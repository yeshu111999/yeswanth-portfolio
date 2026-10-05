'use client';

import { motion } from 'framer-motion';
import { useStepper } from './useStepper';

const steps = [
  { k: 'Mint', d: 'SPL token created' },
  { k: 'Metadata', d: 'Metaplex' },
  { k: 'Pool', d: 'Raydium liquidity' },
  { k: 'Live', d: 'Tradable on Solana' },
];

/** A token moves through mint → metadata → pool → live, and its chart lifts off. */
export function LaunchpadVisual() {
  const [ref, step] = useStepper<HTMLDivElement>([1000, 1000, 1000, 2400]);
  return (
    <div ref={ref} className="flex h-full w-full items-center gap-6 px-6">
      <div className="relative grid h-24 w-24 flex-none place-items-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-gold/20 blur-xl"
          animate={{ scale: step === 3 ? 1.4 : 1, opacity: step === 3 ? 1 : 0.5 }}
        />
        <motion.div
          animate={{ y: step === 3 ? -6 : 0, scale: step >= 1 ? 1 : 0.85 }}
          className="relative grid h-20 w-20 place-items-center rounded-full border-2 border-gold-300/70 bg-gradient-to-br from-gold-300 via-gold to-gold-600 font-display text-lg font-bold text-ink shadow-[0_0_40px_rgba(212,180,131,0.6)]"
        >
          $TKN
        </motion.div>
      </div>
      <div className="flex-1">
        <ol className="flex flex-col gap-1.5">
          {steps.map((s, i) => (
            <li key={s.k} className="flex items-center gap-3">
              <span
                className={`grid h-5 w-5 flex-none place-items-center rounded-full border text-[10px] font-bold transition-all duration-500 ${
                  step >= i ? 'border-gold bg-gold text-ink shadow-[0_0_12px_rgba(212,180,131,0.8)]' : 'border-white/20 text-white/55'
                }`}
              >
                {step >= i ? '✓' : i + 1}
              </span>
              <span className={`text-xs transition-colors ${step >= i ? 'text-white' : 'text-mist/65'}`}>{s.k}</span>
              <span className="text-[10px] text-mist/65">{s.d}</span>
            </li>
          ))}
        </ol>
        <svg viewBox="0 0 200 40" className="mt-3 h-10 w-full" aria-hidden>
          <motion.path
            d="M0 36 L40 34 L70 30 L100 31 L130 20 L160 14 L200 4"
            fill="none"
            stroke="#D4B483"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: step === 3 ? 1 : 0 }}
            transition={{ duration: 1.2 }}
            style={{ filter: 'drop-shadow(0 0 4px #D4B483)' }}
          />
        </svg>
      </div>
    </div>
  );
}
