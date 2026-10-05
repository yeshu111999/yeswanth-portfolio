'use client';

import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { useCallback, useState } from 'react';
import { clients, type Client } from '@/data/content';
import { ScrollHeading } from '@/components/ui/ScrollHeading';
import { TiltCard } from '@/components/work/TiltCard';
import { useIsMobile } from '@/lib/hooks';
import { ClientPanel } from './ClientPanel';

// Highest impact first; the lead card gets the wide slot.
const items = [...(clients.items as Client[])].sort((a, b) => b.impact - a.impact);
const spans = ['md:col-span-4', 'md:col-span-2', 'md:col-span-2', 'md:col-span-2', 'md:col-span-2'];

export function Clients() {
  const mobile = useIsMobile();
  const [selected, setSelected] = useState<string | null>(null);
  const close = useCallback(() => setSelected(null), []);
  const client = items.find((c) => c.id === selected);

  return (
    <section id="clients" aria-labelledby="clients-title" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <ScrollHeading id="clients-title" eyebrow={clients.eyebrow} title={clients.title} sub={clients.intro} />
        <ul className="mt-14 grid gap-5 md:grid-cols-6" aria-label="Clients">
          {items.map((c, i) => (
            <li key={c.id} className={spans[i] ?? 'md:col-span-2'}>
              <ShowcaseCard client={c} lead={i === 0} onOpen={() => setSelected(c.id)} />
            </li>
          ))}
        </ul>
      </div>
      <AnimatePresence>{client && <ClientPanel key={client.id} client={client} onClose={close} mobile={mobile} />}</AnimatePresence>
    </section>
  );
}

function ShowcaseCard({ client, lead, onOpen }: { client: Client; lead: boolean; onOpen: () => void }) {
  return (
    <TiltCard accent={client.color} className="h-full">
      <button type="button" onClick={onOpen} className="flex h-full w-full flex-col text-left" data-cursor-label={clients.openLabel}>
        {/* Device stage */}
        <div
          className={`relative w-full overflow-hidden border-b border-white/5 [perspective:1400px] ${lead ? 'h-72 md:h-[360px]' : 'h-56'}`}
          style={{ background: `radial-gradient(ellipse at 50% 110%, ${client.color}33, transparent 70%)` }}
        >
          <div
            className={`absolute left-1/2 top-[14%] transition-transform [transform:translateX(-50%)_rotateX(14deg)] duration-700 ease-out [transform-style:preserve-3d] group-hover:[transform:translateX(-50%)_rotateX(4deg)_translateY(-6px)] ${
              lead ? 'w-[78%] md:w-[66%]' : 'w-[82%]'
            }`}
          >
            <div className="rounded-t-xl border border-white/15 bg-[#111111] p-[2%] shadow-2xl">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[4px]">
                <Image
                  src={client.screenshots.desktop}
                  alt={`${client.name} website`}
                  fill
                  sizes={lead ? '(max-width: 768px) 90vw, 560px' : '(max-width: 768px) 90vw, 360px'}
                  className="object-cover object-top transition-transform duration-[1.6s] ease-out group-hover:scale-[1.04]"
                />
              </div>
            </div>
            <div className="mx-auto h-2 w-[108%] -translate-x-[3.7%] rounded-b-xl bg-gradient-to-b from-[#2c2c2e] to-[#151515]" />
          </div>
          {lead && (
            <div className="absolute bottom-[-8%] right-[8%] w-[17%] rotate-[-4deg] transition-transform duration-700 group-hover:-translate-y-3 group-hover:rotate-0 md:right-[12%] md:w-[13%]">
              <div className="rounded-[22%/11%] border border-white/20 bg-[#111111] p-[5%] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9)]">
                <div className="relative aspect-[390/844] overflow-hidden rounded-[18%/8.5%]">
                  <Image src={client.screenshots.mobile} alt="" fill sizes="120px" className="object-cover object-top" />
                </div>
              </div>
            </div>
          )}
          <span
            className="absolute left-4 top-4 rounded-full border border-white/10 bg-ink/70 px-3 py-1 text-[10px] uppercase tracking-[0.18em] backdrop-blur"
            style={{ color: client.color }}
          >
            {client.industry}
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col p-6 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className={`font-display font-semibold leading-tight tracking-tight text-white ${lead ? 'text-3xl' : 'text-2xl'}`}>{client.name}</h3>
              <p className="mt-1 text-sm text-mist/60">{client.domain}</p>
            </div>
            <div className="text-right">
              <div className={`font-display font-semibold leading-none text-gold text-glow-gold ${lead ? 'text-4xl md:text-5xl' : 'text-2xl'}`}>
                {client.metric.value}
              </div>
              {lead && client.secondaryMetric && (
                <div className="mt-1 text-xs text-mist/70">
                  {client.secondaryMetric.value} {client.secondaryMetric.label}
                </div>
              )}
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-mist/80">{lead ? client.summary : client.role}</p>
          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
              {client.stack.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
            <span className="flex flex-none items-center gap-1.5 text-xs font-medium text-gold transition-transform group-hover:translate-x-1">
              {clients.openLabel}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </button>
    </TiltCard>
  );
}
