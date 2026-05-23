# cold-monster

AI-powered cold outreach for students applying to startups and research labs.

Upload a resume, paste a target URL (company site, lab page, founder profile), and get a short, personalized cold email that references the target's recent work and connects it to the sender's background.

## Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- **Tailwind CSS** + shadcn/ui (Radix primitives)
- **Supabase** — auth (Google OAuth) + Postgres for user profiles
- **OpenAI** — resume parsing, research synthesis, draft generation
- **Firecrawl** — scrape target URLs into clean markdown
- **Hunter.io** — email lookup
- **Vercel AI SDK**

## Project layout

```
app/
  api/             route handlers (auth, parse, research, draft, generate, profile)
  layout.tsx
  page.tsx         single-page command center UI
components/ui/     shadcn primitives
lib/
  prompts.ts       prompt templates for parse/research/draft
  supabase/        client, server, and service-role helpers
  utils.ts
supabase/
  migrations/      SQL schema
```

## Local setup

```bash
git clone https://github.com/<you>/cold-monster.git
cd cold-monster
npm install
cp .env.example .env.local   # fill in keys
npm run dev
```

### Environment variables

See [`.env.example`](.env.example). You'll need:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `FIRECRAWL_API_KEY`
- `HUNTER_API_KEY`
- `NEXT_PUBLIC_SITE_URL` (optional — auto-detected on Vercel)

### Database

Run the SQL in [`supabase/migrations/`](supabase/migrations/) against your Supabase project before first use.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — eslint

## Status

Work-in-progress side project. No stability guarantees; APIs and schema may change without notice.
