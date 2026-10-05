'use client';

/** Lets 3D scenes (which have no DOM hover target) tell the custom cursor to grow. */
export type CursorState = 'default' | 'hover' | 'drag';

const EVENT = 'app:cursor';

export function setCursor(state: CursorState) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<CursorState>(EVENT, { detail: state }));
}

export function onCursor(fn: (s: CursorState) => void) {
  const handler = (e: Event) => fn((e as CustomEvent<CursorState>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
