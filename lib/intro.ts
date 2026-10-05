'use client';

/** Signals that the page-load intro finished, so hero text can animate in. */
const EVENT = 'app:intro-done';
let done = false;

export const INTRO_MS = 1500;
/** Phones get a quicker intro so the headline appears sooner. */
export const introMs = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches ? 900 : INTRO_MS;

export function finishIntro() {
  done = true;
  window.dispatchEvent(new Event(EVENT));
}

export function onIntroDone(fn: () => void) {
  if (done) {
    fn();
    return () => {};
  }
  window.addEventListener(EVENT, fn, { once: true });
  return () => window.removeEventListener(EVENT, fn);
}
