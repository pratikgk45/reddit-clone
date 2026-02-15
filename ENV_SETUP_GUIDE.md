# 🔐 Environment Variables Setup Guide

## Current Status

You already have these values in `.env.local`:
- ✅ NEXT_PUBLIC_APPSYNC_URL
- ✅ NEXT_PUBLIC_APPSYNC_API_KEY
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL
- ✅ REDDIT_CLIENT_ID & SECRET
- ✅ GOOGLE_CLIENT_ID & SECRET

## Quick Setup (Recommended)

### Option 1: Automated Script
```bash
./scripts/set-secrets-from-env.sh
```
This will read from your `.env.local` and set all GitHub secrets automatically.

### Option 2: Manual Setup
```bash
# Install GitHub CLI if needed
brew install gh

# Login
gh auth login

# Set secrets from .env.local
gh secret set NEXT_PUBLIC_APPSYNC_URL --body "https://vvo325kdfbaxbc7ro3rnrkxxqu.appsync-api.us-east-2.amazonaws.com/graphql"
gh secret set NEXT_PUBLIC_APPSYNC_API_KEY --body "da2-n5j35p2cxfaazdvmhgjjbbh2o4"
gh secret set NEXTAUTH_SECRET --body "pikapika"
gh secret set NEXTAUTH_URL --body "http://localhost:3000"
gh secret set REDDIT_CLIENT_ID --body "eHUkaknDr56SCYxPP_NQEA"
gh secret set REDDIT_CLIENT_SECRET --body "GQUMeoVilaUoX2Xa5RVfn3H2bA0Z5A"
gh secret set GOOGLE_CLIENT_ID --body "1064224642084-t56k8vi944joh7iqk2ello7glgj4hh5p.apps.googleusercontent.com"
gh secret set GOOGLE_CLIENT_SECRET --body "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"
```

### Option 3: GitHub Web UI
1. Go to: https://github.com/pratikgk45/reddit-clone/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret from your `.env.local` file

## Missing Secrets (For Deployment)

### AWS Deployment Secrets

#### 1. AWS_ACCOUNT_ID
**What it is:** Your 12-digit AWS account ID

**How to get it:**
```bash
# If you have AWS CLI configured
aws sts get-caller-identity --query Account --output text

# Or login to AWS Console and check top-right corner
```

**Set it:**
```bash
gh secret set AWS_ACCOUNT_ID --body "YOUR_ACCOUNT_ID"
```

#### 2. AWS_DEPLOY_ROLE_ARN
**What it is:** IAM role ARN for GitHub Actions to deploy to AWS

**How to get it:**

**Option A: Use our script (Recommended)**
```bash
./scripts/create-iam-role.sh
```

**Option B: Manual creation**
1. Go to AWS IAM Console → Roles → Create Role
2. Select "Web Identity"
3. Identity provider: `token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Add condition:
   - Key: `token.actions.githubusercontent.com:sub`
   - Value: `repo:pratikgk45/reddit-clone:ref:refs/heads/main`
6. Attach policy: `AdministratorAccess` (or custom CDK policy)
7. Name: `GitHubActionsDeployRole`
8. Copy the Role ARN (looks like: `arn:aws:iam::123456789012:role/GitHubActionsDeployRole`)

**Set it:**
```bash
gh secret set AWS_DEPLOY_ROLE_ARN --body "arn:aws:iam::YOUR_ACCOUNT_ID:role/GitHubActionsDeployRole"
```

## Verify Secrets

```bash
# List all secrets
gh secret list

# Should show:
# NEXT_PUBLIC_APPSYNC_URL
# NEXT_PUBLIC_APPSYNC_API_KEY
# NEXTAUTH_SECRET
# NEXTAUTH_URL
# REDDIT_CLIENT_ID
# REDDIT_CLIENT_SECRET
# GOOGLE_CLIENT_ID
# GOOGLE_CLIENT_SECRET
# AWS_ACCOUNT_ID (for deployment)
# AWS_DEPLOY_ROLE_ARN (for deployment)
```

## Update Production URL

Once you deploy to production, update:
```bash
gh secret set NEXTAUTH_URL --body "https://your-production-url.com"
```

## Test Deployment

After setting AWS secrets:
```bash
# Trigger deployment manually
gh workflow run deploy.yml

# Or push to main
git push origin main

# Watch progress
gh run watch
```

## Troubleshooting

### "gh: command not found"
```bash
# macOS
brew install gh

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### "Not logged in"
```bash
gh auth login
# Follow prompts
```

### "AWS CLI not configured"
```bash
aws configure
# Enter your AWS Access Key ID and Secret Access Key
```

### "Can't find AWS Account ID"
Login to AWS Console → Click your name in top-right → Account ID is shown

## Summary

**For CI to pass:**
- ✅ Already have all needed values in `.env.local`
- ✅ Just need to copy them to GitHub secrets

**For deployment to work:**
- ⚠️ Need AWS_ACCOUNT_ID
- ⚠️ Need AWS_DEPLOY_ROLE_ARN

**Quick command:**
```bash
./scripts/set-secrets-from-env.sh
```
