'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/lib/hooks';
import { useRef, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { scrollToHash } from '@/lib/scroll';

type Props = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  size?: 'md' | 'lg';
  className?: string;
  download?: boolean;
  ariaLabel?: string;
};

/** A link that leans toward the pointer. In-page hashes use smooth scroll. */
export function MagneticButton({ href, children, variant = 'primary', size = 'md', className = '', download, ariaLabel }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduced = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });
  const ix = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });
  const iy = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });

  const onMove = (e: PointerEvent) => {
    if (reduced || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * 0.35);
    y.set(dy * 0.45);
    ix.set(dx * 0.15);
    iy.set(dy * 0.2);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
    ix.set(0);
    iy.set(0);
  };
  const external = /^https?:\/\//.test(href) || href.endsWith('.pdf');
  const onClick = (e: MouseEvent) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      scrollToHash(href);
    }
  };

  const base =
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-tight transition-colors duration-300';
  const sizes = size === 'lg' ? 'h-16 px-8 text-base md:text-lg' : 'h-12 px-6 text-sm md:text-[15px]';
  const variants =
    variant === 'primary'
      ? 'bg-gradient-to-b from-gold-300 to-gold text-ink shadow-[0_0_40px_-8px_rgba(212,180,131,0.7)] hover:from-gold hover:to-gold-600'
      : 'glass text-white hover:border-gold/60';

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x, y }}
      className={`${base} ${sizes} ${variants} ${className}`}
      download={download || undefined}
      target={external && !href.startsWith('mailto:') ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={ariaLabel}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <motion.span style={{ x: ix, y: iy }} className="relative flex items-center gap-2">
        {children}
      </motion.span>
    </motion.a>
  );
}
