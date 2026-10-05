'use client';

import { work, type Project, type ProjectVisual } from '@/data/content';
import { ScrollHeading } from '@/components/ui/ScrollHeading';
import { TiltCard } from './TiltCard';
import { VoiceVisual } from './visuals/VoiceVisual';
import { LlmVisual } from './visuals/LlmVisual';
import { PaymentsVisual } from './visuals/PaymentsVisual';
import { EcommerceVisual } from './visuals/EcommerceVisual';
import { InvestorVisual } from './visuals/InvestorVisual';
import { MarketplaceVisual } from './visuals/MarketplaceVisual';
import { FitnessVisual } from './visuals/FitnessVisual';
import { TradingVisual } from './visuals/TradingVisual';
import { LaunchpadVisual } from './visuals/LaunchpadVisual';
import { ArbitrageVisual } from './visuals/ArbitrageVisual';
import { AgentsVisual } from './visuals/AgentsVisual';
import Image from 'next/image';

const visuals: Record<ProjectVisual, () => JSX.Element> = {
  voice: VoiceVisual,
  llm: LlmVisual,
  payments: PaymentsVisual,
  ecommerce: EcommerceVisual,
  investor: InvestorVisual,
  marketplace: MarketplaceVisual,
  fitness: FitnessVisual,
  trading: TradingVisual,
  launchpad: LaunchpadVisual,
  arbitrage: ArbitrageVisual,
  agents: AgentsVisual,
};

const items = work.items as Project[];

export function Work() {
  return (
    <section id="work" aria-labelledby="work-title" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <ScrollHeading id="work-title" eyebrow={work.eyebrow} title={work.title} />
        <div className="mt-14 grid gap-5 md:grid-cols-6">
          {items.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  const Visual = visuals[p.visual];
  return (
    <TiltCard id={`work-${p.id}`} accent={p.accent} className={p.featured || p.wide ? 'md:col-span-3' : 'md:col-span-2'}>
      <div className="relative flex h-full flex-col [transform-style:preserve-3d]">
        <div
          className={`relative overflow-hidden border-b border-white/5 [transform:translateZ(30px)] ${p.featured ? 'h-64 md:h-80' : 'h-52'}`}
          style={{ background: `radial-gradient(ellipse at 50% 120%, ${p.accent}2e, transparent 70%)` }}
        >
          {p.screenshots ? <ProductShot project={p} /> : <Visual />}
        </div>
        <div className="flex flex-1 flex-col p-6 [transform:translateZ(50px)] md:p-7">
          <div className="flex items-start justify-between gap-4">
            <h3 className={`font-display font-semibold leading-tight tracking-tight text-white ${p.featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
              {p.title}
            </h3>
            {p.featured && <span className="chip flex-none border-gold/30 text-gold">Featured</span>}
          </div>
          {p.stat && (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-2xl font-semibold" style={{ color: p.accent }}>
                {p.stat.value}
              </span>
              <span className="text-xs text-mist/60">{p.stat.label}</span>
            </div>
          )}
          <p className="mt-3 text-sm leading-relaxed text-mist/80">{p.description}</p>
          {p.link && (
            <a
              href={p.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-300"
            >
              {p.link.label}
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M4 10L10 4M10 4H5M10 4v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-5" aria-label="Stack">
            {p.tags.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </TiltCard>
  );
}

/** Real product screenshot on a tilted browser frame, with the phone view tucked in front. */
function ProductShot({ project: p }: { project: Project }) {
  const shots = p.screenshots!;
  return (
    <div className="relative h-full w-full [perspective:1200px]">
      <div className="absolute left-[8%] top-[12%] w-[72%] transition-transform duration-700 ease-out [transform:rotateX(10deg)_rotateY(-8deg)] group-hover:[transform:rotateX(4deg)_rotateY(-3deg)_translateY(-4px)]">
        <div className="overflow-hidden rounded-lg border border-white/15 bg-[#111111] shadow-2xl">
          <div className="flex h-4 items-center gap-1 border-b border-white/10 px-2">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/20" />
            ))}
          </div>
          <div className="relative aspect-[16/10]">
            <Image src={shots.desktop} alt={`${p.title} screenshot`} fill sizes="(max-width: 768px) 80vw, 420px" className="object-cover object-top" />
          </div>
        </div>
      </div>
      {shots.mobile && (
        <div className="absolute bottom-[-6%] right-[8%] w-[17%] rotate-[-3deg] transition-transform duration-700 group-hover:-translate-y-2 group-hover:rotate-0">
          <div className="rounded-[22%/11%] border border-white/20 bg-[#111111] p-[5%] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9)]">
            <div className="relative aspect-[390/844] overflow-hidden rounded-[18%/8.5%]">
              <Image src={shots.mobile} alt="" fill sizes="100px" className="object-cover object-top" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
