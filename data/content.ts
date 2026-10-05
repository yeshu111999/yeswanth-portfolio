/**
 * Every piece of text, metric, and link on the site lives here.
 * Edit this file to update the portfolio; components only read from it.
 */

export const site = {
  name: 'Yeswanth Ravipati',
  firstName: 'Yeswanth',
  lastName: 'Ravipati',
  initials: 'YR',
  photos: {
    /** Square face crop: nav, final route stop, share image. */
    avatar: '/me/avatar.jpg',
    /** Dark-background portrait that blends into the contact section. */
    contact: '/me/portrait-stage.jpg',
    alt: 'Yeswanth Ravipati',
  },
  role: 'Full Stack Engineer',
  /** Used for canonical URLs, sitemap, and Open Graph. Override with NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yeswanth-ravipati.vercel.app',
  title: 'Yeswanth Ravipati | Full Stack Engineer',
  description:
    'Full stack engineer with 4 years of experience shipping payments, voice AI, LLM, and Web3 products end to end. Lead developer for client platforms in fintech, healthcare, luxury, art, and telecom.',
  keywords: [
    'Yeswanth Ravipati',
    'Full Stack Engineer',
    'Next.js',
    'React',
    'TypeScript',
    'Voice AI',
    'LLM',
    'Payments',
    'DFW',
  ],
  footer: '© 2026 Yeswanth Ravipati',
};

export const nav = [
  { label: 'Experience', href: '#experience' },
  { label: 'Clients', href: '#clients' },
  { label: 'Work', href: '#work' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
];

export const hero = {
  tagline: 'Full stack engineer shipping payments, voice AI, LLM, and Web3 products end to end',
  stack: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Rust', 'Solana'],
  status: 'Open to work, DFW or remote',
  primaryCta: { label: 'See my work', href: '#work' },
  secondaryCta: { label: 'Contact me', href: '#contact' },
  scrollHint: 'Scroll',
  stats: [
    { prefix: '$', value: 2, suffix: 'M+', label: 'client revenue through a platform I built' },
    { prefix: '', value: 5000, suffix: '+', label: 'active customers on a client platform I built' },
    { prefix: '', value: 100, suffix: '+', label: 'users on my LLM platform' },
    { prefix: '', value: 140, suffix: '+', label: 'PRs reviewed, led 5+ developers' },
  ],
};

export const loader = {
  label: 'Assembling',
};

export type ExperienceStop = {
  id: string;
  kind: 'job' | 'education' | 'cta';
  company: string;
  role: string;
  location: string;
  dates?: string;
  bullets: string[];
};

export const experience = {
  eyebrow: 'Experience',
  title: 'The route so far',
  hint: 'Scroll to travel the route',
  stops: [
    {
      id: 'lusso',
      kind: 'job',
      company: 'Lusso Labs',
      role: 'Full Stack Developer',
      location: 'Southlake, TX',
      dates: 'Apr 2024 – Present',
      bullets: [
        'Architected a multi-tenant voice AI calling platform (Next.js, FastAPI/Pipecat, Telnyx, PostgreSQL RLS)',
        'Built a multi-model LLM platform serving 100+ users with streaming, fallback, quotas, and Stripe billing',
        'Led an investor platform through two versions: directed 5+ contract developers, reviewed 140+ PRs across 620+ commits',
        'Built AI agents for voice calling, support and sales chat, marketing content, and workflow automation',
        'Built lusso.ai, an AI-powered creator marketplace, and led 5 client platforms end to end',
      ],
    },
    {
      id: 'dinewise',
      kind: 'job',
      company: 'Dinewise',
      role: 'Full Stack Developer',
      location: 'Farmers Branch, TX',
      dates: 'May 2023 – Mar 2024',
      bullets: [
        'React/Redux and Vue 3 (Composition API, Pinia, Vue Router) inventory and order interfaces',
        'RAG question-answering interface (Svelte, TypeScript) with semantic search and streamed responses',
        'Cut average API response time from 1.2s to under 350ms (composite indexes, N+1 elimination)',
      ],
    },
    {
      id: 'ttu',
      kind: 'education',
      company: 'Texas Tech University',
      role: 'M.S. in Computer Science',
      location: 'Lubbock, TX',
      bullets: [],
    },
    {
      id: 'cognizant',
      kind: 'job',
      company: 'Cognizant',
      role: 'Program Analyst Trainee',
      location: 'Chennai',
      dates: 'Aug 2021 – Oct 2021',
      bullets: [
        'Automated Dynamics 365 CRM workflows with custom JavaScript form logic',
        'Validated a multi-source ETL migration with SQL reconciliation queries',
      ],
    },
    {
      id: 'ge',
      kind: 'job',
      company: 'GE Appliances',
      role: 'E-Commerce Developer (Intern)',
      location: 'Hyderabad',
      dates: 'Jan 2021 – Jun 2021',
      bullets: [
        "Built GE's delivery tracking platform end to end: 2 production apps for consumers, dealers, and builders",
        'Multi-criteria order lookup (PO, order, account, or phone) secured by delivery-ZIP verification',
        'Java/Spring Boot APIs unifying order, fulfillment, and last-mile data with live status and driver location',
      ],
    },
    {
      id: 'next',
      kind: 'cta',
      company: 'Next stop: your team',
      role: 'Available now',
      location: 'DFW or remote',
      bullets: [],
    },
  ] satisfies ExperienceStop[],
  finalCta: { label: "Let's talk", href: '#contact' },
};

export type ClientVisual = 'gateway' | 'growth' | 'supercar' | 'gallery' | 'funnel';

export type Client = {
  id: string;
  name: string;
  domain: string;
  url: string;
  industry: string;
  role: string;
  summary: string;
  highlights: string[];
  stack: string[];
  metric: { value: string; label: string };
  secondaryMetric?: { value: string; label: string };
  /** 1–10, drives orb size in the galaxy */
  impact: number;
  color: string;
  visual: ClientVisual;
  screenshots: { desktop: string; mobile: string };
};

