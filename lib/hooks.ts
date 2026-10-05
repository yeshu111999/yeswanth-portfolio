'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

export function useMediaQuery(query: string, initial = false) {
  const [matches, setMatches] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/** Phones, small tablets, and touch-first devices get the lighter 3D path. */
export const useIsMobile = () => useMediaQuery('(max-width: 767px), (pointer: coarse)');

/** Hydration-safe: false on the server and first client render, then the real preference. */
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/** Tracks whether an element is within (or near) the viewport. */
export function useInView<T extends Element>(rootMargin = '0px'): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return [ref, inView];
}

/** Becomes true once the element has come near the viewport, then stays true. */
export function useOnceInView<T extends Element>(rootMargin = '200px'): [RefObject<T>, boolean] {
  const [ref, inView] = useInView<T>(rootMargin);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inView) setSeen(true);
  }, [inView]);
  return [ref, seen];
}
