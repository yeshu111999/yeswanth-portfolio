'use client';

import type Lenis from 'lenis';

let lenis: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  lenis = l;
};

export function scrollToHash(hash: string) {
  const el = document.querySelector(hash);
  if (!el) return;
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.6 });
  else el.scrollIntoView({ behavior: 'smooth' });
  history.replaceState(null, '', hash);
}

export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 1.4 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}

export function lockScroll() {
  lenis?.stop();
  document.documentElement.style.overflow = 'hidden';
}

export function unlockScroll() {
  lenis?.start();
  document.documentElement.style.overflow = '';
}
