# Reddit Clone

Personal full-stack Reddit-style app: Next.js, AWS AppSync, DynamoDB. Posts, comments, voting, subreddits, OAuth (Reddit/Google).

## Tech stack

- **App:** Next.js 14, React 18, TypeScript, Tailwind, Apollo Client
- **Backend:** AWS AppSync (GraphQL), DynamoDB (single-table), NextAuth
- **Infra:** AWS CDK (TypeScript) in `infrastructure/`

## Setup

**1. Install and env**

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`: set `NEXTAUTH_URL`, `NEXTAUTH_SECRET` (32+ chars, e.g. `openssl rand -base64 32`), and optionally Reddit/Google OAuth. For AppSync, use the URL and API key from the infra deploy (step 2).

**2. Deploy AWS (first time)**

```bash
cd infrastructure
npm install
cdk bootstrap   # once per account/region
cdk deploy
```

Put the stack outputs `GraphQLAPIURL` and `GraphQLAPIKey` into `.env.local` as `NEXT_PUBLIC_APPSYNC_URL` and `NEXT_PUBLIC_APPSYNC_API_KEY`.

**3. Run**

```bash
npm run dev
```

Open http://localhost:3000

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check |
| `npm test` | Jest tests |

## Deploying the app

### Quick Start
```bash
# 1. Setup GitHub secrets
./scripts/setup-github-secrets.sh

# 2. Push to main (triggers automatic deployment)
git push origin main
```

See [QUICKSTART.md](QUICKSTART.md) for step-by-step guide.

### Manual Deployment
- **Build:** `npm run build` (works in CI without real secrets; uses placeholders for missing env).
- **Production:** Set real `NEXTAUTH_URL` and `NEXTAUTH_SECRET` (32+ chars) on your host (Vercel, etc.). Set `NEXT_PUBLIC_APPSYNC_URL` and `NEXT_PUBLIC_APPSYNC_API_KEY` from your CDK stack.

### CI/CD
GitHub Actions automatically deploys on push to `main`:
1. ✅ Runs tests (lint, type-check, unit, e2e)
2. ✅ Deploys AWS infrastructure (CDK)
3. ✅ Deploys frontend (Vercel)

See [.github/DEPLOYMENT.md](.github/DEPLOYMENT.md) for full documentation.

## Project layout

- `src/app` – Next.js app router pages and API routes
- `src/Components` – React components
- `src/context` – Providers (Apollo, NextAuth, EdgeStore)
- `src/lib` – Apollo client, env validation (Zod)
- `src/types` – TypeScript types and NextAuth augmentation
- `infrastructure/` – CDK stack (AppSync, DynamoDB, resolvers)
- `scripts/` – Setup and deploy helpers

## What’s in this repo

- **App:** Next.js app with GraphQL (Apollo) talking to AppSync; env validated in `src/lib/env.ts`; NextAuth session extended with `user.id`.
- **Infra:** CDK stack for AppSync + DynamoDB single table; VTL resolvers in `infrastructure/resolvers/`; multi-env (dev/staging/production) via `ENVIRONMENT`.
- **Tooling:** ESLint, Jest, Prettier, Husky; GitHub Actions for lint/type-check/build and optional CDK deploy.
- **Build:** NextAuth types, Apollo error typing, env defaults for CI, test files excluded from main `tsconfig`, small ESLint/ErrorBoundary/PostBox fixes so `npm run build` passes.
