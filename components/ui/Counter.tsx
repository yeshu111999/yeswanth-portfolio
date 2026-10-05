'use client';

import { animate, useInView } from 'framer-motion';
import { useReducedMotion } from '@/lib/hooks';
import { useEffect, useRef, useState } from 'react';

/** Counts up from 0 the first time it scrolls into view. */
export function Counter({ value, prefix = '', suffix = '', duration = 2, delay = 0 }: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setN(value);
      return;
    }
    const c = animate(0, value, { duration, delay, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, value, duration, delay, reduced]);

  return (
    <span ref={ref} className="tabular-nums">
      <span className="sr-only">{`${prefix}${value.toLocaleString('en-US')}${suffix}`}</span>
      <span aria-hidden>
        {prefix}
        {n.toLocaleString('en-US')}
        {suffix}
      </span>
    </span>
  );
}
