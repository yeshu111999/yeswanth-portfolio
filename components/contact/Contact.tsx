'use client';

import { useIsMobile, useReducedMotion } from '@/lib/hooks';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';
import { contact, site } from '@/data/content';
import { LazyCanvas } from '@/components/three/LazyCanvas';
import { MagneticButton } from '@/components/ui/MagneticButton';

const ContactScene = dynamic(() => import('./ContactScene'), { ssr: false });

const iconPaths: Record<string, string> = {
  email: 'M3 6h18v12H3z M3 6l9 7 9-7',
  linkedin: 'M4 9h3v11H4z M5.5 4a1.6 1.6 0 110 3.2 1.6 1.6 0 010-3.2z M10 9h3v1.6c.5-.9 1.7-1.8 3.4-1.8 3 0 3.6 2 3.6 4.6V20h-3v-5.6c0-1.4 0-3-1.9-3s-2.1 1.4-2.1 2.9V20h-3z',
  github: 'M12 3a9 9 0 00-2.8 17.5c.4.1.6-.2.6-.4v-1.6c-2.5.5-3-1.1-3-1.1-.4-1-1-1.3-1-1.3-.8-.6.1-.6.1-.6.9.1 1.4 1 1.4 1 .8 1.4 2.2 1 2.7.8.1-.6.3-1 .6-1.2-2-.2-4.1-1-4.1-4.5 0-1 .4-1.8.9-2.4-.1-.2-.4-1.2.1-2.4 0 0 .8-.2 2.5.9a8.5 8.5 0 014.5 0c1.7-1.1 2.5-.9 2.5-.9.5 1.3.2 2.2.1 2.4.6.6.9 1.4.9 2.4 0 3.5-2.1 4.3-4.1 4.5.3.3.6.8.6 1.7v2.5c0 .2.2.5.6.4A9 9 0 0012 3z',
  resume: 'M12 4v11m0 0l-4-4m4 4l4-4M5 19h14',
};

export function Contact() {
  const section = useRef<HTMLElement>(null);
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'start 15%'] });
  const words = contact.headline.split(' ');
  const total = contact.headline.length;
  const links = contact.links.filter((l) => l.href);
  const photoY = useTransform(scrollYProgress, [0, 1], ['18%', '0%']);
  const photoOpacity = useTransform(scrollYProgress, [0.2, 1], [0, 1]);

  return (
    <section id="contact" ref={section} aria-labelledby="contact-title" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <LazyCanvas className="absolute inset-0" camera={{ position: [0, 0, 8], fov: 50 }} eventSource={section as React.MutableRefObject<HTMLElement>} eventPrefix="client">
        <ContactScene count={mobile ? 700 : 2200} />
      </LazyCanvas>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent" />

      {/* Portrait: its dark backdrop dissolves into the page */}
      <motion.div
        style={reduced ? undefined : { y: photoY, opacity: photoOpacity }}
        className="pointer-events-none absolute bottom-0 right-0 h-[46vh] w-full md:h-[92%] md:w-[52%] lg:w-[46%]"
      >
        <Image
          src={site.photos.contact}
          alt={site.photos.alt}
          fill
          sizes="(max-width: 768px) 100vw, 46vw"
          className="object-cover object-[35%_20%] opacity-90 [mask-image:radial-gradient(ellipse_70%_75%_at_55%_45%,black_45%,transparent_100%)] md:object-[30%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_35%,rgba(212,180,131,0.12),transparent_55%)] mix-blend-screen" />
      </motion.div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-[46vh] pt-32 md:px-10 md:py-32">
        <p className="eyebrow mb-6">{contact.eyebrow}</p>
        <h2 id="contact-title" aria-label={contact.headline} className="max-w-[11ch] font-display text-[clamp(3.2rem,11vw,10rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-white">
          {words.map((w, wi) => {
            const offset = words.slice(0, wi).join(' ').length + (wi ? 1 : 0);
            return (
              <span key={wi} className="mr-[0.22em] inline-block whitespace-nowrap last:mr-0">
                {w.split('').map((ch, i) => (
                  <Letter key={i} ch={ch} i={offset + i} total={total} progress={scrollYProgress} reduced={!!reduced} />
                ))}
              </span>
            );
          })}
        </h2>
        <p className="mt-6 max-w-md text-lg text-mist/80">{contact.sub}</p>

        <div className="mt-12 flex flex-wrap gap-3">
          {links.map((l, i) => (
            <MagneticButton
              key={l.id}
              href={l.href}
              size="lg"
              variant={i === 0 ? 'primary' : 'ghost'}
              download={l.id === 'resume'}
              ariaLabel={l.id === 'email' ? `${l.label}: ${l.value}` : undefined}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={iconPaths[l.id]} fill={l.id === 'linkedin' || l.id === 'github' ? 'currentColor' : 'none'} stroke={l.id === 'linkedin' || l.id === 'github' ? 'none' : 'currentColor'} />
              </svg>
              {l.id === 'email' ? l.value : l.label}
            </MagneticButton>
          ))}
        </div>
      </div>

      <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-2 border-t border-white/5 px-5 py-6 text-xs text-mist/65 md:flex-row md:items-center md:px-10">
        <span>{site.footer}</span>
        <span>{site.role} · {contact.links[0].value}</span>
      </footer>
    </section>
  );
}

function Letter({ ch, i, total, progress, reduced }: { ch: string; i: number; total: number; progress: MotionValue<number>; reduced: boolean }) {
  const start = (i / total) * 0.55;
  const y = useTransform(progress, [start, start + 0.45], ['100%', '0%']);
  const rotate = useTransform(progress, [start, start + 0.45], [25, 0]);
  const color = useTransform(progress, [start + 0.3, start + 0.45, 1], ['#D4B483', '#FFFFFF', '#FFFFFF']);
  return (
    <span aria-hidden className="inline-block overflow-hidden pb-[0.06em] align-bottom">
      <motion.span className="inline-block origin-bottom-left" style={reduced ? undefined : { y, rotate, color }}>
        {ch}
      </motion.span>
    </span>
  );
}