export const clients = {
  eyebrow: 'Client work via Lusso Labs',
  title: 'Client showcase',
  intro: 'Five platforms I build, run, and grow end to end.',
  core: 'Lusso Labs',
  openLabel: 'View case',
  visitLabel: 'Visit site',
  closeLabel: 'Close',
  items: [
    {
      id: '86400',
      name: '86400',
      domain: '86400.in',
      url: 'https://86400.in',
      industry: 'Fintech / payment gateway',
      role: 'Built the entire portal from scratch, maintain it daily',
      summary:
        "Built the company's entire portal from scratch and maintain it daily: deployments, bug fixes, monitoring, and new features.",
      highlights: ['Portal built from zero', 'Daily deployments & monitoring', 'Ongoing feature work'],
      stack: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
      metric: { value: '0 → 1', label: 'Entire portal built from scratch, run daily' },
      impact: 8,
      color: '#E5E4E2',
      visual: 'gateway',
      screenshots: { desktop: '/clients/86400-desktop.jpg', mobile: '/clients/86400-mobile.jpg' },
    },
    {
      id: 'hellonurse',
      name: 'Hello Nurse',
      domain: 'hellonurse.health',
      url: 'https://hellonurse.health',
      industry: 'Healthcare / mobile IV therapy',
      role: 'Built the website & booking platform, run the full digital presence',
      summary:
        'Multi-step booking wizard, city-based practitioner matching, after-hours tiered pricing, and automated SMS/email reminders. I manage the entire digital presence, from marketing to operations.',
      highlights: ['Multi-step booking wizard', 'City-based practitioner matching', 'Automated SMS & email reminders'],
      stack: ['Next.js', 'Prisma', 'Neon', 'Twilio'],
      metric: { value: '$2M+', label: 'revenue in 2025' },
      secondaryMetric: { value: '5,000+', label: 'active clients' },
      impact: 10,
      color: '#9FC9B8',
      visual: 'growth',
      screenshots: { desktop: '/clients/hellonurse-desktop.jpg', mobile: '/clients/hellonurse-mobile.jpg' },
    },
    {
      id: 'southernproper',
      name: 'Southern Proper',
      domain: 'southern-proper.com',
      url: 'https://southern-proper.com',
      industry: 'Luxury concierge & supercar fleet',
      role: 'Built the website, manage the entire digital presence',
      summary: 'Built the company website and manage the entire digital presence for a luxury concierge and supercar fleet.',
      highlights: ['Brand website', 'Fleet showcase', 'Full digital presence'],
      stack: ['Website build', 'Digital presence'],
      metric: { value: 'End to end', label: 'Website and digital presence owned' },
      impact: 6,
      color: '#D4B483',
      visual: 'supercar',
      screenshots: {
        desktop: '/clients/southernproper-desktop.jpg',
        mobile: '/clients/southernproper-mobile.jpg',
      },
    },
    {
      id: 'robprior',
      name: 'Rob Prior',
      domain: 'robprior.com',
      url: 'https://robprior.com',
      industry: 'Fine art',
      role: "Built the artist's website, manage his entire digital identity",
      summary: "Built the artist's website and manage his entire digital identity for a $20M+ art inventory.",
      highlights: ['Artist website', 'Inventory presentation', 'Digital identity'],
      stack: ['Next.js', 'Vercel'],
      metric: { value: '$20M+', label: 'art inventory presented online' },
      impact: 7,
      color: '#C99A86',
      visual: 'gallery',
      screenshots: { desktop: '/clients/robprior-desktop.jpg', mobile: '/clients/robprior-mobile.jpg' },
    },
    {
      id: 'heraforge',
      name: 'Hera Forge',
      domain: 'heraforge.com',
      url: 'https://heraforge.com',
      industry: 'Trump Mobile affiliate marketing',
      role: 'Built the entire Trump Mobile affiliate platform',
      summary:
        'Built the Trump Mobile affiliate platform end to end: Next.js landing page, UTM-tracked enrollment funnels into Trump Mobile signup, conversion-focused CTAs, and analytics.',
      highlights: ['Trump Mobile enrollment funnels', 'UTM attribution', 'Conversion-focused CTAs'],
      stack: ['Next.js', 'UTM tracking', 'Analytics'],
      metric: { value: 'Trump Mobile', label: 'Affiliate funnel: landing → enrollment → analytics' },
      impact: 6,
      color: '#B87333',
      visual: 'funnel',
      screenshots: { desktop: '/clients/heraforge-desktop.jpg', mobile: '/clients/heraforge-mobile.jpg' },
    },
  ] satisfies Client[],
};

