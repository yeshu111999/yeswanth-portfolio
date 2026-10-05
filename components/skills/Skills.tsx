'use client';

import { resolveRef, skills, type Skill, type SkillGroup } from '@/data/content';
import { icons } from '@/data/icons';
import { ScrollHeading } from '@/components/ui/ScrollHeading';
import { TiltCard } from '@/components/work/TiltCard';
import { scrollToHash } from '@/lib/scroll';

const groups = skills.groups as SkillGroup[];
// Bento widths on a 6-column grid, in group order.
const spans: Record<string, string> = {
  languages: 'md:col-span-2',
  frontend: 'md:col-span-4',
  backend: 'md:col-span-3',
  payments: 'md:col-span-3',
  ai: 'md:col-span-2',
  web3: 'md:col-span-4',
  security: 'md:col-span-3',
  cloud: 'md:col-span-3',
};
const total = groups.reduce((n, g) => n + g.items.length, 0);

/** Every tool is visible at once, grouped by category; nothing rotates or waits. */
export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <ScrollHeading id="skills-title" eyebrow={`${skills.eyebrow} · ${total} tools`} title={skills.title} sub={skills.hint} />
        <div className="mt-14 grid gap-5 md:grid-cols-6">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GroupCard({ group }: { group: SkillGroup }) {
  return (
    <TiltCard accent="#D4B483" clip={false} className={`${spans[group.id] ?? 'md:col-span-3'} h-full`}>
      <div
        className={`relative flex h-full flex-col rounded-3xl p-6 md:p-7 ${
          group.highlight ? 'bg-[radial-gradient(ellipse_at_top_right,rgba(212,180,131,0.16),transparent_60%)]' : ''
        }`}
      >
        {group.highlight && <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-gold/40" aria-hidden />}
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-white">{group.title}</h3>
          <span className="font-mono text-xs text-mist/65">{String(group.items.length).padStart(2, '0')}</span>
        </div>
        <p className="mt-1.5 text-sm leading-snug text-gold/80">{group.proof}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {group.items.map((s) => (
            <SkillChip key={s.name} skill={s} />
          ))}
        </ul>
      </div>
    </TiltCard>
  );
}

function SkillChip({ skill }: { skill: Skill }) {
  const refs = skill.usedIn ?? [];
  const body = (
    <>
      {skill.icon && icons[skill.icon] && (
        <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none fill-gold-300 transition-colors group-hover/chip:fill-gold" aria-hidden>
          <path d={icons[skill.icon]} />
        </svg>
      )}
      <span>{skill.name}</span>
    </>
  );
  const chip =
    'flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] font-medium text-mist transition-colors';

  if (!refs.length) {
    return <li className={chip}>{body}</li>;
  }

  return (
    <li className="group/chip relative">
      <button type="button" className={`${chip} hover:border-gold/50 hover:text-white focus-visible:border-gold/50`}>
        {body}
      </button>
      {/* "Used in" popover on hover / keyboard focus */}
      <div className="absolute bottom-full left-0 z-30 hidden pb-2 group-focus-within/chip:block group-hover/chip:block">
        <div className="w-64 max-w-[calc(100vw-3rem)] rounded-2xl border border-white/10 bg-[#161616] p-3 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)]">
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-mist/65">{skills.usedInLabel}</p>
          <ul className="flex flex-col gap-1">
            {refs.map((r) => {
              const { label, href } = resolveRef(r);
              return (
                <li key={`${r.type}-${r.id}`}>
                  <a
                    href={href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToHash(href);
                    }}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs text-mist hover:bg-white/5 hover:text-white"
                  >
                    {label}
                    <span className="text-[10px] uppercase tracking-widest text-mist/65">{r.type}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </li>
  );
}
