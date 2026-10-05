'use client';

import { useIsMobile, useReducedMotion } from '@/lib/hooks';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { clients, experience, site, type Client, type ExperienceStop } from '@/data/content';
import { ClientPanel } from '@/components/clients/ClientPanel';
import { LazyCanvas } from '@/components/three/LazyCanvas';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { ScrollHeading } from '@/components/ui/ScrollHeading';
import { scrollToHash, scrollToY } from '@/lib/scroll';
import { setCursor } from '@/lib/cursor';

const RouteScene = dynamic(() => import('./RouteScene'), { ssr: false });

const stops = experience.stops as ExperienceStop[];
const n = stops.length;
const branchFrom = stops.findIndex((s) => s.id === 'lusso');
const clientItems = clients.items as Client[];
const branches = clientItems.map((c) => ({ id: c.id, name: c.name, color: c.color }));
const kinds = stops.map((s) => s.kind);
const names = stops.map((s) => (s.kind === 'cta' ? 'Your team' : s.company));
/** Viewport heights of scroll per stop. */
const PER_STOP = 0.9;

export function Experience() {
  const reduced = useReducedMotion();
  return (
    <section id="experience" aria-labelledby="experience-title" className="relative">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-28 md:px-10 md:pt-40">
        <ScrollHeading id="experience-title" eyebrow={experience.eyebrow} title={experience.title} sub={reduced ? undefined : experience.hint} />
      </div>
      {reduced ? <StaticTimeline /> : <Route />}
    </section>
  );
}

