# Deploy Rynxpense to Vercel

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Neon Postgres database ([neon.tech](https://neon.tech))
- Groq API key ([console.groq.com](https://console.groq.com))

## Step 1: Push to GitHub

```bash
cd ~/Projects/rynxpense
git add -A
git commit -m "Initial Rynxpense travel rebuild"
gh repo create rynxpense --private --source=. --push
```

## Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `rynxpense` GitHub repo
3. Set **Root Directory** to `apps/web`
4. Framework Preset: **Next.js** (auto-detected)

## Step 3: Environment Variables

Add these in Vercel project settings:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon Postgres connection string |
| `GROQ_API_KEY` | Your Groq API key |
| `NEXT_PUBLIC_APP_URL` | `https://rynxpense.com` |

## Step 4: Deploy Database Schema

After first deploy, run locally against production DB:

```bash
cd ~/Projects/rynxpense
DATABASE_URL="your-neon-url" pnpm db:push
```

## Step 5: Custom Domain

1. In Vercel → Project → Settings → Domains
2. Add `rynxpense.com` and `www.rynxpense.com`
3. Update DNS at your registrar:
   - `A` record → `76.76.21.21` (Vercel)
   - `CNAME` for `www` → `cname.vercel-dns.com`
4. Remove old GitHub Pages CNAME if still pointing to old landing repo

## Step 6: Verify

- [ ] Landing page loads at https://rynxpense.com
- [ ] `/app` shows discover home
- [ ] `/app/trips/new` generates a trip (uses mock data if no Groq key)
- [ ] `/trip/[slug]` share links work after creating a trip

## CLI Deploy (alternative)

```bash
cd ~/Projects/rynxpense/apps/web
pnpm dlx vercel login
pnpm dlx vercel --prod
```
