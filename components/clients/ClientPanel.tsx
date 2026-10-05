'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { clients, type Client } from '@/data/content';
import { LazyCanvas } from '@/components/three/LazyCanvas';
import { lockScroll, unlockScroll } from '@/lib/scroll';

const ClientVisualScene = dynamic(() => import('./ClientVisuals'), { ssr: false });

/** Glass dialog with a tilted device mockup, the client's 3D visual, and key facts. */
export function ClientPanel({ client, onClose, mobile }: { client: Client; onClose: () => void; mobile: boolean }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>('a[href], button');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      unlockScroll();
      prev?.focus();
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center p-0 md:items-center md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button type="button" aria-label={clients.closeLabel} tabIndex={-1} className="absolute inset-0 bg-ink-900/70 backdrop-blur-md" onClick={onClose} />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`client-${client.id}-title`}
        data-lenis-prevent
        initial={{ y: 60, opacity: 0, rotateX: 8, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 200, damping: 26 }}
        className="glass-strong relative max-h-[92svh] w-full max-w-6xl overflow-y-auto rounded-t-3xl md:rounded-3xl"
        style={{ boxShadow: `0 0 120px -30px ${client.color}` }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={clients.closeLabel}
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full glass text-white"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        <div className="grid gap-0 md:grid-cols-[1.15fr_1fr]">
          {/* Device stage */}
          <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden p-6 [perspective:1600px] md:min-h-[560px] md:p-10">
            <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 40% 50%, ${client.color}44, transparent 65%)` }} />
            <Devices client={client} />
          </div>

          {/* Details */}
          <div className="relative flex flex-col p-6 pt-2 md:p-10 md:pl-4">
            <div className="relative -mx-2 mb-4 h-44 overflow-hidden rounded-2xl border border-white/5 bg-ink-900/60 md:h-52">
              <LazyCanvas className="absolute inset-0" mountMargin="0px" camera={{ position: [0, 0.6, 6], fov: 45 }}>
                <ClientVisualScene kind={client.visual} color={client.color} bloom={!mobile} />
              </LazyCanvas>
            </div>
            <p className="eyebrow" style={{ color: client.color }}>
              {client.industry}
            </p>
            <h3 id={`client-${client.id}-title`} className="mt-2 font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {client.name}
            </h3>
            <p className="mt-1 text-sm text-mist/70">{client.role}</p>

            <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-3">
              <div>
                <div className="font-display text-5xl font-semibold leading-none text-gold text-glow-gold md:text-6xl">{client.metric.value}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-mist/70">{client.metric.label}</div>
              </div>
              {client.secondaryMetric && (
                <div>
                  <div className="font-display text-3xl font-semibold leading-none text-white md:text-4xl">{client.secondaryMetric.value}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-mist/70">{client.secondaryMetric.label}</div>
                </div>
              )}
            </div>

            <p className="mt-6 text-sm leading-relaxed text-mist md:text-[15px]">{client.summary}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {client.stack.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>

            <a
              href={client.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-ink transition-transform hover:scale-[1.03]"
              style={{ background: client.color }}
            >
              {clients.visitLabel} · {client.domain}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                <path d="M4 10L10 4M10 4H5M10 4v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Devices({ client }: { client: Client }) {
  return (
    <div className="relative w-full max-w-[560px] [transform-style:preserve-3d]">
      {/* Laptop */}
      <motion.div
        initial={{ rotateY: -32, rotateX: 18, y: 30, opacity: 0 }}
        animate={{ rotateY: -16, rotateX: 10, y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative [transform-style:preserve-3d]"
      >
        <div className="rounded-t-2xl border border-white/15 bg-[#111111] p-[2.5%] shadow-2xl">
          <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-ink-900">
            <Image src={client.screenshots.desktop} alt={`${client.name} website`} fill sizes="(max-width: 768px) 90vw, 560px" className="object-cover object-top" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15" />
          </div>
        </div>
        <div className="mx-auto h-3 w-[110%] -translate-x-[4.5%] rounded-b-2xl bg-gradient-to-b from-[#2c2c2e] to-[#151515] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.8)]" />
      </motion.div>
      {/* Phone */}
      <motion.div
        initial={{ rotateY: 30, x: 40, y: 60, z: 160, opacity: 0 }}
        animate={{ rotateY: -8, x: 0, y: 0, z: 160, opacity: 1 }}
        transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -bottom-8 right-[1%] z-10 w-[24%]"
      >
        <div className="rounded-[22%/11%] border border-white/20 bg-[#111111] p-[5%] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.9)]">
          <div className="relative aspect-[390/844] overflow-hidden rounded-[18%/8.5%] bg-ink-900">
            <Image src={client.screenshots.mobile} alt="" fill sizes="150px" className="object-cover object-top" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
