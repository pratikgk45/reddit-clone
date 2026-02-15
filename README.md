# Reddit Clone

Full-stack Reddit-style application built with Next.js, AWS AppSync, and DynamoDB. Features posts, comments, voting, subreddits, and OAuth authentication.

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Apollo Client
- **Backend:** AWS AppSync (GraphQL), DynamoDB (single-table design)
- **Auth:** NextAuth.js with Reddit and Google OAuth
- **Infrastructure:** AWS CDK (ECS Fargate, ALB, AppSync, DynamoDB)
- **CI/CD:** GitHub Actions

## Live Demo

🔗 **http://reddit-clone-alb-999046169.us-east-1.elb.amazonaws.com**

## Features

- Create and browse posts with images
- Upvote/downvote system
- Nested comments
- Subreddit communities
- OAuth login (Reddit & Google)
- Real-time updates via GraphQL subscriptions
- Responsive design

## Local Development

### Prerequisites

- Node.js 18+
- AWS Account (for backend)
- Reddit OAuth App ([create here](https://www.reddit.com/prefs/apps))
- Google OAuth App ([create here](https://console.cloud.google.com/apis/credentials))

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
   
   # OAuth Providers
   REDDIT_CLIENT_ID=<your-reddit-client-id>
   REDDIT_CLIENT_SECRET=<your-reddit-client-secret>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   
   # AWS AppSync (from infrastructure deployment)
   NEXT_PUBLIC_APPSYNC_URL=<your-appsync-url>
   NEXT_PUBLIC_APPSYNC_API_KEY=<your-appsync-api-key>
   ```

3. **Deploy AWS infrastructure**
   ```bash
   cd infrastructure
   npm install
   cdk bootstrap  # first time only
   cdk deploy
   ```
   
   Copy the `GraphQLAPIURL` and `GraphQLAPIKey` outputs to your `.env.local`.

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000

## Deployment

The app automatically deploys to AWS ECS Fargate when you push to `main`:

1. **Configure GitHub Secrets** (Settings → Secrets → Actions):
   ```
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   AWS_ACCOUNT_ID
   AWS_REGION
   NEXT_PUBLIC_APPSYNC_URL
   NEXT_PUBLIC_APPSYNC_API_KEY
   NEXTAUTH_URL
   NEXTAUTH_SECRET
   REDDIT_CLIENT_ID
   REDDIT_CLIENT_SECRET
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   ```

2. **Push to main**
   ```bash
   git push origin main
   ```

GitHub Actions will:
- Run tests (lint, type-check, unit tests)
- Deploy infrastructure (CDK)
- Build and deploy Docker container to ECS

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |
| `npm test` | Run Jest tests |

## Project Structure

```
├── src/
│   ├── app/              # Next.js app router pages
│   ├── Components/       # React components
│   ├── context/          # Context providers (Apollo, NextAuth)
│   ├── lib/              # Apollo client, utilities
│   └── types/            # TypeScript types
├── infrastructure/       # AWS CDK stack
│   ├── lib/
│   │   ├── reddit-stack.ts    # AppSync + DynamoDB
│   │   └── ecs-stack.ts       # ECS Fargate + ALB
│   └── resolvers/        # VTL resolvers
└── .github/workflows/    # CI/CD pipelines
```

## Architecture

- **Frontend:** Next.js app running in ECS Fargate container
- **API:** AWS AppSync GraphQL API with DynamoDB resolvers
- **Database:** DynamoDB single-table design
- **Load Balancer:** Application Load Balancer (ALB)
- **Auth:** NextAuth.js with OAuth providers

## OAuth Configuration

### Reddit OAuth
1. Go to https://www.reddit.com/prefs/apps
2. Create app with callback: `<your-domain>/api/auth/callback/reddit`

### Google OAuth
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth client with callback: `<your-domain>/api/auth/callback/google`

## License

MIT