export type ProjectVisual =
  | 'voice'
  | 'llm'
  | 'payments'
  | 'ecommerce'
  | 'investor'
  | 'marketplace'
  | 'fitness'
  | 'trading'
  | 'launchpad'
  | 'arbitrage'
  | 'agents';

export type Project = {
  id: string;
  title: string;
  featured?: boolean;
  /** Half-width row instead of a third. */
  wide?: boolean;
  /** Real product screenshots; shown instead of the animated visual. */
  screenshots?: { desktop: string; mobile?: string };
  link?: { label: string; href: string };
  description: string;
  tags: string[];
  stat?: { value: string; label: string };
  visual: ProjectVisual;
  accent: string;
};

export const work = {
  eyebrow: 'Selected work',
  title: 'Things I shipped',
  items: [
    {
      id: 'voice-ai',
      title: 'Voice AI calling platform',
      featured: true,
      description:
        'Multi-tenant Next.js console plus a Python/FastAPI + Pipecat voice service. Telnyx call control, swappable STT/LLM/TTS adapters, tenant isolation via PostgreSQL RLS and Clerk orgs.',
      tags: ['Next.js', 'FastAPI', 'Pipecat', 'Telnyx', 'PostgreSQL RLS', 'Clerk'],
      stat: { value: 'Multi-tenant', label: 'RLS-isolated orgs' },
      visual: 'voice',
      accent: '#D4B483',
    },
    {
      id: 'llm-platform',
      title: 'Multi-model LLM platform',
      featured: true,
      description:
        'Streaming responses, automatic provider fallback, per-user quotas, and Stripe subscriptions.',
      tags: ['Next.js', 'OpenRouter', 'Dify', 'Stripe'],
      stat: { value: '100+', label: 'users' },
      visual: 'llm',
      accent: '#E6D3AE',
    },
    {
      id: 'ai-agents',
      title: 'AI agents',
      wide: true,
      description:
        'Agents for real-time voice calling, customer support and sales chat, marketing content, and ops workflow automation, using tool calling on the Claude API and OpenRouter.',
      tags: ['Claude API', 'OpenRouter', 'Pipecat', 'Telnyx', 'Tool use'],
      stat: { value: '4 agent types', label: 'voice · chat · marketing · ops' },
      visual: 'agents',
      accent: '#D4B483',
    },
    {
      id: 'marketplace',
      title: 'Lusso.ai: AI-powered marketplace',
      wide: true,
      description:
        'Creator marketplace with AI recommendations and search, an AI chat assistant, creator analytics, Stripe subscriptions, and a 12-platform social analytics hub with OAuth.',
      tags: ['Next.js', 'Stripe', 'OAuth', 'AI chat', 'AWS Amplify'],
      stat: { value: '~117', label: 'routes' },
      visual: 'marketplace',
      accent: '#C99A86',
      screenshots: { desktop: '/work/lussoai-desktop.jpg', mobile: '/work/lussoai-mobile.jpg' },
      link: { label: 'Visit lusso.ai', href: 'https://www.lusso.ai' },
    },
    {
      id: 'payments',
      title: 'Payments infrastructure',
      description:
        'HMAC-SHA256 signed hosted checkout (out of PCI scope), idempotent Stripe webhooks, race-safe reconciliation from 3 sources + daily cron, WooCommerce gateway plugin.',
      tags: ['HMAC-SHA256', 'Stripe', 'Webhooks', 'WooCommerce', 'PHP'],
      stat: { value: '7', label: 'plugin releases' },
      visual: 'payments',
      accent: '#9FC9B8',
    },
    {
      id: 'ecommerce',
      title: 'Production e-commerce store',
      description: 'Next.js 16 / React 19 rebuild with a Neon Postgres + Drizzle schema and a full admin.',
      tags: ['Next.js 16', 'React 19', 'Neon', 'Drizzle'],
      stat: { value: '21', label: 'pages' },
      visual: 'ecommerce',
      accent: '#E5E4E2',
    },
    {
      id: 'investor',
      title: 'Investor & portfolio platform',
      description: 'Two versions shipped. Led 5+ developers.',
      tags: ['React 18', 'TypeScript', 'RTK Query', 'CloudFront'],
      stat: { value: '620+', label: 'commits · 140+ PRs' },
      visual: 'investor',
      accent: '#D4B483',
    },
    {
      id: 'fitness',
      title: 'Fitness app',
      wide: true,
      description: 'Personalized plans and meal-photo calorie scanning via Claude vision.',
      tags: ['React Native', 'Expo', 'Claude vision'],
      stat: { value: 'Photo → macros', label: 'via Claude vision' },
      visual: 'fitness',
      accent: '#9FC9B8',
    },
    {
      id: 'trading',
      title: 'Rust Solana trading dashboard',
      wide: true,
      description: 'Encrypted wallet vault (Argon2, AES-GCM), multi-wallet bots, risk limits, live Jupiter swaps.',
      tags: ['Rust', 'Axum', 'Tokio', 'Solana', 'Jupiter'],
      stat: { value: 'Argon2 + AES-GCM', label: 'wallet vault' },
      visual: 'trading',
      accent: '#B87333',
    },
    {
      id: 'launchpad',
      title: 'Solana token launchpad',
      wide: true,
      description: 'Token creation with on-chain metadata via Metaplex and liquidity pools on Raydium.',
      tags: ['Solana', 'Metaplex', 'Raydium', 'TypeScript'],
      stat: { value: 'Mint → pool', label: 'Metaplex + Raydium' },
      visual: 'launchpad',
      accent: '#D4B483',
    },
    {
      id: 'arbitrage',
      title: 'Cross-exchange arbitrage engine',
      wide: true,
      description: 'Watches prices across Binance, Alpaca, and Jupiter to spot spreads between centralized and on-chain markets.',
      tags: ['Binance API', 'Alpaca API', 'Jupiter', 'Solana'],
      stat: { value: '3 venues', label: 'CEX + DEX' },
      visual: 'arbitrage',
      accent: '#B87333',
    },
  ] satisfies Project[],
};

