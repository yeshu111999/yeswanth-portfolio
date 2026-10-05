'use client';

import { motion } from 'framer-motion';
import { useStepper } from './useStepper';

const macros = [
  { k: 'Protein', v: '42g', c: '#9FC9B8' },
  { k: 'Carbs', v: '58g', c: '#D4B483' },
  { k: 'Fat', v: '18g', c: '#E6D3AE' },
];

/** A phone scans a meal photo; the plate dissolves into macro numbers. */
export function FitnessVisual() {
  const [ref, step] = useStepper<HTMLDivElement>([1400, 1600, 2600]);
  return (
    <div ref={ref} className="flex h-full w-full items-center justify-center [perspective:900px]">
      <motion.div
        animate={{ rotateY: [-18, -10, -18], rotateX: [8, 4, 8] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        className="relative h-[88%] aspect-[9/17] rounded-[1.6rem] border border-white/20 bg-[#111111] p-1.5 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.9)]"
      >
        <div className="relative h-full w-full overflow-hidden rounded-[1.3rem] bg-ink-900">
          <div className="absolute left-1/2 top-[30%] w-[85%] -translate-x-1/2 -translate-y-1/2">
          <motion.svg
            viewBox="0 0 100 100"
            className="w-full"
            animate={{ scale: step === 2 ? 0.55 : 1, y: step === 2 ? -18 : 0, opacity: step === 2 ? 0.6 : 1 }}
            aria-hidden
          >
            <circle cx="50" cy="50" r="46" fill="#e8ecf5" />
            <circle cx="50" cy="50" r="36" fill="#f5f7fb" />
            <ellipse cx="40" cy="44" rx="16" ry="11" fill="#c98a4a" />
            <circle cx="62" cy="58" r="10" fill="#4caf6e" />
            <circle cx="55" cy="38" r="7" fill="#f2c14e" />
            <circle cx="66" cy="44" r="5" fill="#e0564f" />
          </motion.svg>
          </div>
          {step === 1 && (
            <motion.div
              className="absolute inset-x-0 h-0.5 bg-[#2EE6A0] shadow-[0_0_16px_#2EE6A0]"
              initial={{ top: '5%' }}
              animate={{ top: '58%' }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            />
          )}
          <div className="absolute inset-x-2 bottom-3 space-y-1.5">
            <motion.div animate={{ opacity: step === 2 ? 1 : 0, y: step === 2 ? 0 : 8 }} className="text-center font-display text-xl font-bold text-white">
              620 <span className="text-[10px] font-normal text-mist/60">kcal</span>
            </motion.div>
            {macros.map((m, i) => (
              <motion.div
                key={m.k}
                animate={{ opacity: step === 2 ? 1 : 0, x: step === 2 ? 0 : -10 }}
                transition={{ delay: 0.1 + i * 0.12 }}
                className="flex items-center justify-between rounded-md bg-white/5 px-2 py-1 text-[10px]"
              >
                <span className="text-mist/70">{m.k}</span>
                <span className="font-semibold" style={{ color: m.c }}>
                  {m.v}
                </span>
              </motion.div>
            ))}
            <motion.div animate={{ opacity: step === 0 ? 1 : 0 }} className="text-center text-[10px] uppercase tracking-widest text-mist/65">
              tap to scan
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
