'use client';

import { useIsMobile, useReducedMotion } from '@/lib/hooks';
import dynamic from 'next/dynamic';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { hero, site } from '@/data/content';
import { LazyCanvas } from '@/components/three/LazyCanvas';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { Counter } from '@/components/ui/Counter';
import { onIntroDone } from '@/lib/intro';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });

const letterVariants = {
  hidden: { y: '110%', rotateX: -80, opacity: 0 },
  show: (i: number) => ({
    y: '0%',
    rotateX: 0,
    opacity: 1,
    transition: { delay: 0.04 * i, duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  }),
};

/** Interpolates a per-letter color so gradients survive per-letter transforms. */
function gradientAt(stops: string[], t: number) {
  const seg = Math.min(stops.length - 2, Math.floor(t * (stops.length - 1)));
  const local = t * (stops.length - 1) - seg;
  const a = parseInt(stops[seg].slice(1), 16);
  const b = parseInt(stops[seg + 1].slice(1), 16);
  const mix = (sh: number) => Math.round(((a >> sh) & 255) * (1 - local) + ((b >> sh) & 255) * local);
  return `rgb(${mix(16)}, ${mix(8)}, ${mix(0)})`;
}

function SplitWord({ word, offset, ready, gradient }: { word: string; offset: number; ready: boolean; gradient?: string[] }) {
  return (
    <span className="block overflow-hidden pb-[0.06em] [perspective:600px]" aria-hidden>
      {word.split('').map((ch, i) => (
        <motion.span
          key={i}
          custom={offset + i}
          variants={letterVariants}
          initial="hidden"
          animate={ready ? 'show' : 'hidden'}
          className="inline-block origin-bottom will-change-transform"
          style={gradient ? { color: gradientAt(gradient, i / Math.max(1, word.length - 1)) } : undefined}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

/** Stat cards positioned around the sphere with depth; they parallax with the pointer. */
const statPositions = [
  'md:left-[60%] md:top-[15%]',
  'md:right-[3%] md:top-[34%]',
  'md:left-[57%] md:bottom-[20%]',
  'md:right-[7%] md:bottom-[9%]',
];
const statDepth = [60, 120, 90, 40];

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const mobile = useIsMobile();
  const reduced = !!useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => onIntroDone(() => setReady(true)), []);

  // Scroll through the pinned hero morphs the particle sphere: sphere → knot → wave.
  useEffect(() => {
    if (!section.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progress.current = self.progress;
      },
    });
    return () => st.kill();
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const textY = useTransform(scrollYProgress, [0, 0.45], ['0%', '-30%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const statsOpacity = useTransform(scrollYProgress, [0.05, 0.3], [1, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });
  const onMove = (e: React.PointerEvent) => {
    if (reduced || mobile) return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  const showContent = ready || reduced;

  return (
    <section
      id="top"
      ref={section}
      aria-label="Introduction"
      className="relative h-[220vh]"
      onPointerMove={onMove}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_45%,rgba(176,141,87,0.22),transparent_60%)]" />
        <LazyCanvas
          className="absolute inset-0"
          camera={{ position: [0, 0, 6.5], fov: 45 }}
          eventSource={section as React.MutableRefObject<HTMLElement>}
          eventPrefix="client"
          mountMargin="0px"
        >
          <HeroScene progress={progress} mobile={mobile} reduced={reduced} />
        </LazyCanvas>

        <motion.div
          style={reduced ? undefined : { y: textY, opacity: textOpacity }}
          className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-5 pt-16 md:px-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="glass mb-6 inline-flex w-fit items-center gap-2.5 rounded-full px-4 py-2 text-xs text-mist md:text-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping2 rounded-full bg-[#2EE6A0]" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#2EE6A0] shadow-[0_0_10px_#2EE6A0]" />
            </span>
            {hero.status}
          </motion.div>

          <h1 className="font-display text-[clamp(3.4rem,13vw,6rem)] md:text-[clamp(4rem,8.6vw,8.8rem)] font-semibold leading-[0.86] tracking-[-0.045em] text-white">
            <span className="sr-only">{site.name}</span>
            <SplitWord word={site.firstName} offset={0} ready={showContent} />
            <SplitWord word={site.lastName} offset={site.firstName.length} ready={showContent} gradient={['#FFFFFF', '#E6D3AE', '#D4B483']} />
          </h1>

          {/* Painted immediately (no fade) so it counts as the page's first meaningful content */}
          <p className="mt-6 max-w-xl text-lg leading-snug text-mist md:text-2xl">{hero.tagline}</p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={showContent ? { opacity: 1 } : {}}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-4 font-mono text-xs tracking-wider text-gold/90 md:text-sm"
          >
            {hero.stack.join(' | ')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.85, duration: 0.8 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <MagneticButton href={hero.primaryCta.href}>
              {hero.primaryCta.label}
              <Arrow />
            </MagneticButton>
            <MagneticButton href={hero.secondaryCta.href} variant="ghost">
              {hero.secondaryCta.label}
            </MagneticButton>
          </motion.div>

          {/* Mobile: compact stat grid under the CTAs */}
          <ul className="mt-8 grid grid-cols-2 gap-2 md:hidden">
            {hero.stats.map((s, i) => (
              <li key={s.label} className="glass rounded-2xl p-3">
                <div className="font-display text-2xl font-semibold text-white">
                  <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} delay={0.2 + i * 0.1} />
                </div>
                <div className="mt-0.5 text-[11px] leading-tight text-mist/70">{s.label}</div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Desktop: stats floating in depth around the sphere */}
        <motion.ul
          style={reduced ? undefined : { opacity: statsOpacity }}
          className="pointer-events-none absolute inset-0 z-10 hidden [perspective:1200px] md:block"
        >
          {hero.stats.map((s, i) => (
            <FloatingStat key={s.label} index={i} mx={mx} my={my} ready={showContent} className={statPositions[i]} depth={statDepth[i]}>
              <div className="font-display text-3xl font-semibold text-white lg:text-4xl">
                <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} delay={0.9 + i * 0.15} />
              </div>
              <div className="mt-1 max-w-[11rem] text-xs leading-snug text-mist/75">{s.label}</div>
            </FloatingStat>
          ))}
        </motion.ul>

        <motion.div
          style={reduced ? undefined : { opacity: hintOpacity }}
          className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-mist/65 md:flex"
          aria-hidden
        >
          {hero.scrollHint}
          <span className="relative h-10 w-px overflow-hidden bg-white/10">
            <motion.span
              className="absolute left-0 top-0 h-4 w-px bg-gold"
              animate={reduced ? {} : { y: [-16, 40] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            />
          </span>
        </motion.div>
      </div>
    </section>
  );
}

function FloatingStat({ children, index, mx, my, ready, className, depth }: {
  children: React.ReactNode;
  index: number;
  mx: ReturnType<typeof useSpring>;
  my: ReturnType<typeof useSpring>;
  ready: boolean;
  className: string;
  depth: number;
}) {
  const x = useTransform(mx, (v) => v * -depth);
  const y = useTransform(my, (v) => v * -depth * 0.7);
  const rotateY = useTransform(mx, (v) => v * 18);
  const rotateX = useTransform(my, (v) => v * -14);
  return (
    <motion.li
      initial={{ opacity: 0, scale: 0.8, z: -200 }}
      animate={ready ? { opacity: 1, scale: 1, z: depth } : {}}
      transition={{ delay: 1 + index * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      style={{ x, y, rotateX, rotateY }}
      className={`glass absolute rounded-2xl px-5 py-4 [transform-style:preserve-3d] ${className}`}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 5 + index, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </motion.li>
  );
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="transition-transform group-hover:translate-x-0.5">
      <path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
