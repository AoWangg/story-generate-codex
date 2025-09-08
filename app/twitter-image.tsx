import { ImageResponse } from 'next/server';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function TwitterImage() {
  const title = 'AI Story Generator';
  const subtitle = 'Turn prompts into illustrated stories';
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#0EA5E9',
          color: '#fff',
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '0 80px' }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="64" height="64" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M128 52c6 0 11 3 13 9l10 28 30 10c6 2 9 7 9 13s-3 11-9 13l-30 10-10 30c-2 6-7 9-13 9s-11-3-13-9l-10-30-30-10c-6-2-9-7-9-13s3-11 9-13l30-10 10-28c2-6 7-9 13-9z" fill="#fff" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
            <div style={{ fontSize: 28, opacity: 0.95, marginTop: 12 }}>{subtitle}</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

