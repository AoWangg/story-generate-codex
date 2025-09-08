# AI Story Generator

Live: https://story.orville.wang/

A Next.js app that turns your prompts into illustrated short stories. Text is generated via an OpenAI-compatible API, images are generated asynchronously, and stories are saved locally for guests or to Supabase for logged-in users. The app includes mobile-friendly UX, Open Graph/Twitter cards, and downloadable story/image assets.

## Features
- Generate short stories with Markdown formatting
- Async image generation and easy downloads
- Local history for guests; Supabase sync when logged in
- Mobile UI with robust overflow/word-wrap handling
- Open Graph & Twitter cards; site icons

## Tech Stack
- Next.js 13 App Router (Edge runtime)
- Tailwind CSS + Radix UI + shadcn/ui
- Supabase (Auth + Postgres)
- `openai` SDK (DashScope-compatible base URL)

## Getting Started
1) Install dependencies
- `npm install` (or `yarn`, `pnpm i`)

2) Environment variables (`.env.local`)
- `NEXT_PUBLIC_SITE_URL` — e.g. `https://story.orville.wang`
- `OPENAI_API_KEY` — DashScope key (used for text + image)
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — optional server ops if needed

3) Run dev
- `npm run dev` then open `http://localhost:3000`

## Supabase Setup
- Create a Supabase project and get URL + anon key.
- Apply schema from `supabase/migrations` (`stories`, `conversations`, `messages`). Run in order via SQL editor.
- Enable desired auth providers (email, GitHub, etc.).

Data model notes
- `stories` holds canonical story records (title/theme/content/image_url/created_at). History page reads from this table for logged-in users.
- New generations insert/update `stories.image_url` so images persist.
- `conversations`/`messages` keep a chat trail (optional for history UI).

## Deployment
- Set env vars on your host (Vercel, etc.). Ensure `NEXT_PUBLIC_SITE_URL` matches your domain.
- App router exposes:
  - Global metadata via `app/layout.tsx`
  - OG/Twitter images at `/opengraph-image` and `/twitter-image`

## Customization
- Update site name, colors, and copy in `app/layout.tsx` and `app/*-image.tsx`.
- Replace icons in `app/icon.svg` and `app/apple-icon.svg`.
- Adjust components under `components/` as needed.

## Scripts
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run production build

## Notes
- Generated image URLs are external; for permanence, upload to Supabase Storage and store the path in `stories.image_url`.

## License
Provided as-is by the repository owner. No explicit license is included; contact the author for usage beyond local evaluation.

