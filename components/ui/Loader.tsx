'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { loader, site } from '@/data/content';
import { finishIntro, introMs } from '@/lib/intro';

/** 1.5s intro overlay. The hero sphere assembles from scattered particles behind it. */
export function Loader() {
  const [visible, setVisible] = useState(true);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisible(false);
      finishIntro();
      return;
    }
    document.documentElement.style.overflow = 'hidden';
    const duration = introMs();
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setPct(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(step);
      else {
        setVisible(false);
        document.documentElement.style.overflow = '';
        finishIntro();
      }
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[90] flex items-end justify-between bg-ink/70 p-6 backdrop-blur-[2px] md:p-10"
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] } }}
        >
          <div className="font-display text-sm uppercase tracking-[0.3em] text-mist/70">
            {site.initials} · {loader.label}
          </div>
          <div className="font-display text-[clamp(4rem,14vw,10rem)] font-semibold leading-none tabular-nums text-white/90">
            {pct}
            <span className="text-gold">%</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