/** Ids referenced by skills: experience stop ids, client ids, project ids. */
export type SkillRef = { type: 'job' | 'client' | 'project'; id: string };

export type Skill = { name: string; icon?: string; usedIn?: SkillRef[] };
export type SkillGroup = { id: string; title: string; proof: string; highlight?: boolean; items: Skill[] };

const job = (id: string): SkillRef => ({ type: 'job', id });
const client = (id: string): SkillRef => ({ type: 'client', id });
const project = (id: string): SkillRef => ({ type: 'project', id });

export const skills = {
  eyebrow: 'Tech stack',
  title: 'Full stack, end to end',
  hint: 'Everything I ship with. Hover or focus a tool to see where I used it.',
  usedInLabel: 'Used in',
  groups: [
    {
      id: 'languages',
      title: 'Languages',
      proof: '4 years shipping production web, mobile, and AI products',
      items: [
        { name: 'TypeScript', icon: 'typescript', usedIn: [job('lusso'), job('dinewise'), project('investor'), project('voice-ai'), project('llm-platform')] },
        { name: 'JavaScript', icon: 'javascript', usedIn: [job('ge'), job('cognizant')] },
        { name: 'Python', icon: 'pythonlang', usedIn: [project('voice-ai'), job('ge')] },
        { name: 'Rust', icon: 'rust', usedIn: [project('trading')] },
        { name: 'PHP', icon: 'php', usedIn: [project('payments')] },
        { name: 'Java', icon: 'java', usedIn: [job('ge')] },
        { name: 'SQL', usedIn: [job('dinewise'), job('cognizant')] },
        { name: 'HTML5 / CSS3' },
      ],
    },
    {
      id: 'frontend',
      title: 'Frontend & Mobile',
      proof: '21-page Next.js 16 store, ~117-route marketplace, React Native app',
      items: [
        { name: 'React 19', icon: 'react', usedIn: [job('dinewise'), client('86400'), project('investor'), project('ecommerce')] },
        { name: 'Next.js 16', icon: 'nextjs', usedIn: [client('hellonurse'), client('robprior'), client('heraforge'), project('voice-ai'), project('llm-platform'), project('ecommerce'), project('marketplace')] },
        { name: 'Vue 3 / Nuxt / Pinia', icon: 'vue', usedIn: [job('dinewise')] },
        { name: 'React Native / Expo', icon: 'reactnative', usedIn: [project('fitness')] },
        { name: 'Svelte', icon: 'svelte', usedIn: [job('dinewise')] },
        { name: 'Redux Toolkit / RTK Query', icon: 'redux', usedIn: [project('investor'), job('dinewise')] },
        { name: 'React Query', icon: 'reactquery' },
        { name: 'Zustand', usedIn: [project('fitness')] },
        { name: 'Tailwind CSS', icon: 'tailwind' },
        { name: 'shadcn/ui', icon: 'shadcn' },
        { name: 'Accessibility' },
      ],
    },
    {
      id: 'backend',
      title: 'Backend & Data',
      proof: 'Cut API latency from 1.2s to under 350ms; RLS-isolated multi-tenant Postgres',
      items: [
        { name: 'Node.js / Express', icon: 'nodejs', usedIn: [client('86400'), job('lusso')] },
        { name: 'Python / FastAPI', icon: 'fastapi', usedIn: [project('voice-ai')] },
        { name: 'Rust (Axum, Tokio)', icon: 'rust', usedIn: [project('trading')] },
        { name: 'Java / Spring Boot', icon: 'java', usedIn: [job('ge')] },
        { name: 'PostgreSQL (Neon, RLS)', icon: 'postgresql', usedIn: [project('voice-ai'), client('86400'), client('hellonurse'), project('ecommerce')] },
        { name: 'Supabase', icon: 'supabase', usedIn: [project('llm-platform')] },
        { name: 'Prisma', icon: 'prisma', usedIn: [client('hellonurse'), project('llm-platform')] },
        { name: 'Drizzle', icon: 'drizzle', usedIn: [project('ecommerce')] },
        { name: 'GraphQL', icon: 'graphql' },
        { name: 'REST / WebSockets' },
      ],
    },
    {
      id: 'payments',
      title: 'Payments & Commerce',
      proof: 'HMAC-signed checkout out of PCI scope; WooCommerce gateway across 7 releases',
      items: [
        { name: 'Stripe', icon: 'stripe', usedIn: [project('payments'), project('llm-platform'), project('marketplace')] },
        { name: 'WooCommerce plugins', icon: 'woocommerce', usedIn: [project('payments')] },
        { name: 'HMAC-signed hosted checkout', usedIn: [project('payments')] },
        { name: 'Idempotent webhooks', usedIn: [project('payments')] },
        { name: 'Order reconciliation', usedIn: [project('payments')] },
        { name: 'PCI-scope reduction', usedIn: [project('payments')] },
      ],
    },
    {
      id: 'ai',
      title: 'AI & Voice',
      proof: 'Voice AI platform, LLM platform for 100+ users, AI agents, and lusso.ai',
      items: [
        { name: 'Claude API / vision', icon: 'claude', usedIn: [project('ai-agents'), project('llm-platform'), project('fitness')] },
        { name: 'OpenRouter', usedIn: [project('llm-platform'), project('ai-agents')] },
        { name: 'Dify', usedIn: [project('llm-platform')] },
        { name: 'Pipecat', usedIn: [project('voice-ai')] },
        { name: 'Telnyx', usedIn: [project('voice-ai')] },
        { name: 'Real-time STT / LLM / TTS', usedIn: [project('voice-ai'), project('ai-agents')] },
        { name: 'AI agents & tool use', usedIn: [project('ai-agents'), project('marketplace')] },
        { name: 'RAG & streaming', usedIn: [job('dinewise'), project('llm-platform')] },
      ],
    },
    {
      id: 'web3',
      title: 'Web3',
      highlight: true,
      proof: 'Rust Solana trading dashboard, token launchpad, and cross-exchange arbitrage engine',
      items: [
        { name: 'Solana', icon: 'solana', usedIn: [project('trading'), project('launchpad'), project('arbitrage')] },
        { name: 'solana-sdk (Rust)', icon: 'rust', usedIn: [project('trading')] },
        { name: 'Jupiter swaps', usedIn: [project('trading'), project('arbitrage')] },
        { name: 'Raydium', usedIn: [project('launchpad')] },
        { name: 'Metaplex', usedIn: [project('launchpad')] },
        { name: 'Binance API', icon: 'binance', usedIn: [project('arbitrage')] },
        { name: 'Alpaca API', usedIn: [project('arbitrage')] },
        { name: 'Wallet vault (Argon2, AES-GCM)', usedIn: [project('trading')] },
      ],
    },
    {
      id: 'security',
      title: 'Auth, Messaging & Security',
      proof: 'Edge-middleware auth, Postgres-backed rate limiting, CSP, consent-gated analytics',
      items: [
        { name: 'Clerk', icon: 'clerk', usedIn: [project('voice-ai')] },
        { name: 'NextAuth / JWT', icon: 'jwt' },
        { name: 'Twilio', icon: 'twilio', usedIn: [client('hellonurse')] },
        { name: 'Resend', icon: 'resend' },
        { name: 'Edge middleware' , usedIn: [client('hellonurse')] },
        { name: 'Rate limiting & CSP' },
        { name: 'Consent-gated GA4 / Meta Pixel' },
      ],
    },
    {
      id: 'cloud',
      title: 'Cloud & Tooling',
      proof: 'Vercel Cron & Edge, AWS Amplify / S3 / CloudFront, CI test gates',
      items: [
        { name: 'Vercel', icon: 'vercel', usedIn: [client('robprior'), project('payments')] },
        { name: 'AWS', icon: 'aws', usedIn: [client('86400'), project('investor'), project('marketplace')] },
        { name: 'Docker', icon: 'docker' },
        { name: 'GitHub Actions', icon: 'githubactions' },
        { name: 'Jest / RTL', icon: 'jest' },
        { name: 'PyTest', icon: 'pytest' },
        { name: 'Puppeteer', icon: 'puppeteer' },
        { name: 'Agile / code review / CI/CD' },
      ],
    },
  ] satisfies SkillGroup[],
};