function Route() {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState(-1);
  const [reached, setReached] = useState(-1);
  const railFill = useRef<HTMLSpanElement>(null);
  const mobile = useIsMobile();
  const [peek, setPeek] = useState<{ id: string; x: number; y: number } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const onClientHover = useCallback((id: string | null, x = 0, y = 0) => setPeek(id ? { id, x, y } : null), []);
  const onClientOpen = useCallback((id: string) => {
    setPeek(null);
    setOpenId(id);
  }, []);
  const closePanel = useCallback(() => setOpenId(null), []);
  const peekId = peek?.id ?? null;

  // The preview closes on any click, scroll, or Escape. The 3D scene only reports
  // "pointer out" when the pointer moves, so it can't be relied on alone.
  useEffect(() => {
    if (!peekId) return;
    const close = () => {
      setPeek(null);
      setCursor('default');
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('pointerdown', close, true);
    window.addEventListener('wheel', close, { passive: true });
    window.addEventListener('scroll', close, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', close, true);
      window.removeEventListener('wheel', close);
      window.removeEventListener('scroll', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [peekId]);
  const openClient = clientItems.find((c) => c.id === openId);

  useEffect(() => {
    if (!wrap.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progress.current = self.progress;
        // A stop's card shows while the camera is near it.
        const f = self.progress * n - 0.5;
        const k = Math.round(f);
        setActive(Math.abs(f - k) < 0.38 && k >= 0 && k < n ? k : -1);
        setReached(Math.min(n - 1, Math.floor(f + 0.38)));
        if (railFill.current) railFill.current.style.transform = `scaleY(${Math.min(1, Math.max(0, f / (n - 1)))})`;
      },
    });
    return () => st.kill();
  }, []);

  const jumpTo = (k: number) => {
    const el = wrap.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    const y = top + range * ((k + 0.5) / n);
    scrollToY(y);
  };

  const stop = active >= 0 ? stops[active] : null;
  const activeOrPassed = Math.max(active, reached);

  return (
    <div ref={wrap} style={{ height: `${n * PER_STOP * 100 + 100}vh` }} className="relative">
      <div
        className="sticky top-0 h-[100svh] overflow-hidden"
        onPointerMove={(e) => peek && setPeek({ ...peek, x: e.clientX, y: e.clientY })}
        onPointerLeave={() => setPeek(null)}
      >
        <LazyCanvas className="absolute inset-0" decorative={false} camera={{ position: [0, 4, 14], fov: mobile ? 60 : 50 }}>
          <RouteScene
            progress={progress}
            kinds={kinds}
            names={names}
            branchFrom={branchFrom}
            branches={branches}
            mobile={mobile}
            onClientHover={onClientHover}
            onClientOpen={onClientOpen}
            hoveredClient={peekId}
          />
        </LazyCanvas>
        <AnimatePresence>{peek && <ClientPeek key={peek.id} peek={peek} />}</AnimatePresence>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[340px] bg-gradient-to-r from-ink/90 via-ink/50 to-transparent lg:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink to-transparent" />

        {/* Stop rail: progress along the route, doubles as keyboard navigation */}
        <nav className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 lg:left-10 lg:block" aria-label="Career stops">
          <div className="relative pl-7">
            <span className="absolute bottom-3 left-[7px] top-3 w-px bg-white/10" aria-hidden />
            <span
              ref={railFill}
              className="absolute left-[7px] top-3 w-px origin-top bg-gradient-to-b from-gold to-gold/40 shadow-[0_0_10px_#D4B483]"
              style={{ height: 'calc(100% - 1.5rem)', transform: 'scaleY(0)' }}
              aria-hidden
            />
            <ol className="flex flex-col gap-1">
              {stops.map((s, i) => {
                const isActive = active === i;
                const passed = activeOrPassed >= i;
                return (
                  <li key={s.id} className="relative">
                    <span
                      aria-hidden
                      className={`absolute -left-7 top-1/2 h-[15px] w-[15px] -translate-y-1/2 rounded-full border-2 transition-all duration-500 ${
                        isActive
                          ? 'scale-110 border-gold bg-gold shadow-[0_0_16px_#D4B483]'
                          : passed
                            ? 'border-gold/70 bg-ink'
                            : 'border-white/25 bg-ink'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => jumpTo(i)}
                      aria-current={isActive ? 'step' : undefined}
                      className={`group block w-56 rounded-2xl px-4 py-2.5 text-left transition-all duration-500 ${
                        isActive ? 'glass translate-x-1' : 'border border-transparent hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className="block font-mono text-[10px] tracking-[0.2em] text-mist/65">
                        {String(i + 1).padStart(2, '0')}
                        {s.dates ? ` · ${s.dates.split('–')[0].trim()}` : ''}
                      </span>
                      <span
                        className={`block font-display font-semibold leading-tight tracking-tight transition-all duration-500 ${
                          isActive ? 'text-xl text-white' : passed ? 'text-base text-mist/90' : 'text-base text-mist/65 group-hover:text-mist'
                        }`}
                      >
                        {s.kind === 'cta' ? 'Your team' : s.company}
                      </span>
                      {isActive && s.kind !== 'cta' && <span className="mt-0.5 block text-xs text-gold/90">{s.role}</span>}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </nav>

        {/* Mobile / tablet: compact progress strip */}
        <div className="absolute inset-x-4 top-20 z-10 lg:hidden" aria-hidden>
          <div className="flex gap-1.5">
            {stops.map((s, i) => (
              <span key={s.id} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${activeOrPassed >= i ? 'bg-gold shadow-[0_0_8px_#D4B483]' : 'bg-white/15'}`} />
            ))}
          </div>
          {activeOrPassed >= 0 && (
            <p className="mt-2 font-display text-lg font-semibold text-white">
              <span className="mr-2 font-mono text-xs text-mist/65">{String(activeOrPassed + 1).padStart(2, '0')}</span>
              {stops[activeOrPassed].kind === 'cta' ? 'Your team' : stops[activeOrPassed].company}
            </p>
          )}
        </div>

        <div className="absolute inset-x-4 bottom-6 z-10 md:inset-x-auto md:bottom-auto md:right-10 md:top-1/2 md:w-[440px] md:-translate-y-1/2">
          <AnimatePresence mode="wait">
            {stop && <StopCard key={stop.id} stop={stop} index={active} />}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>{openClient && <ClientPanel key={openClient.id} client={openClient} onClose={closePanel} mobile={mobile} />}</AnimatePresence>
      {/* Full route for assistive tech */}
      <ol className="sr-only">
        {stops.map((s) => (
          <li key={s.id}>
            {s.role}, {s.company}, {s.location}
            {s.dates ? `, ${s.dates}` : ''}. {s.bullets.join(' ')}
          </li>
        ))}
      </ol>
    </div>
  );
}

function StopCard({ stop, index }: { stop: ExperienceStop; index: number }) {
  const isCta = stop.kind === 'cta';
  return (
    <motion.article
      initial={{ opacity: 0, y: 40, rotateX: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      exit={{ opacity: 0, y: -24, scale: 0.98, transition: { duration: 0.25 } }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-strong rounded-3xl p-5 md:p-7 ${isCta ? 'text-center' : ''}`}
      aria-hidden={!isCta}
    >
      {!isCta && (
        <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-mist/60">
          <span>Stop {String(index + 1).padStart(2, '0')}</span>
          {stop.dates && <span className="text-gold">{stop.dates}</span>}
        </div>
      )}
      {stop.kind === 'education' && (
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-gold/15 text-gold">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M2 9l10-5 10 5-10 5L2 9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M6 11v5c3 2 9 2 12 0v-5M22 9v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
      )}
      <h3 className={`font-display font-semibold leading-tight text-white ${isCta ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}`}>
        {isCta ? stop.company : stop.role}
      </h3>
      <p className="mt-1 text-sm text-mist/80 md:text-base">
        {isCta ? `${stop.role} · ${stop.location}` : `${stop.company} · ${stop.location}`}
      </p>
      {stop.bullets.length > 0 && (
        <ul className="mt-4 space-y-2.5">
          {stop.bullets.map((b, i) => (
            <motion.li
              key={b}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="flex gap-3 text-[13px] leading-snug text-mist md:text-sm"
            >
              <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-bronze shadow-[0_0_8px_#B08D57]" />
              {b}
            </motion.li>
          ))}
        </ul>
      )}
      {isCta && (
        <div className="pointer-events-auto mt-6 flex items-center justify-center gap-4">
          <Image src={site.photos.avatar} alt={site.photos.alt} width={56} height={56} className="h-14 w-14 rounded-full object-cover ring-2 ring-gold/70 shadow-[0_0_24px_rgba(212,180,131,0.5)]" />
          <MagneticButton href={experience.finalCta.href}>{experience.finalCta.label}</MagneticButton>
        </div>
      )}
    </motion.article>
  );
}

/** Reduced-motion fallback: a plain vertical route. */
function StaticTimeline() {
  return (
    <ol className="mx-auto max-w-3xl space-y-4 px-5 pb-24 md:px-10">
      {stops.map((s) => (
        <li key={s.id} className="glass rounded-3xl p-6">
          {s.dates && <p className="text-xs uppercase tracking-[0.2em] text-gold">{s.dates}</p>}
          <h3 className="mt-1 font-display text-2xl font-semibold text-white">{s.kind === 'cta' ? s.company : s.role}</h3>
          <p className="text-sm text-mist/80">
            {s.kind === 'cta' ? s.location : `${s.company} · ${s.location}`}
          </p>
          {s.bullets.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-mist">
              {s.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          {s.kind === 'cta' && (
            <a href={experience.finalCta.href} onClick={(e) => { e.preventDefault(); scrollToHash(experience.finalCta.href); }} className="mt-4 inline-block text-gold underline">
              {experience.finalCta.label}
            </a>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Hover preview for a client building in the city: screenshot, industry, and key metric. */
function ClientPeek({ peek }: { peek: { id: string; x: number; y: number } }) {
  const c = clientItems.find((x) => x.id === peek.id);
  if (!c) return null;
  const W = 320;
  const H = 300;
  const left = Math.min(peek.x + 24, (typeof window !== 'undefined' ? window.innerWidth : 1440) - W - 16);
  const top = Math.max(16, Math.min(peek.y - H / 2, (typeof window !== 'undefined' ? window.innerHeight : 900) - H - 16));
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="pointer-events-none fixed z-40 overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
      style={{ left, top, width: W, boxShadow: `0 30px 80px -30px ${c.color}` }}
      aria-hidden
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image src={c.screenshots.desktop} alt="" fill sizes="320px" className="object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-ink/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]" style={{ color: c.color }}>
          {c.industry}
        </span>
      </div>
      <div className="p-4 pt-1">
        <div className="flex items-baseline justify-between gap-3">
          <h4 className="font-display text-xl font-semibold text-white">{c.name}</h4>
          <span className="font-display text-xl font-semibold text-gold">{c.metric.value}</span>
        </div>
        <p className="mt-1 text-xs leading-snug text-mist/80">{c.role}</p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-gold/80">{clients.openLabel} · click</p>
      </div>
    </motion.div>
  );
}
