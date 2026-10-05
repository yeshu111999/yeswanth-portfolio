'use client';

import { useEffect, useRef, useState } from 'react';

/** Cycles through animation steps while the element is on screen. Reduced motion pins the final step. */
export function useStepper<T extends Element>(durations: number[]) {
  const ref = useRef<T>(null);
  const [step, setStep] = useState(0);
  const key = durations.join(',');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(durations.length - 1);
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    let current = 0;
    const run = () => {
      timer = setTimeout(() => {
        current = (current + 1) % durations.length;
        setStep(current);
        run();
      }, durations[current]);
    };
    const io = new IntersectionObserver(([e]) => {
      clearTimeout(timer);
      if (e.isIntersecting) run();
    });
    io.observe(el);
    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [ref, step] as const;
}
