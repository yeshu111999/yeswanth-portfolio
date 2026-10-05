'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';
import { nav, site } from '@/data/content';
import { scrollToHash } from '@/lib/scroll';

export function Nav() {
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40));

  useEffect(() => {
    const ids = nav.map((n) => n.href.slice(1));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollToHash(href);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        aria-label="Primary"
        className={`flex w-full max-w-5xl items-center justify-between rounded-full px-3 py-2 transition-all duration-500 ${
          scrolled ? 'glass' : 'border border-transparent'
        }`}
      >
        <a
          href="#top"
          aria-label={`${site.name}, back to top`}
          onClick={go('#top')}
          className="flex items-center gap-2 rounded-full px-2 py-1 font-display text-sm font-semibold tracking-tight text-white"
        >
          <span className="relative block h-8 w-8 overflow-hidden rounded-full ring-2 ring-bronze/70 shadow-[0_0_20px_rgba(176,141,87,0.7)]">
            <Image src={site.photos.avatar} alt="" width={64} height={64} priority className="h-full w-full object-cover" />
          </span>
          <span className="hidden sm:inline">{site.name}</span>
        </a>
        <ul className="hidden items-center gap-1 md:flex">
          {nav.map((n) => {
            const isActive = active === n.href.slice(1);
            return (
              <li key={n.href}>
                <a
                  href={n.href}
                  onClick={go(n.href)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative rounded-full px-4 py-2 text-sm transition-colors ${isActive ? 'text-white' : 'text-mist/70 hover:text-white'}`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/[0.08] ring-1 ring-white/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{n.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full glass md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="relative block h-3 w-5">
            <span className={`absolute left-0 h-[1.5px] w-5 bg-white transition-all ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
            <span className={`absolute left-0 h-[1.5px] w-5 bg-white transition-all ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
          </span>
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-strong absolute inset-x-4 top-20 rounded-3xl p-4 md:hidden"
          >
            <ul className="flex flex-col">
              {nav.map((n, i) => (
                <motion.li key={n.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <a href={n.href} onClick={go(n.href)} className="block rounded-2xl px-4 py-3 font-display text-2xl text-white">
                    {n.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
