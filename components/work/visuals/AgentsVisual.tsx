'use client';

import { motion } from 'framer-motion';
import { useStepper } from './useStepper';

const agents = [
  { k: 'Voice', task: 'Inbound call → booked appointment', tool: 'calendar.book()' },
  { k: 'Chat', task: 'Support question → answer + handoff', tool: 'kb.search()' },
  { k: 'Marketing', task: 'Launch brief → 5 social posts', tool: 'posts.draft()' },
  { k: 'Ops', task: 'Invoice PDF → reconciled record', tool: 'ledger.match()' },
];

/** An orchestrator dispatches to four agents in turn; each runs a tool call and reports done. */
export function AgentsVisual() {
  const [ref, step] = useStepper<HTMLDivElement>([1500, 1500, 1500, 1500]);
  const a = agents[step];
  return (
    <div ref={ref} className="flex h-full w-full items-center gap-5 px-6 font-mono text-[11px]">
      <div className="flex flex-col items-center gap-2">
        <motion.div
          key={step}
          initial={{ scale: 0.9 }}
          animate={{ scale: [0.9, 1.08, 1] }}
          transition={{ duration: 0.6 }}
          className="grid h-16 w-16 place-items-center rounded-2xl border border-gold/50 bg-gold/10 text-gold shadow-[0_0_30px_rgba(212,180,131,0.35)]"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <rect x="5" y="7" width="14" height="11" rx="3" />
            <path d="M12 3v4M9 12h.01M15 12h.01M9.5 15h5" strokeLinecap="round" />
          </svg>
        </motion.div>
        <span className="text-[10px] uppercase tracking-widest text-mist/65">orchestrator</span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        {agents.map((ag, i) => (
          <div
            key={ag.k}
            className={`flex items-center justify-between rounded-lg border px-3 py-1.5 transition-all duration-500 ${
              i === step ? 'border-gold/60 bg-gold/10 text-white' : i < step ? 'border-white/10 bg-white/[0.03] text-mist/80' : 'border-white/5 text-mist/65'
            }`}
          >
            <span>{ag.k} agent</span>
            <span className={i < step ? 'text-[#2EE6A0]' : i === step ? 'text-gold' : ''}>{i < step ? 'done' : i === step ? 'running' : 'idle'}</span>
          </div>
        ))}
        <motion.div key={`log-${step}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 truncate text-mist/80">
          <span className="text-gold">›</span> {a.tool} <span className="text-mist/65">· {a.task}</span>
        </motion.div>
      </div>
    </div>
  );
}
