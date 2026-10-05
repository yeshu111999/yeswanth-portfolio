# Yeswanth Ravipati — Portfolio

Next.js 14 (App Router) · TypeScript · Tailwind · React Three Fiber · Framer Motion · GSAP ScrollTrigger · Lenis

## Edit content
Every piece of text, metric, and link lives in [`data/content.ts`](data/content.ts).
- GitHub button: set `href` on the `github` entry in `contact.links` (empty = hidden).
- Resume: replace `public/Yeswanth_Ravipati_Resume.pdf`.
- Client screenshots: `public/clients/<id>-desktop.jpg` (1440×900) and `<id>-mobile.jpg` (390×844).
- Site URL for SEO/Open Graph: set `NEXT_PUBLIC_SITE_URL` in Vercel.

## Develop
```bash
npm install
npm run dev
```

## Deploy
Import the folder in Vercel (framework preset: Next.js). No env vars are required.

## Performance notes
- Each 3D scene is lazy-loaded (`components/three/LazyCanvas.tsx`) and stops rendering offscreen; DPR is capped at 2.
- Mobile gets fewer particles and no bloom; the client galaxy becomes a swipeable card carousel.
- `prefers-reduced-motion` disables smooth scroll, the loader, morphs, and swaps the 3D route for a static timeline.
