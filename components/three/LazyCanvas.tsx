'use client';

import dynamic from 'next/dynamic';
import type { CanvasProps } from '@react-three/fiber';
import { useEffect, useRef, useState, type ReactNode } from 'react';

// Loaded on demand so three.js stays out of the initial bundle.
const Canvas = dynamic(() => import('@react-three/fiber').then((m) => m.Canvas), { ssr: false });

type Props = Omit<CanvasProps, 'children'> & {
  children: ReactNode;
  className?: string;
  /** How far ahead of the viewport to mount the scene. */
  mountMargin?: string;
  fallback?: ReactNode;
  /** Set false when the scene renders focusable DOM (e.g. drei <Html> buttons). */
  decorative?: boolean;
};

/**
 * Mounts a WebGL canvas only when it approaches the viewport, and stops
 * its render loop whenever it scrolls offscreen. DPR is capped at 2.
 */
export function LazyCanvas({ children, className, mountMargin = '300px', fallback, decorative = true, ...canvasProps }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setMounted(true), { rootMargin: mountMargin });
    const vis = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '50px' });
    near.observe(el);
    vis.observe(el);
    return () => {
      near.disconnect();
      vis.disconnect();
    };
  }, [mountMargin]);

  return (
    <div ref={ref} className={className} aria-hidden={decorative || undefined}>
      {mounted ? (
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
          frameloop={visible ? 'always' : 'never'}
          {...canvasProps}
        >
          {children}
        </Canvas>
      ) : (
        fallback
      )}
    </div>
  );
}
