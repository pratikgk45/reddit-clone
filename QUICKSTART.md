# 🚀 Quick Deployment Guide

## One-Time Setup (5 minutes)

### 1. Setup AWS IAM Role
```bash
./scripts/create-iam-role.sh
```
Copy the Role ARN output.

### 2. Configure GitHub Secrets
```bash
./scripts/setup-github-secrets.sh
```
Or manually add secrets in GitHub Settings → Secrets.

### 3. Deploy Infrastructure
```bash
# Option A: Push to main
git push origin main

# Option B: Manual trigger
gh workflow run deploy.yml
```

### 4. Update AppSync Secrets
After infrastructure deploys:
```bash
cd infrastructure
cdk deploy --outputs-file outputs.json

# Add to GitHub secrets
gh secret set NEXT_PUBLIC_APPSYNC_URL --body "$(jq -r '.RedditStack.GraphQLAPIURL' outputs.json)"
gh secret set NEXT_PUBLIC_APPSYNC_API_KEY --body "$(jq -r '.RedditStack.GraphQLAPIKey' outputs.json)"
```

## Daily Workflow

### Deploy Changes
```bash
git add .
git commit -m "Your changes"
git push origin main
```
✅ Automatic deployment triggered!

### Monitor Deployment
```bash
# View workflow status
gh run list

# Watch live logs
gh run watch
```

### Manual Deployment
```bash
# Trigger deployment
gh workflow run deploy.yml

# With specific environment
gh workflow run deploy.yml -f environment=staging
```

## Required GitHub Secrets

### Minimum (Required)
- `AWS_DEPLOY_ROLE_ARN` - IAM role for deployment
- `AWS_ACCOUNT_ID` - Your AWS account ID
- `NEXTAUTH_SECRET` - 32+ character secret
- `NEXTAUTH_URL` - Production URL

### After First Deploy
- `NEXT_PUBLIC_APPSYNC_URL` - From CDK output
- `NEXT_PUBLIC_APPSYNC_API_KEY` - From CDK output

### Optional
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` - For Vercel
- `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` - For Reddit OAuth
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - For Google OAuth

## Deployment Flow

```
Push to main
    ↓
CI Checks (lint, test, build)
    ↓
Deploy Infrastructure (CDK)
    ↓
Deploy Frontend (Vercel)
    ↓
✅ Live!
```

## Useful Commands

```bash
# View secrets
gh secret list

# Update a secret
gh secret set SECRET_NAME --body "value"

# View workflows
gh workflow list

# View recent runs
gh run list --limit 5

# Cancel a run
gh run cancel <run-id>

# Re-run failed jobs
gh run rerun <run-id>

# View deployment logs
gh run view <run-id> --log
```

## Troubleshooting

### "No credentials" error
→ Check `AWS_DEPLOY_ROLE_ARN` is correct

### Build fails
→ Verify all required secrets are set: `gh secret list`

### Vercel deploy skipped
→ Add `VERCEL_TOKEN` secret

### AppSync 404 errors
→ Update `NEXT_PUBLIC_APPSYNC_URL` and `NEXT_PUBLIC_APPSYNC_API_KEY`

## Links

- **Actions**: https://github.com/YOUR_USERNAME/reddit-2/actions
- **Secrets**: https://github.com/YOUR_USERNAME/reddit-2/settings/secrets/actions
- **AWS Console**: https://console.aws.amazon.com/cloudformation
- **Vercel Dashboard**: https://vercel.com/dashboard

## Support

Full documentation: `.github/DEPLOYMENT.md`
