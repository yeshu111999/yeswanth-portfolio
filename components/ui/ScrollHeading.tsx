'use client';

import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useReducedMotion } from '@/lib/hooks';
import { useRef } from 'react';

/** Section heading whose words rise into place as the section scrolls in (scroll-linked, not time-based). */
export function ScrollHeading({ eyebrow, title, sub, align = 'left', id }: {
  eyebrow: string;
  title: string;
  sub?: string;
  align?: 'left' | 'center';
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 95%', 'start 45%'] });
  const words = title.split(' ');
  const eyebrowX = useTransform(scrollYProgress, [0, 1], [-24, 0]);
  const subOpacity = useTransform(scrollYProgress, [0.5, 1], [0, 1]);

  return (
    <div ref={ref} className={align === 'center' ? 'text-center' : ''}>
      <motion.p
        className="eyebrow mb-4"
        style={reduced ? undefined : { opacity: scrollYProgress, x: eyebrowX }}
      >
        {eyebrow}
      </motion.p>
      <h2 id={id} className="section-title">
        {words.map((w, i) => (
          <Word key={i} progress={scrollYProgress} index={i} total={words.length} reduced={!!reduced}>
            {w}
          </Word>
        ))}
      </h2>
      {sub && (
        <motion.p
          className={`mt-5 max-w-xl text-base text-mist/80 md:text-lg ${align === 'center' ? 'mx-auto' : ''}`}
          style={reduced ? undefined : { opacity: subOpacity }}
        >
          {sub}
        </motion.p>
      )}
    </div>
  );
}

function Word({ children, progress, index, total, reduced }: {
  children: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
  reduced: boolean;
}) {
  const start = (index / total) * 0.5;
  const y = useTransform(progress, [start, start + 0.5], ['105%', '0%']);
  const rotate = useTransform(progress, [start, start + 0.5], [8, 0]);
  return (
    <span className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-bottom last:mr-0">
      <motion.span className="inline-block origin-bottom-left" style={reduced ? undefined : { y, rotate }}>
        {children}
      </motion.span>
    </span>
  );
}