export const contact = {
  eyebrow: 'Contact',
  headline: "Let's build something.",
  sub: 'Open to full-time roles in DFW or remote.',
  links: [
    { id: 'email', label: 'Email', value: 'yeswanthravipati00@gmail.com', href: 'mailto:yeswanthravipati00@gmail.com' },
    { id: 'linkedin', label: 'LinkedIn', value: 'yeswanth-ravipati', href: 'https://www.linkedin.com/in/yeswanth-ravipati-ab752b1a0/' },
    /** Leave href empty to hide a button. */
    { id: 'github', label: 'GitHub', value: 'GitHub', href: '' },
    { id: 'resume', label: 'Download Resume', value: 'PDF', href: '/Yeswanth_Ravipati_Resume.pdf' },
  ],
};

/** Resolve a skill reference to a label and in-page anchor. */
export function resolveRef(ref: SkillRef): { label: string; href: string } {
  if (ref.type === 'job') {
    const s = experience.stops.find((x) => x.id === ref.id);
    return { label: s?.company ?? ref.id, href: '#experience' };
  }
  if (ref.type === 'client') {
    const c = clients.items.find((x) => x.id === ref.id);
    return { label: c?.name ?? ref.id, href: '#clients' };
  }
  const p = work.items.find((x) => x.id === ref.id);
  return { label: p?.title ?? ref.id, href: `#work-${ref.id}` };
}
