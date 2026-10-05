import { SmoothScroll } from '@/components/providers/SmoothScroll';
import { Cursor } from '@/components/ui/Cursor';
import { Loader } from '@/components/ui/Loader';
import { Nav } from '@/components/ui/Nav';
import { Hero } from '@/components/hero/Hero';
import { Experience } from '@/components/experience/Experience';
import { Clients } from '@/components/clients/Clients';
import { Work } from '@/components/work/Work';
import { Skills } from '@/components/skills/Skills';
import { Contact } from '@/components/contact/Contact';

export default function Page() {
  return (
    <SmoothScroll>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <Loader />
      <Cursor />
      <Nav />
      <main id="main">
        <Hero />
        <Experience />
        <Clients />
        <Work />
        <Skills />
        <Contact />
      </main>
    </SmoothScroll>
  );
}
