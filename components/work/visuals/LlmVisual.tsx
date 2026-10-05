'use client';

import { motion } from 'framer-motion';
import { useStepper } from './useStepper';

const providers = ['Model A', 'Model B', 'Model C'];
const answer = 'Streaming tokens back through the fallback provider, quota checked, usage billed.'.split(' ');

/**
 * Steps: 0 request → A, 1 A fails, 2 reroute → B, 3 B streams tokens, 4 done.
 */
export function LlmVisual() {
  const [ref, step] = useStepper<HTMLDivElement>([900, 900, 800, 3200, 1600]);
  const target = step >= 2 ? 1 : 0;
  const failed = step >= 1;
  const streaming = step >= 3;

  return (
    <div ref={ref} className="relative flex h-full w-full flex-col justify-between gap-4 p-5 font-mono text-[11px] md:p-6">
      <div className="relative flex items-center gap-4">
        <div className="glass z-10 flex-none rounded-xl px-3 py-2 text-mist">
          <div className="text-[10px] uppercase tracking-widest text-mist/65">user</div>
          prompt →
        </div>
        <div className="relative flex flex-1 flex-col gap-2">
          {providers.map((p, i) => {
            const isFail = i === 0 && failed;
            const isActive = i === target && !isFail;
            return (
              <div
                key={p}
                className={`relative flex items-center justify-between rounded-lg border px-3 py-1.5 transition-all duration-500 ${
                  isFail
                    ? 'border-red-500/50 bg-red-500/10 text-red-300'
                    : isActive
                      ? 'border-gold/60 bg-gold/10 text-white shadow-[0_0_24px_-4px_rgba(212,180,131,0.6)]'
                      : 'border-white/10 bg-white/[0.03] text-mist/60'
                }`}
              >
                <span>{p}</span>
                <span className="text-[10px]">{isFail ? '503 · fallback' : isActive ? (streaming ? 'streaming' : 'routing…') : 'standby'}</span>
              </div>
            );
          })}
          <motion.span
            aria-hidden
            className="absolute -left-3 h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_12px_#D4B483]"
            animate={{ top: target === 0 ? 10 : 46, x: step === 1 ? [0, -6, 0] : 0, opacity: step >= 3 ? 0 : 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
          />
        </div>
      </div>
      <div className="glass min-h-[86px] rounded-xl p-3 text-[12px] leading-relaxed text-mist">
        <span className="text-bronze-300">assistant ▸ </span>
        {streaming &&
          answer.map((w, i) => (
            <motion.span key={`${step}-${i}`} initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ delay: i * 0.18 }}>
              {w}{' '}
            </motion.span>
          ))}
        <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-gold" />
      </div>
    </div>
  );
}
