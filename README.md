# Rynxpense

AI-powered trip budget planner. Plan itineraries with estimated costs, track expenses during your trip, and share with friends.

## Stack

- **Web:** Next.js 16, Tailwind CSS v4, Prisma, Neon Postgres, Groq AI
- **Mobile:** Expo 53 (React Native)
- **Monorepo:** pnpm workspaces + Turborepo

## Getting started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example apps/web/.env.local
# Edit apps/web/.env.local with your DATABASE_URL and GROQ_API_KEY

# Generate Prisma client and push schema
pnpm db:generate
pnpm db:push

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page.  
Open [http://localhost:3000/app](http://localhost:3000/app) for the web app.

## Deploy to Vercel

1. Push this repo to GitHub
2. Import in Vercel, set root directory to `apps/web`
3. Add environment variables: `DATABASE_URL`, `GROQ_API_KEY`, `NEXT_PUBLIC_APP_URL`
4. Point `rynxpense.com` DNS to Vercel

## Project structure

```
rynxpense/
├── apps/
│   ├── web/          # Next.js landing + app + API
│   └── mobile/       # Expo React Native app
├── packages/
│   ├── shared/       # Zod schemas, types, helpers
│   └── ui-tokens/    # Design tokens (Klook/Agoda hybrid)
└── prisma/           # Database schema
```
