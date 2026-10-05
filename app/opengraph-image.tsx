import { readFileSync } from 'fs';
import { join } from 'path';
import { ImageResponse } from 'next/og';
import { site, hero } from '@/data/content';

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  const avatar = `data:image/jpeg;base64,${readFileSync(join(process.cwd(), 'public', site.photos.avatar)).toString('base64')}`;
  const dots = Array.from({ length: 90 }, (_, i) => {
    const a = i * 2.39996;
    const r = 210 * Math.sqrt((i + 0.5) / 90);
    return { x: 900 + Math.cos(a) * r, y: 315 + Math.sin(a) * r, s: 3 + (i % 4), gold: i % 7 === 0 };
  });
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'radial-gradient(circle at 75% 50%, #2e2414 0%, #0A0A0B 55%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        {dots.map((d, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: d.x,
              top: d.y,
              width: d.s,
              height: d.s,
              borderRadius: 99,
              background: d.gold ? '#D4B483' : '#E6D3AE',
              boxShadow: d.gold ? '0 0 12px #D4B483' : '0 0 10px #B08D57',
            }}
          />
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar}
          alt=""
          width={300}
          height={300}
          style={{ position: 'absolute', left: 750, top: 165, borderRadius: 999, border: '4px solid #D4B483', boxShadow: '0 0 60px rgba(176,141,87,0.8)' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, width: 760 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, color: '#CFC8BC' }}>
            <div style={{ width: 12, height: 12, borderRadius: 99, background: '#2EE6A0', boxShadow: '0 0 12px #2EE6A0' }} />
            {hero.status}
          </div>
          <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -3, lineHeight: 1, marginTop: 28 }}>{site.name}</div>
          <div style={{ fontSize: 32, color: '#CFC8BC', marginTop: 24, lineHeight: 1.3 }}>{hero.tagline}</div>
          <div style={{ fontSize: 22, color: '#D4B483', marginTop: 28 }}>{hero.stack.join('  |  ')}</div>
        </div>
      </div>
    ),
    size,
  );
}
